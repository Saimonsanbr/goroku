// Lógica de busca e filtragem

import { CONFIG } from './config.js';
import { debounce } from './utils.js';
import { updateStatus } from './renderer.js';

export function createSearchHandler(allPhrases, onResultsChange) {
    const searchInput = document.getElementById('searchInput');

    const performSearch = debounce((query) => {
        const q = query.trim().toLowerCase();
        const results = q
            ? allPhrases.filter(p =>
                (p.jap || '').toLowerCase().includes(q) ||
                (p['pt-br'] || '').toLowerCase().includes(q) ||
                (p.source || '').toLowerCase().includes(q))
            : allPhrases;

        updateStatus(results.length, allPhrases.length, q);
        onResultsChange(results, q);
    }, CONFIG.SEARCH_DEBOUNCE);

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    return {
        getQuery: () => searchInput.value.trim()
    };
}