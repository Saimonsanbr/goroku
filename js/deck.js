// js/deck.js
// Gerenciamento do deck: adicionar, remover, editar

import { db, isInDeck, getOriginalPhrase, wasExported } from './db.js';

// Adicionar frase ao deck (COM verificação de histórico)
export async function addToDeck(phrase, allPhrases) {
    const exists = await isInDeck(phrase.id);
    if (exists) return { success: false, reason: 'already_in_deck' };

    // ✅ Verificar se já foi exportado antes
    const exportInfo = await wasExported(phrase.id);

    // Criar cópia editável
    const card = {
        id: phrase.id,
        jap: phrase.jap,
        pt: phrase['pt-br'],
        audio: phrase.audio_jap,
        source: phrase.source,
        addedAt: new Date().toISOString()
    };

    await db.deck.put(card);

    // Retornar info sobre histórico para a UI
    return {
        success: true,
        wasExportedBefore: !!exportInfo,
        exportCount: exportInfo?.exportedCount || 0
    };
}

// Remover frase do deck
export async function removeFromDeck(phraseId) {
    await db.deck.delete(phraseId);
    return { success: true };
}

// Editar card do deck
export async function updateDeckCard(phraseId, updates, allPhrases) {
    const current = await db.deck.get(phraseId);
    if (!current) return { success: false, reason: 'not_found' };

    const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await db.deck.put(updated);
    return { success: true, card: updated };
}

// Restaurar card para versão original
export async function restoreOriginalCard(phraseId, allPhrases) {
    const original = await getOriginalPhrase(phraseId, allPhrases);
    if (!original) return { success: false, reason: 'original_not_found' };

    const current = await db.deck.get(phraseId);
    if (!current) return { success: false, reason: 'not_in_deck' };

    const restored = {
        ...current,
        jap: original.jap,
        pt: original['pt-br'],
        restoredAt: new Date().toISOString()
    };

    await db.deck.put(restored);
    return { success: true, card: restored };
}

// Obter todos os cards do deck
export async function getDeckCards() {
    return await db.deck.toArray();
}

// Limpar deck inteiro
export async function clearDeck() {
    await db.deck.clear();
    return { success: true };
}

// Contar cards no deck
export async function getDeckCount() {
    return await db.deck.count();
}