/**
 * convert.js — Etapa 1: Excel → JSON
 *
 * Riscos mitigados:
 *  R1  Valores numéricos como strings  → Number() em todos os campos numéricos
 *  R2  Alimentos órfãos silenciosos    → Registrados em orphans.log (não ignorados)
 *  R3  Mesmo Food_Code em múltiplas linhas → Map agrupa todas as porções
 *  R4  Condimento com 2+ porções       → Todas preservadas + regra de desambiguação documentada
 *  R5  Encoding UTF-8 incorreto        → fs.writeFileSync com { encoding: 'utf8' }
 *  R6  Rastreabilidade do arquivo fonte → SHA-256 do Excel registrado no JSON
 *  R7  Node.js versão mínima           → Validado no início (>=16)
 *  R8  Validação cruzada entre tabelas → Condimentos em Foods_Needing que não existem em lu_Condiment são logados
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const crypto = require('crypto');

// ─── R7: Validar versão mínima do Node.js ───────────────────────────────────
const [major] = process.versions.node.split('.').map(Number);
if (major < 16) {
  console.error(`❌ Node.js >= 16 necessário. Versão atual: ${process.versions.node}`);
  process.exit(1);
}

// ─── Caminhos ────────────────────────────────────────────────────────────────
const PROJ_ROOT = path.join(__dirname, '..');
const RAW_DIR   = path.join(PROJ_ROOT, 'data', 'raw');
const OUT_DIR   = path.join(PROJ_ROOT, 'data');
const OUT_JSON  = path.join(OUT_DIR,   'foods.json');
const OUT_ORPHAN = path.join(OUT_DIR,  'orphans.log');

const FILES = {
  display:    path.join(RAW_DIR, 'Food_Display_Table.xlsx'),
  condNeeded: path.join(RAW_DIR, 'Foods_Needing_Condiments_Table.xlsx'),
  luCond:     path.join(RAW_DIR, 'lu_Condiment_Food_Table.xlsx'),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** R1: Garante número real, nunca string como ".50000" */
function num(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/** R5/R6: Lê planilha e retorna { rows, sha256 } */
function readSheet(filePath) {
  const buf    = fs.readFileSync(filePath);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const wb     = xlsx.read(buf, { type: 'buffer', cellDates: true });
  const ws     = wb.Sheets[wb.SheetNames[0]];
  const rows   = xlsx.utils.sheet_to_json(ws, { defval: null });
  return { rows, sha256 };
}

/** Log helper */
const log = {
  info:  (...a) => console.log('[INFO]',  ...a),
  warn:  (...a) => console.warn('[WARN]',  ...a),
  error: (...a) => console.error('[ERROR]', ...a),
};

// ─── Leitura das planilhas ───────────────────────────────────────────────────
if (!fs.existsSync(RAW_DIR)) {
  log.error(`Pasta ${RAW_DIR} não encontrada. Copie os .xlsx para data/raw/`);
  process.exit(1);
}

log.info('Lendo planilhas...');
const display    = readSheet(FILES.display);
const condNeeded = readSheet(FILES.condNeeded);
const luCond     = readSheet(FILES.luCond);

log.info(`Food_Display       : ${display.rows.length} linhas`);
log.info(`Foods_Needing_Cond : ${condNeeded.rows.length} linhas`);
log.info(`lu_Condiment_Food  : ${luCond.rows.length} linhas`);

// ─── R3: Construir Map de Food_Display agrupado por Food_Code ─────────────────
// Cada código pode ter múltiplas linhas (porções diferentes)
const displayMap = new Map(); // Food_Code → [{ porção1 }, { porção2 }, ...]

for (const row of display.rows) {
  const code = String(num(row.Food_Code));
  if (!displayMap.has(code)) displayMap.set(code, []);

  displayMap.get(code).push({
    portion_default:      num(row.Portion_Default),
    portion_amount:       num(row.Portion_Amount),
    portion_display_name: row.Portion_Display_Name ?? '',
    factor:               num(row.Factor),
    increment:            num(row.Increment),
    multiplier:           num(row.Multiplier),
    nutrients: {
      calories:        num(row.Calories),
      grains:          num(row.Grains),
      whole_grains:    num(row.Whole_Grains),
      vegetables:      num(row.Vegetables),
      orange_veg:      num(row.Orange_Vegetables),
      dkgreen_veg:     num(row.Drkgreen_Vegetables),
      starchy_veg:     num(row.Starchy_vegetables),
      other_veg:       num(row.Other_Vegetables),
      fruits:          num(row.Fruits),
      milk:            num(row.Milk),
      meats:           num(row.Meats),
      soy:             num(row.Soy),
      drybeans_peas:   num(row.Drybeans_Peas),
      oils:            num(row.Oils),
      solid_fats:      num(row.Solid_Fats),
      added_sugars:    num(row.Added_Sugars),
      alcohol:         num(row.Alcohol),
      saturated_fats:  num(row.Saturated_Fats),
    },
  });
}

// ─── R4: Construir Map de lu_Condiment agrupado por survey_food_code ──────────
// Mesma regra: um condimento pode ter múltiplas porções → array
const luCondMap = new Map(); // condiment_code → [{ porção1 }, { porção2 }, ...]

for (const row of luCond.rows) {
  const code = String(num(row.survey_food_code));
  if (!luCondMap.has(code)) luCondMap.set(code, []);

  luCondMap.get(code).push({
    display_name:           row.display_name ?? '',
    portion_size:           row.condiment_portion_size ?? '',
    portion_code:           num(row.condiment_portion_code),
    // R4: Regra de desambiguação documentada:
    //   Quando há múltiplas porções para o mesmo condimento, todas são preservadas
    //   no array. O cliente deve usar portion_size para apresentar as opções ao usuário
    //   e portion_code para identificar a porção padrão (Portion_Default == 1).
    nutrients: {
      grains:             num(row.condiment_grains),
      whole_grains:       num(row.condiment_whole_grains),
      vegetables:         num(row.condiment_vegetables),
      dkgreen:            num(row.condiment_dkgreen),
      orange:             num(row.condiment_orange),
      starchy_veg:        num(row.condiment_starchy_vegetables),
      other_veg:          num(row.condiment_other_vegetables),
      fruits:             num(row.condiment_fruits),
      milk:               num(row.condiment_milk),
      meat:               num(row.condiment_meat),
      soy:                num(row.condiment_soy),
      drybeans_peas:      num(row.condiment_drybeans_peas),
      oils:               num(row.condiment_oils),
      solid_fats:         num(row.condiment_solid_fats),
      added_sugars:       num(row.condiment_added_sugars),
      alcohol:            num(row.condiment_alcohol),
      calories:           num(row.condiment_calories),
      saturated_fats:     num(row.condiment_saturated_fats),
    },
  });
}

// ─── Map de Foods_Needing_Condiments para busca rápida ────────────────────────
const condNeededMap = new Map(); // Survey_Food_Code -> row
for (const row of condNeeded.rows) {
  condNeededMap.set(String(num(row.Survey_Food_Code)), row);
}

// ─── Montar JSON final ────────────────────────────────────────────────────────
const orphans     = [];   // R2: alimentos em condNeeded não encontrados em Food_Display
const missingCond = [];   // R8: condimentos referenciados mas ausentes em lu_Condiment
const result      = [];

// Iterar sobre TODOS os alimentos únicos encontrados em Food_Display
for (const [foodCode, portions] of displayMap.entries()) {
  const condRow = condNeededMap.get(foodCode);
  const condiments = [];

  // Se o alimento precisa de condimentos, processá-los
  if (condRow) {
    for (let i = 1; i <= 5; i++) {
      const condCode = condRow[`cond_${i}_code`];
      const condName = condRow[`cond_${i}_name`];
      if (condCode == null) continue;

      const condKey    = String(num(condCode));
      const condDetail = luCondMap.get(condKey);

      if (!condDetail) {
        missingCond.push({
          food_code:      foodCode,
          food_name:      portions[0]?.display_name ?? condRow.display_name ?? '',
          condiment_code: condKey,
          condiment_name: condName ?? '',
        });
      }

      condiments.push({
        code:    condKey,
        name:    condName ?? '',
        portions: condDetail ?? [],
      });
    }
  }

  // Encontrar o nome canônico do alimento (usando a primeira porção disponível)
  // Nota: A tabela Food_Display_Table.xlsx original tem a coluna 'Display_Name'
  // No loop de construção do displayMap, precisamos garantir que o nome seja preservado.
  // Vou ajustar o displayMap no passo anterior se necessário, mas por enquanto:
  const firstPortionRow = display.rows.find(r => String(num(r.Food_Code)) === foodCode);
  const displayName = firstPortionRow ? firstPortionRow.Display_Name : (condRow?.display_name ?? 'Unknown Food');

  result.push({
    food_code:    foodCode,
    display_name: displayName,
    portions,
    condiments,
  });
}

// R2: Verificar se algum alimento em condNeeded NÃO existe em Food_Display (Órfãos)
for (const row of condNeeded.rows) {
  const code = String(num(row.Survey_Food_Code));
  if (!displayMap.has(code)) {
    orphans.push({
      Survey_Food_Code: code,
      display_name:     row.display_name ?? '(sem nome)',
    });
    log.warn(`Alimento órfão (em condimentos mas não em display): code=${code} name="${row.display_name}"`);
  }
}

// ─── R5: Escrever JSON com encoding UTF-8 explícito ──────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const output = {
  // R6: Metadados de rastreabilidade
  _meta: {
    generated_at: new Date().toISOString(),
    source_files: {
      Food_Display_Table:              { sha256: display.sha256,    rows: display.rows.length },
      Foods_Needing_Condiments_Table:  { sha256: condNeeded.sha256, rows: condNeeded.rows.length },
      lu_Condiment_Food_Table:         { sha256: luCond.sha256,     rows: luCond.rows.length },
    },
    stats: {
      foods_exported:    result.length,
      orphans_skipped:   orphans.length,
      missing_condiment: missingCond.length,
    },
  },
  foods: result,
};

// R5: UTF-8 explícito
fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), { encoding: 'utf8' });
log.info(`✅ JSON gerado: ${OUT_JSON} (${result.length} alimentos)`);

// ─── R2: Escrever log de órfãos ───────────────────────────────────────────────
if (orphans.length > 0 || missingCond.length > 0) {
  const logLines = [
    `=== orphans.log — ${new Date().toISOString()} ===\n`,
    `--- Alimentos em Foods_Needing_Condiments sem entrada em Food_Display (${orphans.length}) ---`,
    ...orphans.map(o => `  [ORPHAN]  code=${o.Survey_Food_Code}  name="${o.display_name}"`),
    '',
    `--- Condimentos referenciados sem dados em lu_Condiment_Food (${missingCond.length}) ---`,
    ...missingCond.map(c => `  [MISSING_COND]  food="${c.food_name}" (${c.food_code})  cond="${c.condiment_name}" (${c.condiment_code})`),
  ].join('\n');

  fs.writeFileSync(OUT_ORPHAN, logLines, { encoding: 'utf8' });
  log.warn(`⚠️  ${orphans.length} órfãos e ${missingCond.length} condimentos ausentes → ${OUT_ORPHAN}`);
} else {
  log.info('✅ Nenhum órfão ou condimento ausente encontrado.');
}

log.info('Concluído.');
