// Ponto de entrada do app - integra deck builder

import { CONFIG } from './config.js';
import { initBackground } from './background.js';
import { handlePlay, handleDownload, stopCurrent } from './audio.js';
import { renderCard, renderEmptyState, updateStatus } from './renderer.js';
import { createSearchHandler } from './search.js';
import { initPagination, resetPagination } from './pagination.js';
import { initDeckUI, updateAddToDeckButtons } from './deck-ui.js';

// Estado global
let allPhrases = [];
let currentResults = [];
let currentQuery = '';

// Elementos do DOM
const phraseList = document.getElementById('phraseList');

// Handler de busca
let searchHandler = null;

// Inicializa animação de fundo
initBackground();

// Função para atualizar a UI com os resultados
function renderResults(results, query) {
    currentResults = results;
    currentQuery = query;
    resetPagination();
    phraseList.innerHTML = '';
    initPagination(phraseList, currentResults, currentQuery, (phrase, q) =>
        phrase ? renderCard(phrase, q, 0) : renderEmptyState()
    );
    // Atualizar botões do deck após renderizar
    setTimeout(updateAddToDeckButtons, 100);
}

// Inicializar handlers
function initApp(phrases) {
    // Inicializar busca
    searchHandler = createSearchHandler(phrases, renderResults);

    // Inicializar UI do deck
    initDeckUI(phraseList, allPhrases, 'https://www.youtube.com/embed/ayx9WvHMHU8?si=yZquyUPyqGGr3jWs');
}

// Event delegation para botões de áudio
phraseList.addEventListener('click', (e) => {
    const btn = e.target.closest('.audio-btn');
    if (!btn) return;

    const card = btn.closest('.phrase-card');
    if (!card) return;

    if (btn.dataset.action === 'play') {
        handlePlay(card, btn);
    } else if (btn.dataset.action === 'download') {
        handleDownload(card, btn);
    }
});

// Carrega dados do JSON
async function loadData() {
    try {
        const res = await fetch(CONFIG.DATA_FILE);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        allPhrases = await res.json();

        // Garantir que cada frase tenha um id único
        allPhrases = allPhrases.map((p, i) => ({
            ...p,
            id: p.id || `${p.source}_${i}_${Date.now()}`
        }));

        // Atualiza UI inicial
        updateStatus(allPhrases.length, allPhrases.length, '');

        // Inicializar app com os dados
        initApp(allPhrases);

        // Renderiza lista inicial
        renderResults(allPhrases, '');

    } catch (err) {
        phraseList.innerHTML = renderEmptyState(
            'Erro ao carregar o arquivo traduzido_pt.json. Certifique-se que o arquivo está na mesma pasta.',
            '？'
        );
        updateStatus(0, 0, '');
        console.error('Falha ao carregar JSON:', err);
    }
}

// Inicializa o app quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
} else {
    loadData();
}