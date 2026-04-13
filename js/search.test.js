/**
 * search.test.js — Unit tests for the food search engine.
 *
 * Runner: Node.js built-in test runner (no external dependencies)
 * Execute: npm test  |  node --test js/search.test.js
 *
 * Strategy: searchIndex is a const Map (object reference) exported by
 * data-loader.js. We populate it directly before tests — same algorithm
 * used in loadFoods() — so search.js sees the populated index without
 * any mocking framework or modification to source files.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

import { searchFoods } from './search.js';
import { searchIndex } from './data-loader.js';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const FOODS = [
    { display_name: 'Chicken Breast', food_code: '1001', portions: [], condiments: [] },
    { display_name: 'Chicken Soup',   food_code: '1002', portions: [], condiments: [] },
    { display_name: 'Beef Steak',     food_code: '1003', portions: [], condiments: [] },
    { display_name: 'Beef Burger',    food_code: '1004', portions: [], condiments: [] },
    { display_name: 'Apple Juice',    food_code: '1005', portions: [], condiments: [] },
    { display_name: 'Cheddar Cheese', food_code: '1006', portions: [], condiments: [] },
    { display_name: 'Swiss Cheese',   food_code: '1007', portions: [], condiments: [] },
];

/**
 * Replicates the indexing logic from data-loader.js using FOODS fixtures.
 * Key: first 3 lowercase letters of display_name.
 */
function buildTestIndex(foods) {
    searchIndex.clear();
    for (const food of foods) {
        const prefix = food.display_name.toLowerCase().substring(0, 3);
        if (!searchIndex.has(prefix)) searchIndex.set(prefix, []);
        searchIndex.get(prefix).push(food);
    }
}

before(() => buildTestIndex(FOODS));

// ---------------------------------------------------------------------------
// Empty / blank queries
// ---------------------------------------------------------------------------

describe('empty and blank queries', () => {
    it('returns [] for empty string', () => {
        assert.deepEqual(searchFoods('', FOODS), []);
    });

    it('returns [] for whitespace-only string', () => {
        assert.deepEqual(searchFoods('   ', FOODS), []);
    });
});

// ---------------------------------------------------------------------------
// Exact match (score 3 — ranked first)
// ---------------------------------------------------------------------------

describe('exact match', () => {
    it('returns the matched food as the first result', () => {
        const results = searchFoods('chicken breast', FOODS);
        assert.equal(results.length > 0, true);
        assert.equal(results[0].display_name, 'Chicken Breast');
    });

    it('ranks exact match above starts-with matches for same prefix', () => {
        // 'chicken breast' exact match must beat 'chicken soup' starts-with
        const results = searchFoods('chicken breast', FOODS);
        assert.equal(results[0].display_name, 'Chicken Breast');
    });

    it('exact match on a single-entry prefix returns exactly one result', () => {
        const results = searchFoods('apple juice', FOODS);
        assert.equal(results.length, 1);
        assert.equal(results[0].display_name, 'Apple Juice');
    });
});

// ---------------------------------------------------------------------------
// Starts-with match (score 2)
// ---------------------------------------------------------------------------

describe('starts-with match', () => {
    it('finds multiple foods that start with the same term', () => {
        const results = searchFoods('chicken', FOODS);
        const names = results.map(f => f.display_name);
        assert.ok(names.includes('Chicken Breast'));
        assert.ok(names.includes('Chicken Soup'));
    });

    it('sorts alphabetically when multiple results share the same score', () => {
        const results = searchFoods('beef', FOODS);
        assert.equal(results[0].display_name, 'Beef Burger');
        assert.equal(results[1].display_name, 'Beef Steak');
    });

    it('short query (<3 chars) falls back to full scan and still finds results', () => {
        const results = searchFoods('be', FOODS);
        const names = results.map(f => f.display_name);
        assert.ok(names.includes('Beef Steak'));
        assert.ok(names.includes('Beef Burger'));
    });
});

// ---------------------------------------------------------------------------
// Wildcard (*) queries
// ---------------------------------------------------------------------------

describe('wildcard (*)', () => {
    it('suffix wildcard (chick*) matches via prefix index', () => {
        const results = searchFoods('chick*', FOODS);
        const names = results.map(f => f.display_name);
        assert.ok(names.includes('Chicken Breast'));
        assert.ok(names.includes('Chicken Soup'));
    });

    it('leading wildcard (*cheese*) triggers full scan and matches substring', () => {
        const results = searchFoods('*cheese*', FOODS);
        const names = results.map(f => f.display_name);
        assert.ok(names.includes('Cheddar Cheese'));
        assert.ok(names.includes('Swiss Cheese'));
        assert.equal(names.length, 2);
    });

    it('* alone matches every food in the dataset', () => {
        const results = searchFoods('*', FOODS);
        assert.equal(results.length, FOODS.length);
    });

    it('wildcard in the middle (beef*steak) matches correctly', () => {
        const results = searchFoods('beef*steak', FOODS);
        const names = results.map(f => f.display_name);
        assert.ok(names.includes('Beef Steak'));
        assert.ok(!names.includes('Beef Burger'));
    });

    it('wildcard with no possible match returns []', () => {
        assert.deepEqual(searchFoods('*zzz*', FOODS), []);
    });
});

// ---------------------------------------------------------------------------
// No results
// ---------------------------------------------------------------------------

describe('no results', () => {
    it('returns [] when no food matches the query', () => {
        assert.deepEqual(searchFoods('xyz123', FOODS), []);
    });

    it('returns [] for a term that exists only as a substring without wildcard', () => {
        // 'breast' is a substring of 'Chicken Breast' but without * it requires
        // the name to start with 'breast' or be equal — neither is true here.
        const results = searchFoods('breast', FOODS);
        assert.deepEqual(results, []);
    });
});

// ---------------------------------------------------------------------------
// Case insensitive
// ---------------------------------------------------------------------------

describe('case insensitive search', () => {
    it('ALL CAPS query matches lower-cased stored names', () => {
        const results = searchFoods('BEEF', FOODS);
        const names = results.map(f => f.display_name);
        assert.ok(names.includes('Beef Steak'));
        assert.ok(names.includes('Beef Burger'));
    });

    it('mixed-case wildcard is handled correctly', () => {
        const results = searchFoods('*CHEESE*', FOODS);
        assert.equal(results.length, 2);
    });
});

// ---------------------------------------------------------------------------
// Special regex characters (must not throw)
// ---------------------------------------------------------------------------

describe('special regex characters in query', () => {
    it('dots are treated as literals — apple.juice does not match "Apple Juice"', () => {
        // The dot is escaped to \\. so it requires a literal dot, not a space
        const results = searchFoods('apple.juice', FOODS);
        assert.deepEqual(results, []);
    });

    it('parentheses in query do not throw', () => {
        assert.doesNotThrow(() => searchFoods('beef (steak)', FOODS));
    });

    it('+ in query does not throw', () => {
        assert.doesNotThrow(() => searchFoods('beef+steak', FOODS));
    });

    it('$ in query does not throw', () => {
        assert.doesNotThrow(() => searchFoods('beef$', FOODS));
    });

    it('^ in query does not throw', () => {
        assert.doesNotThrow(() => searchFoods('^beef', FOODS));
    });
});
