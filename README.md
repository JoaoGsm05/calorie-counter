# 🥗 Calorie Counter — USDA MyPyramid Explorer

Um aplicativo web moderno e ultrarrápido para consulta de dados nutricionais, desenvolvido com **JavaScript Vanilla**, com foco em fundamentos de engenharia de software, acessibilidade e performance de busca.

![Status do Projeto](https://img.shields.io/badge/Status-Conclu%C3%ADdo-4ade80?style=for-the-badge)
![Tecnologias](https://img.shields.io/badge/Stack-Vanilla_JS_|_CSS3_|_HTML5-blue?style=for-the-badge)

---

## 🚀 O Desafio Técnico

O objetivo central foi transformar uma base de dados bruta do USDA (3 planilhas Excel complexas) em uma aplicação web fluida que permitisse buscas instantâneas e interativas. 

Os principais desafios superados foram:
1. **Modelagem de Dados:** Normalização de mais de 2.000 linhas de dados para um formato JSON otimizado de 1.013 alimentos únicos.
2. **Performance de Busca:** Implementação de um motor de busca com suporte a **Curingas (*)** utilizando Regex dinâmico e indexação por Mapas (`Map`), garantindo respostas em milissegundos.
3. **UX Interativa:** Criação de uma interface "Zero Framework" que gerencia estados complexos (seleção de múltiplas porções e condimentos sugeridos) apenas com manipulação limpa do DOM.

## ✨ Funcionalidades Principais

- **🔍 Busca com Wildcard:** Use `*` para encontrar variações (ex: `chick*` para Chicken, Chickpeas, etc.).
- **⚖️ Porções Dinâmicas:** Alterne entre diferentes tamanhos de porção e veja as calorias e gorduras saturadas atualizarem instantaneamente.
- **🧂 Condimentos Sugeridos:** Descubra condimentos que acompanham o alimento selecionado, com seus respectivos valores calóricos.
- **📱 Design Responsivo & Dark Mode:** Interface otimizada para mobile e desktop com um tema escuro moderno e confortável.
- **♿ Acessibilidade (A11y):** Implementado com HTML semântico e atributos ARIA para garantir navegação por leitores de tela e teclado.

## 🛠️ Tech Stack & Arquitetura

- **Frontend:** HTML5 Semântico, CSS3 (Custom Properties / Flexbox / Grid).
- **Lógica:** JavaScript ES Modules (Vanilla).
- **Processamento:** Node.js + `xlsx` para conversão dos dados brutos.
- **Performance:** Estruturas de dados `Map` para lookup `O(1)` e indexação trigram.

## 📂 Estrutura do Projeto

```text
calorie-counter/
├── data/               # Banco de dados JSON e logs de integridade
├── js/                 # Módulos de lógica, busca e interface
├── css/                # Design System e componentes visuais
├── scripts/            # Ferramentas de pré-processamento (Excel -> JSON)
├── docs/               # Documentação de decisões e progresso
└── index.html          # Ponto de entrada da aplicação
```

## ⚙️ Como Executar Localmente

Como o projeto utiliza **ES Modules**, é necessário um servidor local para evitar erros de CORS:

1. Clone o repositório.
2. Navegue até a pasta `calorie-counter`.
3. Execute um servidor local (Ex: `npx serve .` ou use a extensão *Live Server* do VS Code).
4. Abra `http://localhost:3000` no seu navegador.

---

**Fonte de Dados:** USDA MyPyramid Food Raw Data.
**Desenvolvido como projeto de portfólio de alto nível.**
