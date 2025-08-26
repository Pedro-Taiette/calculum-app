# Calculadora de Cálculo — Limites

Aplicação web interativa para estudar **limites** em Cálculo. Feita com **React + TypeScript + Vite**, **TailwindCSS**, **Math.js**, **KaTeX** e **Plotly**. Pronta para publicar no **GitHub Pages**.

## Recursos
- Entrada de funções por texto e **teclado matemático virtual**.
- Pré-visualização em notação matemática com **KaTeX**.
- Cálculo de limites **bilateral** e **unilaterais** por aproximação numérica.
- Gráfico interativo com zoom/pan e destaque em **x = a**.
- Estrutura pronta para expansões futuras (**Derivadas**, **Integrais**).

## Stack
- React 18, TypeScript, Vite
- TailwindCSS
- Math.js
- KaTeX (via `react-katex`)
- Plotly (via `react-plotly.js` e `plotly.js-dist-min`)

## Executar localmente
```bash
npm i
npm run dev
```
Abra `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages
1. Faça login no GitHub e crie um repositório vazio.
2. Confirme que `vite.config.ts` usa `base: "./"` (já configurado).
3. Configure o Pages para a branch `gh-pages` após o primeiro deploy: *Settings → Pages → Branch: gh-pages / root*.
4. Rode:
```bash
npm run deploy
```
O script usa `gh-pages` para publicar a pasta `dist`.

## Sintaxe de funções
- Variável: `x`
- Constantes: `pi`, `e`
- Funções: `sin`, `cos`, `tan`, `log` (`log(x, e)` equivale a `ln(x)`), `sqrt`
- Operadores: `+ - * / ^`
- Exemplos: `sin(x)/x`, `abs(x)`, `(x^2 - 1)/(x - 1)`

## Organização do código
```
src/
  components/
    ExpressionPreview.tsx   # f(x) em KaTeX
    FunctionInput.tsx       # input + teclado virtual
    LimitControls.tsx       # a e lado (both/left/right)
    Plot.tsx                # gráfico com Plotly
  lib/
    latex.ts                # parse → LaTeX
    limit.ts                # algoritmo de limite numérico
    math.ts                 # wrapper seguro do math.js
  App.tsx
  main.tsx
  index.css                 # Tailwind
```
### Extensão futura
- Adicione módulos `derivative.ts`, `integral.ts` em `lib/` e novas telas.
- Reuse `safeCompile` e `ExpressionPreview`.

## Licença
MIT
