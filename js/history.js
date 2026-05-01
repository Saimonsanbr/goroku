// Histórico de exportações para Anki

import { db } from './db.js';

// Registrar exportação
export async function recordExport(phraseIds) {
    const now = new Date().toISOString();

    for (const id of phraseIds) {
        const existing = await db.history.get(id);

        if (existing) {
            // Atualizar contagem
            await db.history.update(id, {
                exportedCount: (existing.exportedCount || 0) + 1,
                lastExportedAt: now
            });
        } else {
            // Novo registro
            await db.history.add({
                id,
                exportedCount: 1,
                lastExportedAt: now,
                firstExportedAt: now
            });
        }
    }

    return { success: true };
}

// Verificar se frase foi exportada
export async function getExportInfo(phraseId) {
    return await db.history.get(phraseId);
}

// Obter estatísticas do histórico
export async function getHistoryStats() {
    const total = await db.history.count();
    const totalExports = await db.history
        .toCollection()
        .reduce((sum, item) => sum + (item.exportedCount || 0), 0);

    return { totalPhrases: total, totalExports };
}