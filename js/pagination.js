// Paginação infinita (infinite scroll)

import { CONFIG } from './config.js';
import { renderCard } from './renderer.js';

let currentPage = 0;
let sentinel = null;
let observer = null;
let isLoading = false;

export function initPagination(container, results, query, renderCallback) {
    resetPagination();
    renderPage(container, results, query, renderCallback);
}

function renderPage(container, results, query, renderCallback) {
    const start = currentPage * CONFIG.PAGE_SIZE;
    const slice = results.slice(start, start + CONFIG.PAGE_SIZE);

    if (slice.length === 0 && currentPage === 0) {
        container.innerHTML = renderCallback(null, query);
        return;
    }

    container.insertAdjacentHTML('beforeend',
        slice.map((p, i) => renderCard(p, query, start + i)).join('')
    );

    currentPage++;

    if (currentPage * CONFIG.PAGE_SIZE < results.length) {
        addSentinel(container, () => renderPage(container, results, query, renderCallback));
    }
}

function addSentinel(container, onLoadMore) {
    removeSentinel();

    sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    container.appendChild(sentinel);

    observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !isLoading) {
            isLoading = true;
            requestAnimationFrame(() => {
                onLoadMore();
                isLoading = false;
            });
        }
    }, { rootMargin: CONFIG.SCROLL_MARGIN });

    observer.observe(sentinel);
}

function removeSentinel() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    if (sentinel?.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
        sentinel = null;
    }
}

export function resetPagination() {
    currentPage = 0;
    removeSentinel();
}

export function getCurrentPage() {
    return currentPage;
}