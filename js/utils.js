// js/utils.js
// Funções utilitárias

/**
 * Escape HTML para prevenir XSS
 */
export function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Destaca termos de busca no texto
 */
export function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapeHtml(text).replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
}

/**
 * Extrai nível JLPT da fonte (ex: "n3" → "N3")
 */
export function extractLevel(source) {
    const m = source.match(/\b(n[1-5])\b/i);
    return m ? m[1].toUpperCase() : null;
}

/**
 * Formata label da fonte removendo nível JLPT do final
 */
export function sourceLabel(source) {
    const parts = source.split('/');
    if (/^n[1-5]$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.join('/');
}

/**
 * Debounce para funções de busca/input
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ═══════════════════════════════════════════════════
// DETECÇÃO DE MOBILE
// ═══════════════════════════════════════════════════

/**
 * Detecta se o usuário está em dispositivo mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
}