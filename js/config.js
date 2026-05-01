// Configurações globais do app
export const CONFIG = {
    AUDIO_BASE: 'https://goroku-audio-proxy.marlucedannyrocha.workers.dev/',
    DATA_FILE: 'traduzido_pt.json',
    PAGE_SIZE: 60,
    SEARCH_DEBOUNCE: 180,
    SCROLL_MARGIN: '200px'
};

// Ícones SVG (versões amigáveis)
export const ICONS = {
    PLAY: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14a1.5 1.5 0 0 0 2.27 1.29l11-7a1.5 1.5 0 0 0 0-2.58l-11-7A1.5 1.5 0 0 0 8 5.14z"/></svg>`,
    PAUSE: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>`,
    SPIN: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    ERR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    DL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
};