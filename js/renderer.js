// Renderização de cards e UI

import { ICONS } from './config.js';
import { escapeHtml, highlight, extractLevel, sourceLabel } from './utils.js';
import { CONFIG } from './config.js';

export function setPlayState(btn, state) {
    btn.classList.remove('state-loading', 'state-playing', 'state-error');
    if (state === 'loading') {
        btn.classList.add('state-loading');
        btn.innerHTML = ICONS.SPIN;
    } else if (state === 'playing') {
        btn.classList.add('state-playing');
        btn.innerHTML = ICONS.PAUSE;
    } else if (state === 'error') {
        btn.classList.add('state-error');
        btn.innerHTML = ICONS.ERR;
        setTimeout(() => {
            if (btn.isConnected) {
                btn.innerHTML = ICONS.PLAY;
                btn.classList.remove('state-error');
            }
        }, 2500);
    } else {
        btn.innerHTML = ICONS.PLAY;
    }
}

export function renderCard(phrase, query, index) {
    const level = extractLevel(phrase.source);
    const src = sourceLabel(phrase.source);
    const delay = (index % CONFIG.PAGE_SIZE) * 15;
    const hasAudio = !!phrase.audio_jap;
    const noAudio = hasAudio ? '' : ' no-audio';
    // ... dentro de renderCard, após a definição de noAudio ...

    // Verificar se já está no deck (para estado inicial do botão)
    const inDeck = false; // Será atualizado via JS após carregar

    return `
<article class="phrase-card" style="animation-delay:${delay}ms"
         data-audio="${escapeHtml(phrase.audio_jap || '')}"
         data-card-id="${phrase.id}">
  <div class="card-top">
    <div class="card-text">
      <div class="phrase-jap">${highlight(phrase.jap, query)}</div>
      <div class="phrase-pt">${highlight(phrase['pt-br'], query)}</div>
    </div>
    <div class="audio-controls">
      <button class="audio-btn btn-play${noAudio}" title="Reproduzir" data-action="play">${ICONS.PLAY}</button>
      <button class="audio-btn btn-dl${noAudio}" title="Baixar áudio" data-action="download">${ICONS.DL}</button>
    </div>
  </div>
  <div class="card-bottom">
    <div class="phrase-meta">
      <span class="tag">fonte: ${escapeHtml(src)}</span>
      ${level ? `<span class="tag tag-level">${level}</span>` : ''}
    </div>
    <!-- Botão Adicionar ao Deck -->
    <button class="add-to-deck-btn ${inDeck ? 'in-deck' : ''}" 
            title="${inDeck ? 'Já está no deck' : 'Adicionar ao deck'}"
            ${inDeck ? 'disabled' : ''}>
      ${inDeck ? '✓' : '+'}
    </button>
  </div>
</article>`;

}

export function renderEmptyState(message = 'Ops! Nenhuma frase encontrada para essa busca.', kanji = '無') {
    return `
<div class="empty-state">
  <span class="kanji-big">${kanji}</span>
  <p>${message}</p>
</div>`;
}

export function renderLoading() {
    return '<div class="loading">carregando</div>';
}

export function updateStatus(count, total, query) {
    const statusCount = document.getElementById('statusCount');
    const statusHint = document.querySelector('.status-hint');

    statusCount.innerHTML = query
        ? `<strong>${count.toLocaleString('pt-BR')}</strong> resultado${count !== 1 ? 's' : ''} de ${total.toLocaleString('pt-BR')}`
        : `<strong>${total.toLocaleString('pt-BR')}</strong> frases no banco`;

    statusHint.textContent = query
        ? `pesquisando: "${query}"`
        : 'busque em japonês ou português';
}