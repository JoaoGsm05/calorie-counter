/**
 * data-loader.js — Carregamento e indexação dos dados nutricionais.
 */

/** @type {Array} */
export let foods = [];

/** @type {Map<string, Array>} */
export const searchIndex = new Map(); // Indexado por trigramas (primeiras 3 letras)

/** @type {Map<string, Object>} */
export const codeLookup = new Map(); // Lookup direto por food_code

/**
 * Carrega o JSON e gera os índices.
 * @returns {Promise<void>}
 */
export async function loadFoods() {
    try {
        const response = await fetch('data/foods.json');
        if (!response.ok) throw new Error('Falha ao carregar alimentos.');
        
        const data = await response.json();
        foods = data.foods;

        // Limpa índices (importante se houver reload)
        searchIndex.clear();
        codeLookup.clear();

        // Indexação (O(n))
        for (const food of foods) {
            // Indexação por código
            codeLookup.set(food.food_code, food);

            // Indexação por trigramas (para busca rápida)
            const name = food.display_name.toLowerCase();
            const prefix = name.substring(0, 3);
            
            if (!searchIndex.has(prefix)) {
                searchIndex.set(prefix, []);
            }
            searchIndex.get(prefix).push(food);
        }

        console.info(`[LOADER] ${foods.length} alimentos carregados e indexados.`);
    } catch (error) {
        console.error('[LOADER] Erro:', error);
        throw error;
    }
}
