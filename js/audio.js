// Gerenciamento de áudio: play, pause, download, cache

import { CONFIG, ICONS } from './config.js';
import { setPlayState } from './renderer.js';

let currentAudio = null;
let currentCardId = null;
const blobCache = new Map();

export function stopCurrent() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio = null;
    }
    if (currentCardId !== null) {
        const prev = document.querySelector(`[data-card-id="${currentCardId}"]`);
        if (prev) {
            prev.classList.remove('is-playing');
            const btn = prev.querySelector('.btn-play');
            if (btn) setPlayState(btn, 'idle');
        }
        currentCardId = null;
    }
}

async function getBlobUrl(audioPath) {
    if (blobCache.has(audioPath)) return blobCache.get(audioPath);
    const res = await fetch(CONFIG.AUDIO_BASE + audioPath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const objUrl = URL.createObjectURL(await res.blob());
    blobCache.set(audioPath, objUrl);
    return objUrl;
}

export async function handlePlay(card, btn) {
    const audioPath = card.dataset.audio;
    if (!audioPath) return;
    const cardId = card.dataset.cardId;

    // Toggle play/pause se for o mesmo card
    if (currentCardId === cardId && currentAudio) {
        if (!currentAudio.paused) {
            currentAudio.pause();
            card.classList.remove('is-playing');
            setPlayState(btn, 'idle');
        } else if (currentAudio.readyState >= 2) {
            currentAudio.play();
            card.classList.add('is-playing');
            setPlayState(btn, 'playing');
        }
        return;
    }

    stopCurrent();
    setPlayState(btn, 'loading');

    try {
        const objUrl = await getBlobUrl(audioPath);
        if (!card.isConnected) return;

        const audio = new Audio(objUrl);
        currentAudio = audio;
        currentCardId = cardId;

        audio.addEventListener('canplaythrough', () => {
            if (currentCardId !== cardId) return;
            audio.play();
            card.classList.add('is-playing');
            setPlayState(btn, 'playing');
        }, { once: true });

        audio.addEventListener('ended', () => {
            if (card.isConnected) card.classList.remove('is-playing');
            if (btn.isConnected) setPlayState(btn, 'idle');
            currentAudio = null;
            currentCardId = null;
        });

        audio.addEventListener('pause', () => {
            if (currentCardId === cardId && card.isConnected) {
                card.classList.remove('is-playing');
                if (btn.isConnected) setPlayState(btn, 'idle');
            }
        });

        audio.addEventListener('error', () => {
            if (card.isConnected) card.classList.remove('is-playing');
            if (btn.isConnected) setPlayState(btn, 'error');
            currentAudio = null;
            currentCardId = null;
        });

        audio.load();
    } catch {
        if (btn.isConnected) setPlayState(btn, 'error');
        currentAudio = null;
        currentCardId = null;
    }
}

export async function handleDownload(card, btn) {
    const audioPath = card.dataset.audio;
    if (!audioPath) return;

    btn.style.opacity = '0.3';
    btn.style.pointerEvents = 'none';

    try {
        const objUrl = await getBlobUrl(audioPath);
        const filename = audioPath.split('/').pop() || 'audio.mp3';
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (err) {
        console.error('Download falhou:', err);
    } finally {
        if (btn.isConnected) {
            btn.style.opacity = '';
            btn.style.pointerEvents = '';
        }
    }
}