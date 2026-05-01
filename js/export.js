// js/export.js
// Exportação: .txt simples OU via AnkiConnect

import { CONFIG } from './config.js';
import { recordExport } from './history.js';
import { sendCardsToAnki, formatBatchResult } from './anki-connect.js';

// ═══════════════════════════════════════════════════
// EXPORTAÇÃO COMO .TXT (sem áudio, para importação manual)
// ═══════════════════════════════════════════════════

/**
 * Gera conteúdo do arquivo .txt no formato Anki (separado por ponto e vírgula)
 */
function generateTxtContent(cards) {
    return cards.map(card => {
        // Escapa ponto e vírgula dentro dos campos
        const front = card.jap.replace(/;/g, ',');
        const back = card.pt.replace(/;/g, ',');
        return `${front};${back}`;
    }).join('\n');
}

/**
 * Baixa o arquivo .txt diretamente
 */
export async function exportAsTxt(cards, filename = 'goroku-frases') {
    const content = generateTxtContent(cards);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Registrar no histórico
    await recordExport(cards.map(c => c.id));

    return { success: true, count: cards.length, method: 'txt' };
}

// ═══════════════════════════════════════════════════
// EXPORTAÇÃO VIA ANKICONNECT (com áudio)
// ═══════════════════════════════════════════════════

/**
 * Exporta cards diretamente para o Anki via AnkiConnect
 */
export async function exportViaAnkiConnect(cards, allPhrases, deckName, onProgress) {
    if (!deckName || deckName.trim() === '') {
        throw new Error('Nome do deck é obrigatório');
    }

    onProgress?.('Conectando ao Anki...');

    try {
        const results = await sendCardsToAnki(cards, allPhrases, deckName.trim(), onProgress);
        const summary = formatBatchResult(results);

        // Registrar apenas os bem-sucedidos no histórico
        const successIds = results.filter(r => r.success).map(r => r.card.id);
        if (successIds.length > 0) {
            await recordExport(successIds);
        }

        return {
            success: summary.failed === 0,
            count: summary.success,
            errors: summary.failed,
            message: summary.message,
            method: 'ankiconnect'
        };
    } catch (err) {
        console.error('Erro na exportação AnkiConnect:', err);
        throw err;
    }
}

// ═══════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL (roteia para o método correto)
// ═══════════════════════════════════════════════════

/**
 * Exporta deck usando o método especificado
 * @param {'txt' | 'ankiconnect'} method 
 */
export async function exportDeck({ method, cards, allPhrases, deckName, onProgress }) {
    if (method === 'txt') {
        return await exportAsTxt(cards);
    } else if (method === 'ankiconnect') {
        return await exportViaAnkiConnect(cards, allPhrases, deckName, onProgress);
    } else {
        throw new Error(`Método de exportação desconhecido: ${method}`);
    }
}