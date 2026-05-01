// js/anki-connect.js
// Integração com AnkiConnect para envio direto de cards + áudio

const ANKICONNECT_URL = 'http://localhost:8765';
const ANKICONNECT_VERSION = 6;

/**
 * Verifica se o AnkiConnect está disponível
 */
export async function isAnkiConnectAvailable() {
    try {
        const res = await fetch(ANKICONNECT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'version', version: ANKICONNECT_VERSION })
        });
        const data = await res.json();
        return data.result !== undefined;
    } catch {
        return false;
    }
}

/**
 * Obtém lista de decks existentes no Anki
 */
export async function getAnkiDecks() {
    try {
        const res = await fetch(ANKICONNECT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deckNames', version: ANKICONNECT_VERSION })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.result || [];
    } catch (err) {
        console.warn('Falha ao obter decks:', err);
        return [];
    }
}

/**
 * Converte Blob para base64 (remove prefixo data:...)
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Adiciona um único card no Anki via AnkiConnect
 * Áudio vai para o campo FRONT (não Back) - SEM duplicação
 */
export async function addAnkiCard({ front, back, audioBlob, audioFilename, deckName, tags = [] }) {
    const note = {
        deckName: deckName,
        modelName: 'Basic',
        fields: {
            Front: front,
            Back: back
        },
        tags: [...tags],
        options: {
            allowDuplicate: false,
            duplicateScope: 'deck',
            duplicateScopeOptions: { deckName: deckName, checkChildren: false }
        }
    };

    // Se tiver áudio, incluir APENAS via note.audio (Anki faz o resto automaticamente)
    if (audioBlob && audioFilename) {
        const audioBase64 = await blobToBase64(audioBlob);
        note.audio = {
            filename: audioFilename,
            data: audioBase64,
            fields: ['Front'],  // ← áudio injetado na FRENTE do card
            skipHash: false,
            deleteExisting: true
        };
        // ⚠️ NÃO adicionar manualmente [sound:...] — o Anki faz isso automaticamente
    }

    const payload = {
        action: 'addNote',
        version: ANKICONNECT_VERSION,
        params: { note }
    };

    const res = await fetch(ANKICONNECT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.error) {
        throw new Error(result.error);
    }

    return { success: true, noteId: result.result };
}

/**
 * Envia múltiplos cards em lote com feedback de progresso
 */
export async function sendCardsToAnki(cards, allPhrases, deckName, onProgress) {
    const results = [];
    const CONFIG = { AUDIO_BASE: 'https://goroku-audio-proxy.marlucedannyrocha.workers.dev/' };

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        onProgress?.(`Enviando ${i + 1}/${cards.length}...`);

        try {
            let audioBlob = null;
            let audioFilename = null;

            // Baixar áudio se existir
            if (card.audio) {
                const res = await fetch(CONFIG.AUDIO_BASE + card.audio);
                if (!res.ok) throw new Error(`HTTP ${res.status} para áudio`);
                audioBlob = await res.blob();
                audioFilename = card.audio.split('/').pop();
            }

            // Enviar card
            const result = await addAnkiCard({
                front: card.jap,
                back: card.pt,
                audioBlob,
                audioFilename,
                deckName,
                tags: ['goroku', card.source?.split('/')?.[1]?.toUpperCase()].filter(Boolean)
            });

            results.push({ success: true, card, ankiId: result.noteId });
        } catch (err) {
            console.warn(`Falha ao enviar card ${card.id}:`, err);
            results.push({ success: false, card, error: err.message });
        }
    }

    return results;
}

/**
 * Helper: Formatar resultado do lote para UI
 */
export function formatBatchResult(results) {
    const success = results.filter(r => r.success).length;
    const failed = results.length - success;

    return {
        total: results.length,
        success,
        failed,
        message: failed === 0
            ? `✅ ${success} card${success !== 1 ? 's' : ''} enviado${success !== 1 ? 's' : ''} com sucesso!`
            : `⚠️ ${success} enviado${success !== 1 ? 's' : ''}, ${failed} falhou${failed !== 1 ? 'ram' : 'u'}`
    };
}