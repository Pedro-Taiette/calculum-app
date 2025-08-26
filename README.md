# 📐 Calculum App

Aplicação web interativa para estudo de **limites** em Cálculo.  
Feita com **React + TypeScript + Vite**, estilizada com **TailwindCSS** e suportada por bibliotecas de matemática simbólica e visualização.  
Pronta para deploy no **GitHub Pages**.

---

## ✨ Recursos
- Entrada de funções por texto e **teclado matemático virtual**.
- Pré-visualização em notação matemática com **KaTeX**.
- Cálculo de limites **bilateral** e **unilaterais**:
  - Motor simbólico: **SymPy (via Pyodide/WebAssembly em Web Worker)**.
  - Simplificação algébrica: **Nerdamer**.
  - Parsing e LaTeX: **math.js**.
- Gráfico interativo com **ECharts** (zoom, pan, destaque em `x = a` e ponto-limite).
- Tema claro/escuro responsivo.
- Estrutura preparada para expansões futuras (**Derivadas**, **Integrais**).

---

## 🛠️ Stack
- **React 18 + TypeScript + Vite**
- **TailwindCSS** (tema claro/escuro)
- **KaTeX** (via `react-katex`)
- **math.js** (parser + LaTeX)
- **Nerdamer** (simplificação algébrica)
- **SymPy** (via Pyodide em Web Worker)
- **ECharts** (gráficos interativos)

---

## 🚀 Executar localmente
```bash
npm install
npm run dev
````

Abra [http://localhost:5173](http://localhost:5173).

---

## 📦 Build

```bash
npm run build
npm run preview
```

---

## 🧮 Sintaxe de funções

* **Variável**: `x`
* **Constantes**: `pi`, `e`
* **Funções**: `sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `abs`
* **Operadores**: `+ - * / ^`
* **Exemplos**:

  * `(x^2 - 1)/(x - 1)`
  * `sin(x)/x`
  * `(1 - cos(x))/x`
  * `ln(x)`
  * `sqrt(x+2)`

---

## 📂 Organização do código

```
src/
  components/
    ExpressionPreview.tsx   # Render LaTeX com KaTeX
    FunctionInput.tsx       # Campo de entrada + teclado virtual
    LimitControls.tsx       # Ponto 'a' e escolha do lado
    Plot.tsx                # Gráfico com ECharts
  workers/
    sympyLimit.worker.ts    # Worker Pyodide + SymPy
  lib/
    latex.ts                # math.js → LaTeX
    limit.ts                # combinação de limites laterais
    math.ts                 # wrapper seguro do math.js
  Docs.tsx                  # documentação embutida
  App.tsx
  main.tsx
  index.css                 # Tailwind
```

### 🔮 Extensões futuras

* **Derivadas**: cálculo simbólico + gráfico da reta tangente.
* **Integrais**: indefinidas (simbólico) e definidas (numéricas).
* **Limites no infinito**: assíntotas horizontais e oblíquas.
* **Funções por partes**: editor visual.

---

## 📜 Licença

MIT
