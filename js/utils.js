// Funções utilitárias

export function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapeHtml(text).replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
}

export function extractLevel(source) {
    const m = source.match(/\b(n[1-5])\b/i);
    return m ? m[1].toUpperCase() : null;
}

export function sourceLabel(source) {
    const parts = source.split('/');
    if (/^n[1-5]$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.join('/');
}

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