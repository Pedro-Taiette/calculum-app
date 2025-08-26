import React, { useEffect, useState } from "react";
import { FunctionInput } from "./components/FunctionInput";
import { ExpressionPreview } from "./components/ExpressionPreview";
import { Plot } from "./components/Plot";
import { computeLimit, type LimitResult, type LimitSide } from "./lib/limit";
import { ThemeToggle } from "./components/ThemeToggle";
import { LimitControls } from "./components/LimitControls";
import { Tabs, type TabKey } from "./components/Tabs";
import Docs from "./pages/Docs";

export default function App() {
  const [tab, setTab] = useState<TabKey>("limits");

  const [expr, setExpr] = useState("(x^2-1)/(x-1)");
  const [a, setA] = useState(1);
  const [side, setSide] = useState<LimitSide>("both");
  const [result, setResult] = useState<LimitResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    (async () => {
      const r = await computeLimit(expr, a, side);
      if (live) setResult(r);
      setLoading(false);
    })();
    return () => { live = false; };
  }, [expr, a, side]);

  return (
    <div className="container-p py-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold">Calculadora de Cálculo</h1>
        <div className="row-wrap"><ThemeToggle /></div>
      </header>

      <div className="card p-4">
        <Tabs value={tab} onChange={setTab} />
      </div>

      {tab === "limits" && (
      <>
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
          {/* Coluna esquerda: entrada + preview */}
          <div className="card p-5 space-y-4">
            <h2 className="section-title">Função f(x)</h2>
            <FunctionInput value={expr} onChange={setExpr} />
            <div>
              <h3 className="muted mb-2">Pré-visualização</h3>
              <ExpressionPreview expression={expr} />
            </div>
          </div>

          {/* Coluna direita: controles + resultado (fixo no scroll) */}
          <div className="panel-sticky">
            <div className="card p-5 space-y-4">
              <h2 className="section-title">Configurações do Limite</h2>
              <LimitControls
                variable={"x"} onChangeVariable={()=>{}}
                a={a} onChangeA={setA}
                side={side} onChangeSide={setSide}
              />
              <ResultCard loading={loading} result={result} />
            </div>
          </div>
        </section>

        {/* Gráfico em largura total abaixo */}
        <section className="card p-5">
          <h2 className="section-title mb-4">Gráfico</h2>
          <Plot expression={expr} around={a} limitResult={result} />
        </section>
      </>
    )}


      {tab === "derivatives" && <Placeholder title="Derivadas" desc="Em breve." />}
      {tab === "integrals" && <Placeholder title="Integrais" desc="Em breve." />}
      {tab === "docs" && <Docs />}
    </div>
  );
}

function ResultCard({ loading, result }: { loading: boolean; result: LimitResult | null }) {
  const color =
    result?.kind === "value" ? "text-emerald-600 dark:text-emerald-400" :
    result?.kind === "infinity" ? "text-blue-600 dark:text-blue-400" :
    result?.kind === "neg_infinity" ? "text-red-600 dark:text-red-400" :
    result?.kind === "undefined" ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-slate-300";

  const text =
    loading ? "Calculando…" :
    !result ? "—" :
    result.kind === "value" ? String(round(result.value)) :
    result.kind === "infinity" ? "∞" :
    result.kind === "neg_infinity" ? "−∞" :
    result.kind === "undefined" ? "Indeterminado" : "Erro";

  return (
    <div className="border rounded-xl p-4 bg-gray-50 dark:bg-slate-800/60 dark:border-slate-700">
      <div className="text-sm text-gray-600 dark:text-slate-300 mb-1">Resultado</div>
      <div className={"text-2xl font-semibold " + color}>lim x → a {text === "—" ? "" : `= ${text}`}</div>
      {result?.note && (
        <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">{result.note}</div>
      )}
      {result?.kind === "error" && (
        <div className="text-xs text-red-600 mt-2">{String(result.error)}</div>
      )}
    </div>
  );
}
function round(n:number, d=6){ const p=10**d; return Math.round(n*p)/p; }

function Placeholder({ title, desc }:{title:string; desc:string}) {
  return (
    <section className="card p-8 text-center space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-slate-300">{desc}</p>
      <div className="tag mx-auto">WIP</div>
    </section>
  );
}
