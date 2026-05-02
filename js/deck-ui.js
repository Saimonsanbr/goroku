// js/deck-ui.js
// UI do Deck Builder: modal, botões, interações

import {
    addToDeck, removeFromDeck, updateDeckCard, restoreOriginalCard,
    getDeckCards, clearDeck, getDeckCount
} from './deck.js';
import { exportDeck } from './export.js';
import { isAnkiConnectAvailable, getAnkiDecks } from './anki-connect.js';
import { escapeHtml, isMobile } from './utils.js';
import { db } from './db.js';
import { CONFIG } from './config.js';
import {
    shouldShowDeckHint,
    showDeckOnboarding,
    markDeckHintShown
} from './onboarding.js';

// Estado interno
let allPhrases = [];
let currentEditCard = null;
let audioPreview = null;
let exportMethod = null;
let tutorialVideoUrl = '';

// ═══════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════

export function initDeckUI(phraseListEl, phrases, videoUrl = '') {
    allPhrases = phrases;
    tutorialVideoUrl = videoUrl;
    updateDeckCounter();
    setupEventListeners(phraseListEl);
    observeDeckChanges();
    initTutorialModal();
}

// ═══════════════════════════════════════════════════
// CONTADOR E OBSERVER
// ═══════════════════════════════════════════════════

async function updateDeckCounter() {
    const count = await getDeckCount();
    const btn = document.getElementById('deckCounterBtn');
    const badge = btn?.querySelector('.deck-count');
    const modalCount = document.getElementById('modalCardCount');

    if (badge) badge.textContent = count;
    if (modalCount) modalCount.textContent = `(${count})`;
    toggleDeckEmptyState(count === 0);
}

function observeDeckChanges() {
    setInterval(updateDeckCounter, 1000);
}

// ═══════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════

function setupEventListeners(phraseListEl) {
    // Abrir modal do deck
    document.getElementById('deckCounterBtn')?.addEventListener('click', openDeckModal);

    // Fechar modais
    document.getElementById('modalCloseBtn')?.addEventListener('click', closeDeckModal);
    document.getElementById('editCloseBtn')?.addEventListener('click', closeEditModal);
    document.getElementById('exportCloseBtn')?.addEventListener('click', closeExportModal);
    document.getElementById('exportAgainBtn')?.addEventListener('click', closeExportModal);

    // Fechar ao clicar fora
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.hidden = true;
        });
    });

    // Limpar deck
    document.getElementById('clearDeckBtn')?.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja limpar todo o deck?')) {
            await clearDeck();
            await renderDeckList();
            await updateAddToDeckButtons();
        }
    });

    // Abrir fluxo de exportação
    document.getElementById('exportBtn')?.addEventListener('click', startExport);

    // Handlers dos dois métodos de exportação
    document.getElementById('exportTxtBtn')?.addEventListener('click', () => selectExportMethod('txt'));
    document.getElementById('exportAnkiBtn')?.addEventListener('click', async () => {
        const available = await isAnkiConnectAvailable();
        if (available) {
            selectExportMethod('ankiconnect');
        } else {
            alert('AnkiConnect não detectado. Mantenha o Anki aberto e instale o add-on AnkiConnect para usar esta opção.');
        }
    });

    // Confirmar exportação
    document.getElementById('exportConfirmBtn')?.addEventListener('click', confirmExport);

    // Cancelar/voltar
    document.getElementById('exportCancelBtn')?.addEventListener('click', handleExportCancel);

    // Form de edição
    document.getElementById('editForm')?.addEventListener('submit', handleEditSubmit);
    document.getElementById('editCancelBtn')?.addEventListener('click', closeEditModal);
    document.getElementById('restoreOriginalBtn')?.addEventListener('click', handleRestoreOriginal);

    // Play audio no modal de edição
    document.getElementById('editAudioPlay')?.addEventListener('click', playEditAudio);

    // Delegação para botões "Adicionar ao deck" nos cards
    phraseListEl?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.add-to-deck-btn');
        if (!btn) return;

        const card = btn.closest('.phrase-card');
        if (!card) return;

        const phraseId = card.dataset.cardId;
        const phrase = allPhrases.find(p => p.id == phraseId);
        if (!phrase) return;

        const result = await addToDeck(phrase, allPhrases);

        if (result.success) {
            // ✅ Se já foi exportado antes, confirmar com usuário
            if (result.wasExportedBefore) {
                const confirmMsg = result.exportCount > 1
                    ? `Você já exportou esta frase ${result.exportCount} vezes antes. Deseja adicioná-la ao deck novamente?`
                    : 'Você já exportou esta frase antes. Deseja adicioná-la ao deck novamente?';

                if (!confirm(confirmMsg)) {
                    await removeFromDeck(phrase.id);
                    return;
                }
            }

            // Atualizar UI do botão
            btn.classList.add('in-deck');
            btn.innerHTML = '✓';
            btn.title = 'Já está no deck';
            btn.disabled = true;
            updateDeckCounter();

            // ✅ Trigger onboarding se for primeira vez adicionando card
            if (await shouldShowDeckHint()) {
                showDeckOnboarding();
                markDeckHintShown();
            }

            if (document.getElementById('deckModal')?.hidden === false) {
                await renderDeckList();
            }
        } else if (result.reason === 'already_in_deck') {
            btn.classList.add('in-deck');
            btn.innerHTML = '✓';
            btn.title = 'Já está no deck';
        }
    });
}

// ═══════════════════════════════════════════════════
// MODAL DO DECK
// ═══════════════════════════════════════════════════

async function openDeckModal() {
    const modal = document.getElementById('deckModal');
    if (!modal) return;
    modal.hidden = false;
    await renderDeckList();
}

function closeDeckModal() {
    document.getElementById('deckModal').hidden = true;
}

async function renderDeckList() {
    const listEl = document.getElementById('deckList');
    const emptyEl = document.getElementById('deckEmpty');
    const cards = await getDeckCards();

    if (cards.length === 0) {
        listEl.innerHTML = '';
        emptyEl.hidden = false;
        return;
    }

    emptyEl.hidden = true;
    listEl.innerHTML = cards.map(card => `
        <div class="deck-item" data-id="${card.id}">
            <div class="deck-item-text">
                <div class="deck-item-jp">${escapeHtml(card.jap)}</div>
                <div class="deck-item-pt">${escapeHtml(card.pt)}</div>
            </div>
            <div class="deck-item-actions">
                <button class="deck-item-btn edit" title="Editar" data-action="edit">✏️</button>
                <button class="deck-item-btn remove" title="Remover" data-action="remove">🗑️</button>
            </div>
        </div>
    `).join('');

    // Eventos dos botões da lista
    listEl.querySelectorAll('[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cardEl = e.target.closest('.deck-item');
            const id = cardEl?.dataset.id;
            if (id) {
                await removeFromDeck(id);
                await renderDeckList();
                await updateDeckCounter();
                await updateAddToDeckButtons();
            }
        });
    });

    listEl.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.deck-item');
            const id = cardEl?.dataset.id;
            if (id) openEditModal(id);
        });
    });
}

function toggleDeckEmptyState(isEmpty) {
    document.getElementById('deckList').hidden = isEmpty;
    document.getElementById('deckEmpty').hidden = !isEmpty;
}

// ═══════════════════════════════════════════════════
// BOTÕES "ADICIONAR AO DECK" (lista principal)
// ═══════════════════════════════════════════════════

export async function updateAddToDeckButtons() {
    const deckIds = new Set((await getDeckCards()).map(c => c.id));
    document.querySelectorAll('.phrase-card').forEach(card => {
        const id = card.dataset.cardId;
        const btn = card.querySelector('.add-to-deck-btn');
        if (btn && id) {
            if (deckIds.has(id)) {
                btn.classList.add('in-deck');
                btn.innerHTML = '✓';
                btn.title = 'Já está no deck';
                btn.disabled = true;
            } else {
                btn.classList.remove('in-deck');
                btn.innerHTML = '+';
                btn.title = 'Adicionar ao deck';
                btn.disabled = false;
            }
        }
    });
}

// ═══════════════════════════════════════════════════
// MODAL DE EDIÇÃO
// ═══════════════════════════════════════════════════

async function openEditModal(cardId) {
    const card = await db.deck.get(cardId);
    if (!card) return;
    currentEditCard = card;

    document.getElementById('editCardId').value = card.id;
    document.getElementById('editJap').value = card.jap;
    document.getElementById('editPt').value = card.pt;
    document.getElementById('editAudioName').textContent = card.audio?.split('/').pop() || '—';
    document.getElementById('editModal').hidden = false;
}

function closeEditModal() {
    document.getElementById('editModal').hidden = true;
    currentEditCard = null;
    if (audioPreview) {
        audioPreview.pause();
        audioPreview = null;
    }
}

async function playEditAudio() {
    if (!currentEditCard?.audio) return;
    const btn = document.getElementById('editAudioPlay');

    if (audioPreview) {
        audioPreview.pause();
        audioPreview = null;
        btn.textContent = '▶';
        return;
    }

    try {
        btn.textContent = '⏸';
        const res = await fetch(CONFIG.AUDIO_BASE + currentEditCard.audio);
        const blob = await res.blob();
        audioPreview = new Audio(URL.createObjectURL(blob));
        audioPreview.onended = () => {
            btn.textContent = '▶';
            audioPreview = null;
        };
        await audioPreview.play();
    } catch {
        btn.textContent = '▶';
        alert('Erro ao reproduzir áudio');
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editCardId').value;
    const jap = document.getElementById('editJap').value.trim();
    const pt = document.getElementById('editPt').value.trim();

    if (!jap || !pt) {
        alert('Preencha todos os campos');
        return;
    }

    const result = await updateDeckCard(id, { jap, pt }, allPhrases);
    if (result.success) {
        closeEditModal();
        await renderDeckList();
    } else {
        alert('Erro ao salvar');
    }
}

async function handleRestoreOriginal() {
    if (!currentEditCard) return;
    if (!confirm('Restaurar para a versão original do banco? Suas edições serão perdidas.')) return;

    const result = await restoreOriginalCard(currentEditCard.id, allPhrases);
    if (result.success) {
        document.getElementById('editJap').value = result.card.jap;
        document.getElementById('editPt').value = result.card.pt;
    } else {
        alert('Erro ao restaurar');
    }
}

// ═══════════════════════════════════════════════════
// FLUXO DE EXPORTAÇÃO (2 CAMINHOS)
// ═══════════════════════════════════════════════════

async function startExport() {
    const cards = await getDeckCards();
    if (cards.length === 0) {
        alert('Adicione pelo menos uma frase ao deck antes de exportar.');
        return;
    }

    const modal = document.getElementById('exportModal');
    modal.hidden = false;
    resetExportModal();
    await updateAnkiConnectStatus();
}

function resetExportModal() {
    exportMethod = null;
    document.getElementById('exportTxtBtn').hidden = false;
    document.getElementById('exportAnkiBtn').hidden = false;
    document.getElementById('ankiDeckSection').hidden = true;
    document.getElementById('exportProgress').hidden = true;
    document.getElementById('exportComplete').hidden = true;
    const actionsEl = document.getElementById('exportActions');
    actionsEl.hidden = false;
    document.getElementById('exportConfirmBtn').hidden = true;
    document.getElementById('exportCancelBtn').textContent = 'Cancelar';
    document.getElementById('exportCancelBtn').hidden = false;
}

async function updateAnkiConnectStatus() {
    const statusDot = document.querySelector('#ankiConnectStatus .status-dot');
    const statusText = document.getElementById('ankiConnectText');
    const hint = document.getElementById('ankiConnectHint');
    const ankiBtn = document.getElementById('exportAnkiBtn');

    // Bloquear em mobile
    if (isMobile()) {
        statusDot.style.background = '#94a3b8';
        statusText.textContent = 'Apenas para computador';
        hint.hidden = false;
        hint.innerHTML = '💻 A exportação direta para o Anki está disponível apenas na versão desktop por enquanto.';
        ankiBtn.disabled = true;
        ankiBtn.title = 'Disponível apenas em computadores';
        ankiBtn.style.opacity = '0.6';
        return;
    }

    // Restante da lógica para desktop
    try {
        const available = await isAnkiConnectAvailable();
        if (available) {
            statusDot.style.background = '#22c55e';
            statusText.textContent = 'AnkiConnect ativo ✓';
            hint.hidden = true;
            ankiBtn.disabled = false;
            ankiBtn.title = '';
            ankiBtn.style.opacity = '1';
            const decks = await getAnkiDecks();
            populateDeckSelector(decks);
        } else {
            statusDot.style.background = '#ef4444';
            statusText.textContent = 'AnkiConnect não detectado';
            hint.hidden = false;
            hint.innerHTML = '💡 Não detectamos o AnkiConnect. <a href="https://ankiweb.net/shared/info/2055492159" target="_blank" class="hint-link">Instale o add-on</a> e mantenha o Anki aberto.';
            ankiBtn.disabled = true;
            ankiBtn.title = 'Instale o AnkiConnect para usar esta opção';
            ankiBtn.style.opacity = '0.6';
        }
    } catch {
        statusDot.style.background = '#ef4444';
        statusText.textContent = 'Erro na conexão';
        hint.hidden = false;
        ankiBtn.disabled = true;
        ankiBtn.style.opacity = '0.6';
    }
}

function populateDeckSelector(decks) {
    const select = document.getElementById('ankiDeckSelect');
    const customInput = document.getElementById('ankiDeckCustom');
    select.innerHTML = '<option value="">Selecione um deck...</option>';
    decks.sort().forEach(deck => {
        const option = document.createElement('option');
        option.value = deck;
        option.textContent = deck;
        select.appendChild(option);
    });
    const newOption = document.createElement('option');
    newOption.value = '__new__';
    newOption.textContent = '✨ Criar novo deck...';
    select.appendChild(newOption);
    select.onchange = () => {
        if (select.value === '__new__') {
            customInput.style.display = 'block';
            customInput.focus();
            customInput.value = '';
        } else {
            customInput.style.display = 'none';
            customInput.value = '';
        }
    };
}

function getSelectedDeckName() {
    const select = document.getElementById('ankiDeckSelect');
    const customInput = document.getElementById('ankiDeckCustom');
    if (select.value === '__new__' && customInput.value.trim()) {
        return customInput.value.trim();
    }
    return select.value;
}

function selectExportMethod(method) {
    exportMethod = method;
    if (method === 'txt') {
        document.getElementById('ankiDeckSection').hidden = true;
        document.getElementById('exportTxtBtn').hidden = true;
        document.getElementById('exportAnkiBtn').hidden = true;
        document.getElementById('exportConfirmBtn').hidden = false;
        document.getElementById('exportConfirmBtn').textContent = 'Baixar .txt';
        document.getElementById('exportCancelBtn').textContent = 'Voltar';
    } else if (method === 'ankiconnect') {
        document.getElementById('ankiDeckSection').hidden = false;
        document.getElementById('exportTxtBtn').hidden = true;
        document.getElementById('exportAnkiBtn').hidden = true;
        document.getElementById('exportConfirmBtn').hidden = false;
        document.getElementById('exportConfirmBtn').textContent = 'Enviar para o Anki';
        document.getElementById('exportCancelBtn').textContent = 'Voltar';
    }
}

async function confirmExport() {
    const cards = await getDeckCards();
    const statusEl = document.getElementById('exportStatus');
    const progressEl = document.getElementById('exportProgress');
    const completeEl = document.getElementById('exportComplete');
    const actionsEl = document.getElementById('exportActions');

    actionsEl.hidden = true;
    progressEl.hidden = false;
    statusEl.textContent = exportMethod === 'txt' ? 'Gerando arquivo...' : 'Conectando ao Anki...';

    try {
        let result;
        if (exportMethod === 'txt') {
            result = await exportDeck({ method: 'txt', cards, allPhrases: [] });
            progressEl.hidden = true;
            completeEl.hidden = false;
            document.getElementById('completeMessage').textContent = '✅ Arquivo baixado!';
            document.getElementById('completeInstructions').innerHTML = `
                <strong>Como importar manualmente:</strong><br>
                1. Abra o Anki → Arquivo → Importar<br>
                2. Selecione <code>goroku-frases.txt</code><br>
                3. Marque ✅ "Allow HTML in fields" se quiser formatação<br>
                4. Escolha o deck de destino e importe
            `;
        } else if (exportMethod === 'ankiconnect') {
            const deckName = getSelectedDeckName();
            if (!deckName) {
                alert('Selecione ou digite um nome para o deck.');
                resetExportModal();
                return;
            }
            result = await exportDeck({
                method: 'ankiconnect',
                cards,
                allPhrases: [],
                deckName,
                onProgress: (msg) => { statusEl.textContent = msg; }
            });
            progressEl.hidden = true;
            completeEl.hidden = false;
            document.getElementById('completeMessage').textContent = result.message;
            document.getElementById('completeInstructions').innerHTML = result.errors > 0
                ? `Alguns cards falharam. Verifique o Anki para confirmar os enviados.<br><br>
                   <small style="color: var(--text-dim)">Dica: Cards com áudio indisponível são enviados sem som.</small>`
                : `🎉 Seus ${result.count} cards estão prontos no deck <strong>"${deckName}"</strong>!<br><br>
                   Abra o Anki para começar a revisar.`;
        }
    } catch (err) {
        statusEl.textContent = `❌ ${err.message || 'Erro na exportação'}`;
        statusEl.style.color = '#ef4444';
        console.error('Export failed:', err);
    }
}

function handleExportCancel() {
    const deckSection = document.getElementById('ankiDeckSection');
    if (exportMethod && !deckSection.hidden) {
        resetExportModal();
    } else {
        closeExportModal();
    }
}

function closeExportModal() {
    document.getElementById('exportModal').hidden = true;
    resetExportModal();
}

// ═══════════════════════════════════════════════════
// TUTORIAL MODAL
// ═══════════════════════════════════════════════════

function initTutorialModal() {
    const modal = document.getElementById('tutorialModal');
    const iframe = document.getElementById('tutorialVideo');
    const closeBtn = document.getElementById('tutorialCloseBtn');
    const tutorialBtn = document.getElementById('tutorialBtn');

    if (!modal || !iframe || !closeBtn || !tutorialBtn) return;

    // Abrir modal
    tutorialBtn.addEventListener('click', () => {
        if (tutorialVideoUrl) {
            iframe.src = `${tutorialVideoUrl}?autoplay=1`;
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
        } else {
            alert('URL do tutorial não configurada.');
        }
    });

    // Fechar modal
    function closeTutorial() {
        modal.hidden = true;
        iframe.src = '';
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeTutorial);

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeTutorial();
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeTutorial();
    });
}