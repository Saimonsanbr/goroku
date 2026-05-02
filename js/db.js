// js/db.js
// Configuração do IndexedDB via Dexie.js

export const db = new Dexie('GorokuDB');

// Definir schema das tabelas (versão 2 para adicionar userState)
db.version(2).stores({
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
    `,
    // Estado do usuário (onboarding, preferências, etc)
    userState: 'key, value, updatedAt'
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

// ═══════════════════════════════════════════════════
// USER STATE HELPERS (para onboarding e preferências)
// ═══════════════════════════════════════════════════

/**
 * Obtém valor de uma chave do estado do usuário
 */
export async function getUserState(key) {
    const record = await db.userState.get(key);
    return record?.value;
}

/**
 * Define valor de uma chave do estado do usuário
 */
export async function setUserState(key, value) {
    await db.userState.put({
        key,
        value,
        updatedAt: new Date().toISOString()
    });
}

/**
 * Remove uma chave do estado do usuário (útil para testes)
 */
export async function clearUserState(key) {
    await db.userState.delete(key);
}