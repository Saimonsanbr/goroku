// js/onboarding.js
// Onboarding visual: overlay, tooltip, seta animada e destaque do deck button

import { getUserState, setUserState } from './db.js';

const ONBOARDING_KEYS = {
    DECK_HINT_SHOWN: 'deckHintShown',
    TUTORIAL_WATCHED: 'tutorialWatched'
};

/**
 * Verifica se já mostrou o hint do deck para este usuário
 */
export async function shouldShowDeckHint() {
    const shown = await getUserState(ONBOARDING_KEYS.DECK_HINT_SHOWN);
    return !shown;
}

/**
 * Marca o hint do deck como "já mostrado"
 */
export async function markDeckHintShown() {
    await setUserState(ONBOARDING_KEYS.DECK_HINT_SHOWN, true);
}

/**
 * Mostra overlay escuro + tooltip com seta animada
 */
export function showDeckOnboarding() {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
        <div class="onboarding-tooltip">
            <p>Veja lá em cima ↑<br>Arraste pra cima pra ver os cards</p>
            <div class="onboarding-arrow"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Observar scroll: quando chegar no topo, finalizar onboarding
    const onScroll = () => {
        if (window.scrollY < 50) {
            finishDeckOnboarding(overlay);
            window.removeEventListener('scroll', onScroll);
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Também finalizar se clicar no overlay
    overlay.addEventListener('click', () => {
        finishDeckOnboarding(overlay);
        window.removeEventListener('scroll', onScroll);
    });
}

/**
 * Finaliza onboarding: remove overlay e destaca deck button
 */
function finishDeckOnboarding(overlay) {
    // Remover overlay
    if (overlay?.parentNode) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
    }

    // Destacar deck counter button
    const deckBtn = document.getElementById('deckCounterBtn');
    if (deckBtn) {
        deckBtn.classList.add('highlight-pulse');
        // Remover destaque após 3 segundos
        setTimeout(() => deckBtn.classList.remove('highlight-pulse'), 3000);
    }

    // Salvar que já mostrou
    // removida porque estava bugando markDeckHintShown();
}

/**
 * Inicializa onboarding: chama showDeckOnboarding se for primeira vez
 */
export async function initDeckOnboarding() {
    if (await shouldShowDeckHint()) {
        // Pequeno delay para garantir que a UI já renderizou
        setTimeout(showDeckOnboarding, 500);
    }
}

/**
 * Reset para testes: apaga estado do onboarding via console
 * Uso: await import('./onboarding.js').then(m => m.resetDeckHint())
 */
export async function resetDeckHint() {
    await clearUserState(ONBOARDING_KEYS.DECK_HINT_SHOWN);
    console.log('✅ Deck hint resetado. Recarregue a página para testar novamente.');
}