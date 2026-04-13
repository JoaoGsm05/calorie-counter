# Registro de Progresso — Contador de Calorias

## Etapa 1 — Conversão Excel → JSON
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [BACKEND]
- **Arquivos criados/modificados:**
  - `scripts/convert-excel.js`
  - `data/foods.json`
  - `data/orphans.log`
- **Decisões tomadas:**
  - Inclusão de todos os 1.013 alimentos únicos da tabela Food_Display.
  - Mapeamento de condimentos via `condNeededMap`.
  - Agrupamento de porções no próprio objeto do alimento.
- **Pendências:** Nenhuma.

## Etapa 2 — Estrutura HTML/CSS Base
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [FRONTEND]
- **Arquivos criados/modificados:**
  - `index.html`
  - `css/styles.css`
  - `css/components.css`
- **Decisões tomadas:** Tema escuro, Vanilla CSS, Mobile-first.
- **Pendências:** Nenhuma.

## Etapas 3–6 — Lógica e Integração (MVP)
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [BACKEND]
- **Arquivos criados/modificados:**
  - `js/search.js`
  - `js/data-loader.js`
  - `js/ui.js`
  - `js/app.js`
- **Decisões tomadas:** Busca com Regex p/ curingas, indexação por Map, ES Modules.

## Etapa 7 — Polimento e README
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [REDAÇÃO]
- **Arquivos criados/modificados:**
  - `README.md`
- **Decisões tomadas:** Aplicação da skill humanizer para documentação profissional.

---

## Etapa 8 — Correção BUG-001 (searchIndex)
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [BACKEND]
- **Arquivos modificados:** `js/search.js`
- **Decisões tomadas:**
  - `search.js` agora importa `searchIndex` diretamente do `data-loader.js`.
  - Queries sem wildcard inicial com 3+ chars usam o índice de prefixo (O(1) lookup), reduzindo candidatos.
  - Queries com `*` no início ou < 3 chars fazem full scan (comportamento correto).
- **Pendências:** Nenhuma.

## Etapa 9 — Loading Skeleton
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [FRONTEND/UX]
- **Arquivos modificados:** `js/ui.js`, `css/components.css`, `js/app.js`
- **Decisões tomadas:**
  - 6 cards esqueleto animados com `@keyframes skeleton-pulse` mostrados enquanto `foods.json` carrega.
  - Após load, `clearAll()` restaura o estado inicial automaticamente.
- **Pendências:** Nenhuma.

## Etapa 10 — Histórico de Buscas (localStorage)
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [FRONTEND/UX]
- **Arquivos modificados:** `js/ui.js`, `js/app.js`, `index.html`, `css/components.css`
- **Decisões tomadas:**
  - Últimas 5 buscas únicas salvas em `localStorage` com chave `calorie-counter:history`.
  - Renderizadas como chips clicáveis abaixo do input de busca.
  - Clicar em um chip preenche o input e dispara a busca imediatamente.
- **Pendências:** Nenhuma.

## Etapa 11 — Calculadora de Refeição
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [FRONTEND/UX]
- **Arquivos modificados:** `js/ui.js`, `js/app.js`, `index.html`, `css/components.css`
- **Decisões tomadas:**
  - Botão `+ Add to Meal` em cada card; respeita a porção atualmente ativa.
  - Estado `mealItems[]` centralizado no `app.js`; eventos customizados (`meal:add`, `meal:remove`) desacoplam os cards do estado.
  - Bandeja fixa no rodapé com lista de itens, botão de remover individual e total de calorias.
  - `body.meal-active` adiciona padding-bottom para o conteúdo não ficar oculto.
- **Pendências:** Nenhuma.

## Etapa 12 — PWA (Progressive Web App)
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [BACKEND]
- **Arquivos criados/modificados:**
  - `manifest.json`
  - `service-worker.js`
  - `assets/icons/icon.svg`
  - `index.html` (link manifest + meta theme-color)
  - `js/app.js` (registro do SW)
- **Decisões tomadas:**
  - Service Worker usa estratégia cache-first para todos os assets locais.
  - Requisições cross-origin (Google Fonts) são ignoradas pelo SW e vão direto à rede.
  - Ícone SVG referenciado no manifest com `purpose: any maskable`.
  - SW registration falha silenciosamente fora de HTTPS (ambiente de dev local).
- **Pendências:** Nenhuma.

## Etapa 13 — Git Inicial + .gitattributes
- **Status:** ✅ Concluída
- **Data:** 2026-04-13
- **Papel principal:** [ARQUITETO]
- **Arquivos criados:**
  - `.gitattributes` (LF obrigatório para texto, binário para xlsx)
- **Decisões tomadas:** Primeiro commit com todos os 22 arquivos do projeto.
- **Pendências:** Configurar remote origin para deploy no GitHub Pages.

---

## Pós-MVP — Pendências Restantes

| Feature | Status | Prioridade |
|---------|--------|-----------|
| Deploy GitHub Pages | ⏳ Pendente | 🟡 Média |
| Testes unitários (search.js, data-loader.js) | ⏳ Pendente | 🟢 Baixa |
