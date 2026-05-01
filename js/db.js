// js/db.js
// Configuração do IndexedDB via Dexie.js

export const db = new Dexie('GorokuDB');

// Definir schema das tabelas
db.version(1).stores({
    // Deck atual (cópias editáveis das frases)
    deck: `
        id,
        jap,
        pt,
        audio,
        source,
        addedAt
    `,
    // Histórico de exportações
    history: `
        id,
        exportedCount,
        lastExportedAt,
        firstExportedAt
    `
});

// Helper: Verificar se frase está no deck
export async function isInDeck(phraseId) {
    return !!(await db.deck.get(phraseId));
}

// Helper: Verificar se frase já foi exportada
export async function wasExported(phraseId) {
    return !!(await db.history.get(phraseId));
}

// Helper: Obter frase original do banco (para restaurar)
export async function getOriginalPhrase(phraseId, allPhrases) {
    return allPhrases.find(p => p.id === phraseId) || null;
}