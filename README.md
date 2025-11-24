# 📐 Calculum App

Aplicação web interativa para estudo de **limites**, **derivadas** e **integrais** de funções de uma variável.
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
- Derivadas com cálculo simbólico (SymPy) e valor numérico em um ponto.
- Integrais:
  - **Indefinidas** (simbólico, sem precisar informar limites).
  - **Definidas** (valor numérico + tentativa simbólica quando possível) com destaque de área no gráfico.
- Gráfico interativo com **ECharts** (zoom, pan, destaque de pontos e áreas).
- Tema claro/escuro responsivo.

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
    DerivativeControls.tsx  # Variável e ponto para f'(x)
    IntegralControls.tsx    # Variável (opcional) + limites da integral definida
    Plot.tsx                # Gráfico com ECharts e realce da área integrada
  lib/
    limit.ts                # Combinação de limites laterais
    derivative.ts           # Derivada simbólica + numérica
    integral.ts             # Integrais definidas (numérico) e indefinidas (simbólico)
    math.ts / latex.ts      # wrapper seguro do math.js e conversão para LaTeX
    sympy*Client.ts         # ponte com Web Workers do Pyodide/SymPy
  pages/Docs.tsx            # documentação embutida na aba "Docs"
  App.tsx                   # navegação por abas e orquestração
```

### 🔮 Extensões futuras

* **Limites no infinito**: assíntotas horizontais e oblíquas.
* **Funções por partes**: editor visual.

---

## 📜 Licença

MIT
