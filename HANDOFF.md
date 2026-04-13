# 🤝 Handover — Contador de Calorias (USDA MyPyramid Explorer)

Este documento registra o estado final do projeto em **13 de Abril de 2026** para guiar futuras sessões de desenvolvimento com IA.

---

## 📍 Onde Paramos?
O **MVP (Mínimo Produto Viável)** foi 100% concluído. O sistema está funcional, integrado e com visual polido.

### O que está funcionando:
1. **Dados:** Script de conversão `scripts/convert-excel.cjs` gera um JSON de 1.013 alimentos.
2. **Motor:** Busca com Wildcard (*) e ordenação por relevância em `js/search.js`.
3. **UI:** Renderização de cards com troca de porção em tempo real e lista de condimentos em `js/ui.js`.
4. **Design:** Tema escuro (Dark Mode) responsivo usando CSS puro.

---

## 🛠️ Como rodar este projeto?
Devido ao uso de **ES Modules**, o navegador exige um servidor HTTP para carregar o `foods.json`.

**No Windows:**
- Abrir a pasta no VS Code e usar a extensão **Live Server**.
- Ou rodar `npx serve .` na raiz da pasta `calorie-counter`.
- Ou rodar `python -m http.server 8000`.

---

## 📂 Arquitetura do Sistema
- `js/app.js`: Orquestrador (listeners de botões, teclado e busca).
- `js/data-loader.js`: Fetch do JSON + Indexação em `Map`.
- `js/search.js`: Lógica de Regex para curingas.
- `js/ui.js`: Gerenciamento do DOM e renderização de cards.

---

## 🔮 Próximos Passos Sugeridos
Se desejar evoluir o projeto, as próximas etapas lógicas seriam:
1. **Histórico Local:** Usar `localStorage` para salvar as últimas 5 buscas.
2. **Calculadora de Refeição:** Permitir adicionar alimentos a uma "bandeja" e somar o total de calorias.
3. **PWA:** Adicionar um `manifest.json` e `service-worker.js` para funcionamento offline.
4. **Melhoria Visual:** Adicionar um *Loading Skeleton* enquanto o JSON carrega.

---

**Estado Final:** Projeto estável, código limpo e documentado.
**Equipe Responsável:** Equipe de Especialistas (via Gemini CLI).
