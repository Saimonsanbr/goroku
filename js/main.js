// Ponto de entrada do app - importa e orquestra todos os módulos

import { CONFIG } from './config.js';
import { initBackground } from './background.js';
import { handlePlay, handleDownload, stopCurrent } from './audio.js';
import { renderCard, renderEmptyState, updateStatus } from './renderer.js';
import { createSearchHandler } from './search.js';
import { initPagination, resetPagination } from './pagination.js';

// Estado global
let allPhrases = [];
let currentResults = [];
let currentQuery = '';

// Elementos do DOM
const phraseList = document.getElementById('phraseList');

// Handler de busca (usar LET para permitir reatribuição após carregar dados)
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
}

// Inicializa o handler de busca
function initSearch(phrases) {
    searchHandler = createSearchHandler(phrases, renderResults);
}

// Event delegation para botões de áudio (usando capture para garantir)
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

        // Atualiza UI inicial
        updateStatus(allPhrases.length, allPhrases.length, '');

        // Inicializa busca com os dados carregados
        initSearch(allPhrases);

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