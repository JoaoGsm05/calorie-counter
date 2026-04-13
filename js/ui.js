/**
 * ui.js — Gerenciamento da interface e manipulação do DOM.
 * Responsabilidades: skeleton, resultados, histórico, calculadora de refeição.
 */

const elements = {
    searchInput:  document.getElementById('food-search'),
    searchMessage: document.getElementById('search-message'),
    resultsList:  document.getElementById('foods-list'),
    resultsCount: document.getElementById('results-count'),
    btnLoadMore:  document.getElementById('btn-load-more'),
};

const RESULTS_PER_PAGE = 25;
let currentResults = [];
let currentPage    = 0;

// ---------------------------------------------------------------------------
// MENSAGENS
// ---------------------------------------------------------------------------

/**
 * Exibe uma mensagem na área de busca.
 * @param {'warning'|'info'|'success'|'error'} type
 * @param {string} text
 */
export function showMessage(type, text) {
    elements.searchMessage.className = `message-area message--${type}`;
    elements.searchMessage.textContent = text;
}

// ---------------------------------------------------------------------------
// CONTADOR
// ---------------------------------------------------------------------------

export function updateCounter(count) {
    elements.resultsCount.textContent = count > 0 ? `${count} foods found` : '';
}

// ---------------------------------------------------------------------------
// LOADING SKELETON
// ---------------------------------------------------------------------------

/**
 * Renderiza cards esqueleto enquanto o JSON carrega.
 */
export function showSkeleton() {
    const skeletonCard = () => `
        <div class="food-card food-card--skeleton" aria-hidden="true">
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton--pills">
                <div class="skeleton skeleton--pill"></div>
                <div class="skeleton skeleton--pill"></div>
            </div>
            <div class="skeleton skeleton--stats"></div>
        </div>`;

    elements.resultsList.innerHTML = Array.from({ length: 6 }, skeletonCard).join('');
}

// ---------------------------------------------------------------------------
// HISTÓRICO DE BUSCAS
// ---------------------------------------------------------------------------

/**
 * Renderiza chips de histórico de buscas recentes.
 * @param {string[]} history - Lista de termos (mais recente primeiro)
 * @param {Function} onSelect - Callback ao clicar em um chip
 */
export function renderHistory(history, onSelect) {
    const container = document.getElementById('search-history');
    if (!container) return;

    if (!history.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML =
        `<span class="history-label">Recent:</span>` +
        history.map(term =>
            `<button class="history-chip" data-term="${term}">${term}</button>`
        ).join('');

    container.querySelectorAll('.history-chip').forEach(chip => {
        chip.addEventListener('click', () => onSelect(chip.dataset.term));
    });
}

// ---------------------------------------------------------------------------
// RESULTADOS
// ---------------------------------------------------------------------------

/**
 * Renderiza uma página de resultados.
 * @param {Array|null} results - Lista completa de alimentos (null = append)
 * @param {boolean}    append  - Se deve adicionar ao fim da lista atual
 */
export function renderResults(results, append = false) {
    if (!append) {
        elements.resultsList.innerHTML = '';
        currentResults = results;
        currentPage    = 0;
    }

    const start     = currentPage * RESULTS_PER_PAGE;
    const end       = start + RESULTS_PER_PAGE;
    const pageItems = currentResults.slice(start, end);

    if (pageItems.length === 0 && !append) {
        elements.resultsList.innerHTML = `
            <div class="empty-state">
                <p>Nothing matched that search. Try a different term or use * for broader results.</p>
            </div>`;
        elements.btnLoadMore.classList.add('is-hidden');
        return;
    }

    const fragment = document.createDocumentFragment();
    pageItems.forEach(food => fragment.appendChild(createFoodCard(food)));
    elements.resultsList.appendChild(fragment);

    elements.btnLoadMore.classList.toggle('is-hidden', end >= currentResults.length);
    currentPage++;
}

// ---------------------------------------------------------------------------
// CARD DE ALIMENTO
// ---------------------------------------------------------------------------

/**
 * Cria o elemento HTML de um card de alimento.
 * @param {Object} food
 * @returns {HTMLElement}
 */
function createFoodCard(food) {
    const card = document.createElement('article');
    card.className = 'food-card';

    const defaultPortion = food.portions.find(p => p.portion_default === 1) ?? food.portions[0];

    card.innerHTML = `
        <div class="food-card__header">
            <h3 class="food-card__title">${food.display_name}</h3>
            <span class="food-card__code">#${food.food_code}</span>
        </div>

        <div class="food-card__body">
            <div class="food-card__portions" role="radiogroup" aria-label="Select portion size">
                ${food.portions.map(p => `
                    <button class="portion-pill ${p === defaultPortion ? 'is-active' : ''}"
                            data-calories="${p.nutrients.calories}"
                            data-fats="${p.nutrients.saturated_fats}"
                            data-portion="${p.portion_display_name}"
                            aria-checked="${p === defaultPortion}">
                        ${p.portion_display_name}
                    </button>`).join('')}
            </div>

            <div class="food-card__stats">
                <div class="stat">
                    <span class="stat__value js-calories">${defaultPortion.nutrients.calories.toFixed(1)}</span>
                    <span class="stat__label">kcal</span>
                </div>
                <div class="stat">
                    <span class="stat__value js-fats">${defaultPortion.nutrients.saturated_fats.toFixed(2)}</span>
                    <span class="stat__label">sat fat (g)</span>
                </div>
            </div>

            <button class="btn-add-meal" aria-label="Add this food to your meal">
                + Add to Meal
            </button>

            ${food.condiments.length > 0 ? `
                <div class="food-card__condiments">
                    <button class="btn-condiments-toggle" aria-expanded="false">
                        🧂 Suggested Condiments (${food.condiments.length})
                    </button>
                    <ul class="condiments-list is-hidden">
                        ${food.condiments.map(c => `
                            <li>
                                <strong>${c.name}</strong>
                                <span>${c.portions[0]?.portion_size ?? ''} (${(c.portions[0]?.nutrients.calories ?? 0).toFixed(0)} kcal)</span>
                            </li>`).join('')}
                    </ul>
                </div>` : ''}
        </div>`;

    setupCardEvents(card, food);
    return card;
}

/**
 * Configura eventos internos de cada card.
 * @param {HTMLElement} card
 * @param {Object}      food
 */
function setupCardEvents(card, food) {
    const pills      = card.querySelectorAll('.portion-pill');
    const calDisplay = card.querySelector('.js-calories');
    const fatDisplay = card.querySelector('.js-fats');

    // Troca de porção
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => {
                p.classList.remove('is-active');
                p.setAttribute('aria-checked', 'false');
            });
            pill.classList.add('is-active');
            pill.setAttribute('aria-checked', 'true');
            calDisplay.textContent = parseFloat(pill.dataset.calories).toFixed(1);
            fatDisplay.textContent = parseFloat(pill.dataset.fats).toFixed(2);
        });
    });

    // Adicionar à refeição
    const btnAddMeal = card.querySelector('.btn-add-meal');
    btnAddMeal.addEventListener('click', () => {
        const activePill = card.querySelector('.portion-pill.is-active');
        document.dispatchEvent(new CustomEvent('meal:add', {
            detail: {
                name:        food.display_name,
                portionName: activePill.dataset.portion,
                calories:    parseFloat(activePill.dataset.calories),
                fats:        parseFloat(activePill.dataset.fats),
            },
        }));
        btnAddMeal.textContent = '✓ Added!';
        btnAddMeal.classList.add('is-added');
        setTimeout(() => {
            btnAddMeal.textContent = '+ Add to Meal';
            btnAddMeal.classList.remove('is-added');
        }, 1500);
    });

    // Toggle de condimentos
    const condToggle = card.querySelector('.btn-condiments-toggle');
    if (condToggle) {
        const condList = card.querySelector('.condiments-list');
        condToggle.addEventListener('click', () => {
            const isExpanded = condToggle.getAttribute('aria-expanded') === 'true';
            condToggle.setAttribute('aria-expanded', String(!isExpanded));
            condList.classList.toggle('is-hidden');
            condToggle.classList.toggle('is-active');
        });
    }
}

// ---------------------------------------------------------------------------
// CALCULADORA DE REFEIÇÃO
// ---------------------------------------------------------------------------

/**
 * Atualiza a bandeja de refeição com os itens atuais.
 * @param {Array} items - Lista de itens adicionados à refeição
 */
export function addToMealTray(items) {
    const tray  = document.getElementById('meal-tray');
    const list  = tray.querySelector('.meal-tray__list');
    const total = items.reduce((sum, item) => sum + item.calories, 0);

    const isVisible = items.length > 0;
    tray.classList.toggle('is-visible', isVisible);
    document.body.classList.toggle('meal-active', isVisible);

    list.innerHTML = items.map((item, idx) => `
        <li class="meal-item">
            <span class="meal-item__name">${item.name}</span>
            <span class="meal-item__portion">${item.portionName}</span>
            <span class="meal-item__calories">${item.calories.toFixed(0)} kcal</span>
            <button class="meal-item__remove" data-index="${idx}" aria-label="Remove ${item.name}">✕</button>
        </li>`).join('');

    tray.querySelector('.meal-tray__total-value').textContent = `${total.toFixed(0)} kcal`;

    list.querySelectorAll('.meal-item__remove').forEach(btn => {
        btn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('meal:remove', {
                detail: { index: parseInt(btn.dataset.index, 10) },
            }));
        });
    });
}

/**
 * Limpa e oculta a bandeja de refeição.
 */
export function clearMealTray() {
    const tray = document.getElementById('meal-tray');
    tray.classList.remove('is-visible');
    document.body.classList.remove('meal-active');
    tray.querySelector('.meal-tray__list').innerHTML = '';
    tray.querySelector('.meal-tray__total-value').textContent = '0 kcal';
}

// ---------------------------------------------------------------------------
// RESET GERAL
// ---------------------------------------------------------------------------

export function clearAll() {
    elements.searchInput.value       = '';
    elements.searchMessage.textContent = '';
    elements.resultsList.innerHTML   = `
        <div class="empty-state">
            <p>Enter a food name to start searching.</p>
        </div>`;
    elements.resultsCount.textContent = '';
    elements.btnLoadMore.classList.add('is-hidden');
    currentResults = [];
    currentPage    = 0;
}
