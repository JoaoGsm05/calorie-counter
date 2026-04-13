# Registro de Decisões Técnicas — Contador de Calorias

## DEC-001: Vanilla JS vs Frameworks
- **Contexto:** Projeto para portfólio que deve demonstrar fundamentos sólidos.
- **Decisão:** Usar JavaScript Vanilla com ES Modules.
- **Justificativa:** Menor dependência externa, melhor demonstração de habilidades de base (DOM, Fetch, Regex).

## DEC-002: JSON Estático como Banco de Dados
- **Contexto:** Volume de dados ~1.000 itens nutricionais.
- **Decisão:** Carregar todo o arquivo `foods.json` no início da aplicação.
- **Justificativa:** Volume de ~1MB é perfeitamente aceitável para um carregamento único em aplicações modernas, permitindo buscas instantâneas no lado do cliente.

## DEC-003: Inversão da Lógica de Exportação (Bugfix)
- **Contexto:** O script inicial exportava apenas 289 alimentos que possuíam condimentos.
- **Decisão:** Inverter o loop para iterar sobre a tabela `Food_Display` (todos os alimentos) e anexar condimentos opcionalmente.
- **Justificativa:** O requisito original exige a busca por todos os alimentos, não apenas os que têm condimentos.
