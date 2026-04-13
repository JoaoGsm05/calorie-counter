/**
 * app.js — Orquestrador principal da aplicação.
 * Responsabilidades: inicialização, eventos globais, histórico, calculadora de refeição, PWA.
 */

import { loadFoods, foods } from './data-loader.js';
import { searchFoods } from './search.js';
import {
    renderResults, showMessage, updateCounter, clearAll,
    showSkeleton, renderHistory, addToMealTray, clearMealTray,
} from './ui.js';

// ---------------------------------------------------------------------------
// CONSTANTES
// ---------------------------------------------------------------------------

const HISTORY_KEY  = 'calorie-counter:history';
const MAX_HISTORY  = 5;

// ---------------------------------------------------------------------------
// ELEMENTOS
// ---------------------------------------------------------------------------

const btnSearch  = document.getElementById('btn-search');
const btnClear   = document.getElementById('btn-clear');
const btnLoadMore = document.getElementById('btn-load-more');
const inputSearch = document.getElementById('food-search');
const btnClearMeal = document.getElementById('btn-clear-meal');

// ---------------------------------------------------------------------------
// ESTADO DA REFEIÇÃO
// ---------------------------------------------------------------------------

let mealItems = [];

// ---------------------------------------------------------------------------
// INICIALIZAÇÃO
// ---------------------------------------------------------------------------

async function init() {
    try {
        showSkeleton();
        await loadFoods();
        clearAll();                            // Restaura estado inicial após skeleton
        showMessage('success', 'Ready! Search for a food above.');
        renderHistory(getHistory(), handleHistoryClick);
        setupEventListeners();
        registerServiceWorker();
    } catch {
        showMessage('error', 'Failed to load food data. Please refresh the page.');
    }
}

// ---------------------------------------------------------------------------
// EVENTOS
// ---------------------------------------------------------------------------

function setupEventListeners() {
    btnSearch.addEventListener('click', handleSearch);

    inputSearch.addEventListener('keypress', e => {
        if (e.key === 'Enter') handleSearch();
    });

    btnClear.addEventListener('click', () => {
        clearAll();
        inputSearch.focus();
        showMessage('success', 'Cleared. Ready for a new search.');
        renderHistory(getHistory(), handleHistoryClick);
    });

    btnLoadMore.addEventListener('click', () => renderResults(null, true));

    btnClearMeal.addEventListener('click', () => {
        mealItems = [];
        clearMealTray();
    });

    // Eventos customizados disparados pelos cards
    document.addEventListener('meal:add', e => {
        mealItems.push(e.detail);
        addToMealTray(mealItems);
    });

    document.addEventListener('meal:remove', e => {
        mealItems.splice(e.detail.index, 1);
        addToMealTray(mealItems);
    });
}

// ---------------------------------------------------------------------------
// BUSCA
// ---------------------------------------------------------------------------

function handleSearch() {
    const query = inputSearch.value.trim();

    if (!query) {
        showMessage('warning', 'Please enter a food name to search.');
        return;
    }

    const results = searchFoods(query, foods);

    saveHistory(query);
    renderHistory(getHistory(), handleHistoryClick);

    if (results.length === 0) {
        showMessage('info', `No results found for "${query}". Try using * — e.g. chick*`);
        renderResults([]);
        updateCounter(0);
    } else {
        showMessage('success', `Found ${results.length} match${results.length !== 1 ? 'es' : ''}.`);
        updateCounter(results.length);
        renderResults(results);
    }
}

// ---------------------------------------------------------------------------
// HISTÓRICO
// ---------------------------------------------------------------------------

function handleHistoryClick(term) {
    inputSearch.value = term;
    handleSearch();
}

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function saveHistory(term) {
    const updated = [term, ...getHistory().filter(t => t !== term)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

// ---------------------------------------------------------------------------
// SERVICE WORKER (PWA)
// ---------------------------------------------------------------------------

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .catch(() => { /* offline, não-HTTPS: ignorar silenciosamente */ });
    }
}

// ---------------------------------------------------------------------------
// BOOTSTRAP
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', init);
