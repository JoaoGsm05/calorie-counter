/**
 * search.js — Motor de busca com suporte a wildcard (*) e relevância.
 * Usa o índice de prefixo (searchIndex) do data-loader para reduzir o
 * conjunto de candidatos em buscas sem wildcard inicial — O(1) lookup.
 */

import { searchIndex } from './data-loader.js';

const MAX_INTERNAL_RESULTS = 500;

/**
 * Busca alimentos pelo nome com suporte a curingas.
 * @param {string} query - Termo de busca (ex: "chick*", "*cheese*", "beef")
 * @param {Array} foods  - Array completo (fallback para wildcards sem prefixo fixo)
 * @returns {Array} Resultados ordenados por relevância
 */
export function searchFoods(query, foods) {
    if (!query || query.trim() === '') return [];

    const searchTerm = query.trim().toLowerCase();
    const cleanTerm   = searchTerm.replace(/\*/g, '');

    // Converte wildcard * para regex .* e escapa caracteres especiais
    const regexPattern = searchTerm
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
    const regex = new RegExp(regexPattern, 'i');

    // Seleciona candidatos:
    //  - Query sem wildcard inicial e com >= 3 chars → usa índice de prefixo (rápido)
    //  - Demais casos (wildcard no início, query curta) → varre array completo
    const hasLeadingWildcard = searchTerm.startsWith('*');
    let candidates;

    if (!hasLeadingWildcard && cleanTerm.length >= 3) {
        const prefix = cleanTerm.substring(0, 3);
        candidates = searchIndex.get(prefix) ?? [];
    } else {
        candidates = foods;
    }

    const results = [];

    for (const food of candidates) {
        const name = food.display_name.toLowerCase();

        if (name === cleanTerm) {
            // 1. Match exato — peso máximo
            results.push({ food, score: 3 });
        } else if (!hasLeadingWildcard && name.startsWith(cleanTerm)) {
            // 2. Inicia com o termo — peso alto
            results.push({ food, score: 2 });
        } else if (regex.test(name)) {
            // 3. Regex match (wildcard, substring) — peso base
            results.push({ food, score: 1 });
        }

        if (results.length >= MAX_INTERNAL_RESULTS) break;
    }

    return results
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.food.display_name.localeCompare(b.food.display_name);
        })
        .map(item => item.food);
}
