import React, { useEffect, useState } from "react";
import { FunctionInput } from "./components/FunctionInput";
import { ExpressionPreview } from "./components/ExpressionPreview";
import { Plot } from "./components/Plot";
import { computeLimit, type LimitResult, type LimitSide } from "./lib/limit";
import { ThemeToggle } from "./components/ThemeToggle";
import { LimitControls } from "./components/LimitControls";
import { Tabs, type TabKey } from "./components/Tabs";
import Docs from "./pages/Docs";
import { computeDerivative, type DerivativeResult } from "./lib/derivative";
import { DerivativeControls } from "./components/DerivativeControls";
import { math } from "./lib/math";
import { InlineMath } from "react-katex";
import { IntegralControls } from "./components/IntegralControls";
import {
  computeIndefiniteIntegral,
  computeIntegral,
  type IndefiniteIntegralResult,
  type IntegralResult,
} from "./lib/integral";
import { useDebouncedValue } from "./hooks/useDebouncedValue";

export default function App() {
  const [tab, setTab] = useState<TabKey>("limits");

  const [expr, setExpr] = useState("(x^2-1)/(x-1)");
  const [a, setA] = useState(1);
  const [side, setSide] = useState<LimitSide>("both");
  const [result, setResult] = useState<LimitResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [derivativeAt, setDerivativeAt] = useState(1);
  const [derivativeVar, setDerivativeVar] = useState("x");
  const [derivativeResult, setDerivativeResult] = useState<DerivativeResult | null>(null);
  const [derivativeLoading, setDerivativeLoading] = useState(false);

  const [integralVar, setIntegralVar] = useState("x");
  const [integralLower, setIntegralLower] = useState(0);
  const [integralUpper, setIntegralUpper] = useState(1);
  const [indefIntegralResult, setIndefIntegralResult] = useState<IndefiniteIntegralResult | null>(null);
  const [indefIntegralLoading, setIndefIntegralLoading] = useState(false);
  const [integralResult, setIntegralResult] = useState<IntegralResult | null>(null);
  const [integralLoading, setIntegralLoading] = useState(false);

  const debouncedExpr = useDebouncedValue(expr, 300);

  const debouncedLimitA = useDebouncedValue(a, 300);
  const debouncedLimitSide = useDebouncedValue(side, 300);

  const debouncedDerivativeAt = useDebouncedValue(derivativeAt, 300);
  const debouncedDerivativeVar = useDebouncedValue(derivativeVar, 300);

  const debouncedIntegralVar = useDebouncedValue(integralVar, 300);
  const debouncedIntegralLower = useDebouncedValue(integralLower, 300);
  const debouncedIntegralUpper = useDebouncedValue(integralUpper, 300);

  useEffect(() => {
    let live = true;
    setLoading(true);
    (async () => {
      const r = await computeLimit(debouncedExpr, debouncedLimitA, debouncedLimitSide);
      if (live) setResult(r);
      setLoading(false);
    })();
    return () => { live = false; };
  }, [debouncedExpr, debouncedLimitA, debouncedLimitSide]);

  useEffect(() => {
    let live = true;
    setDerivativeLoading(true);
    (async () => {
      const r = await computeDerivative(debouncedExpr, debouncedDerivativeAt, debouncedDerivativeVar);
      if (live) setDerivativeResult(r);
      setDerivativeLoading(false);
    })();
    return () => { live = false; };
  }, [debouncedExpr, debouncedDerivativeAt, debouncedDerivativeVar]);

  useEffect(() => {
    let live = true;
    setIndefIntegralLoading(true);
    (async () => {
      const r = await computeIndefiniteIntegral(debouncedExpr, debouncedIntegralVar);
      if (live) setIndefIntegralResult(r);
      setIndefIntegralLoading(false);
    })();
    return () => {
      live = false;
    };
  }, [debouncedExpr, debouncedIntegralVar]);

  useEffect(() => {
    let live = true;
    setIntegralLoading(true);
    (async () => {
      const r = await computeIntegral(
        debouncedExpr,
        debouncedIntegralLower,
        debouncedIntegralUpper,
        debouncedIntegralVar
      );
      if (live) setIntegralResult(r);
      setIntegralLoading(false);
    })();
    return () => { live = false; };
  }, [debouncedExpr, debouncedIntegralLower, debouncedIntegralUpper, debouncedIntegralVar]);

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
                <LimitControls variable={"x"} onChangeVariable={() => {}} a={a} onChangeA={setA} side={side} onChangeSide={setSide} />
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

      {tab === "derivatives" && (
        <>
          <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
            <div className="card p-5 space-y-4">
              <h2 className="section-title">Função f(x)</h2>
              <FunctionInput value={expr} onChange={setExpr} />
              <div className="space-y-3">
                <div>
                  <h3 className="muted mb-2">Pré-visualização</h3>
                  <ExpressionPreview expression={expr} variable={derivativeVar} />
                </div>
                <DerivativePreview derivativeExpr={derivativeResult?.derivativeExpr ?? null} variable={derivativeVar} />
              </div>
            </div>

            <div className="panel-sticky">
              <div className="card p-5 space-y-4">
                <h2 className="section-title">Derivada em um ponto</h2>
                <DerivativeControls
                  variable={derivativeVar}
                  onChangeVariable={setDerivativeVar}
                  point={derivativeAt}
                  onChangePoint={setDerivativeAt}
                />
                <DerivativeResultCard
                  loading={derivativeLoading}
                  result={derivativeResult}
                  at={derivativeAt}
                  variable={derivativeVar}
                />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="section-title mb-4">Gráfico</h2>
            <Plot expression={expr} around={derivativeAt} limitResult={null} />
          </section>
        </>
      )}
      {tab === "integrals" && (
        <>
          <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
            <div className="card p-5 space-y-4">
              <h2 className="section-title">Função f(x)</h2>
              <FunctionInput value={expr} onChange={setExpr} />
              <div className="space-y-3">
                <div>
                  <h3 className="muted mb-2">Pré-visualização</h3>
                  <ExpressionPreview expression={expr} variable={integralVar} />
                </div>
                <IntegralPreview integralExpr={indefIntegralResult?.expression} variable={integralVar} />
              </div>
            </div>

            <div className="panel-sticky">
              <div className="card p-5 space-y-4 mb-4">
                <h2 className="section-title">Integral indefinida</h2>
                <IndefiniteIntegralCard
                  loading={indefIntegralLoading}
                  result={indefIntegralResult}
                  variable={integralVar}
                  onChangeVariable={setIntegralVar}
                />
              </div>
              <div className="card p-5 space-y-4">
                <h2 className="section-title">Integral definida</h2>
                <IntegralControls
                  variable={integralVar}
                  onChangeVariable={setIntegralVar}
                  lower={integralLower}
                  upper={integralUpper}
                  onChangeLower={setIntegralLower}
                  onChangeUpper={setIntegralUpper}
                  showVariable={false}
                />
                <IntegralResultCard
                  loading={integralLoading}
                  result={integralResult}
                  lower={integralLower}
                  upper={integralUpper}
                  variable={integralVar}
                />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="section-title mb-4">Gráfico</h2>
            <Plot
              expression={expr}
              around={Number.isFinite((integralLower + integralUpper) / 2) ? (integralLower + integralUpper) / 2 : 0}
              limitResult={null}
              areaRange={[integralLower, integralUpper]}
            />
          </section>
        </>
      )}
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
      <div className={"text-2xl font-semibold " + color}>lim x → a {text === "" ? "" : `= ${text}`}</div>
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

function DerivativeResultCard({ loading, result, at, variable }: { loading: boolean; result: DerivativeResult | null; at: number; variable: string }) {
  const color =
    result?.kind === "value" ? "text-emerald-600 dark:text-emerald-400" :
    result?.kind === "undefined" ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-slate-300";

  const text =
    loading ? "Calculando…" :
    !result ? "—" :
    result.kind === "value" ? String(round(result.value)) :
    result.kind === "undefined" ? "Indefinido" : "Erro";

  const latexDer = result?.derivativeExpr ? toLatex(result.derivativeExpr, variable) : null;

  return (
    <div className="border rounded-xl p-4 bg-gray-50 dark:bg-slate-800/60 dark:border-slate-700 space-y-3">
      <div>
        <div className="text-sm text-gray-600 dark:text-slate-300 mb-1">Resultado</div>
        <div className={"text-2xl font-semibold " + color}>f'({variable}) em {variable}={at} {text === "" ? "" : `= ${text}`}</div>
        {result?.note && (
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">{result.note}</div>
        )}
        {result?.kind === "error" && (
          <div className="text-xs text-red-600 mt-2">{String(result.error)}</div>
        )}
      </div>

      {latexDer && (
        <div className="katex-box katex-box--muted">
          <InlineMath math={`f'(${variable})=\\displaystyle ${latexDer}`} />
          <div className="text-xs mt-1 text-gray-500 dark:text-slate-400">forma simbólica</div>
        </div>
      )}
    </div>
  );
}

function IntegralResultCard({ loading, result, lower, upper, variable }: { loading: boolean; result: IntegralResult | null; lower: number; upper: number; variable: string }) {
  const hasValue = result?.kind === "value" && result.definiteValue != null;
  const color =
    result?.kind === "error" ? "text-red-600 dark:text-red-400" :
    hasValue ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-slate-300";

  const text =
    loading ? "Calculando…" :
    result?.kind === "error" ? "Erro" :
    hasValue ? String(round(result.definiteValue as number)) : "—";

  return (
    <div className="border rounded-xl p-4 bg-gray-50 dark:bg-slate-800/60 dark:border-slate-700 space-y-3">
      <div>
        <div className="text-sm text-gray-600 dark:text-slate-300 mb-1">Integral definida</div>
        <div className={"text-2xl font-semibold " + color}>
          ∫
          <span className="inline-flex flex-col text-base ml-1 leading-none align-middle">
            <span className="align-super">{upper}</span>
            <span className="align-sub">{lower}</span>
          </span>
          <span className="ml-1"> f({variable}) d{variable} {text === "" ? "" : `= ${text}`}</span>
        </div>
        {result?.definiteNote && (
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">{result.definiteNote}</div>
        )}
        {result?.kind === "error" && (
          <div className="text-xs text-red-600 mt-2">{String(result.error)}</div>
        )}
      </div>
    </div>
  );
}

function IndefiniteIntegralCard({
  loading,
  result,
  variable,
  onChangeVariable,
}: {
  loading: boolean;
  result: IndefiniteIntegralResult | null;
  variable: string;
  onChangeVariable: (v: string) => void;
}) {
  const hasExpr = result?.kind === "value" && !!result.expression;
  const color =
    result?.kind === "error" ? "text-red-600 dark:text-red-400" :
    hasExpr ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-slate-300";

  const latex = result?.kind === "value" && result.expression ? toLatex(result.expression, variable) : null;

  const helperText =
    loading ? "Calculando…" :
    result?.kind === "error" ? "Erro ao integrar" :
    hasExpr ? "Expressão simbólica encontrada" : "—";

  return (
    <div className="border rounded-xl p-4 bg-gray-50 dark:bg-slate-800/60 dark:border-slate-700 space-y-3">
      <div className="grid-2-auto items-end gap-3">
        <div>
          <div className="text-sm text-gray-600 dark:text-slate-300 mb-1">Variável</div>
          <input
            className="input"
            maxLength={1}
            value={variable}
            onChange={(e) => onChangeVariable(e.target.value || "x")}
          />
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-slate-300">Resultado</div>
          <div className={"text-lg font-semibold " + color}>{helperText}</div>
          {result?.note && (
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{result.note}</div>
          )}
          {result?.kind === "error" && (
            <div className="text-xs text-red-600 mt-1">{String(result.error)}</div>
          )}
        </div>
      </div>

      {latex && (
        <div className="katex-box katex-box--muted">
          <InlineMath math={`\\int f(${variable})\\,d${variable}=\\displaystyle ${latex}`} />
          <div className="text-xs mt-1 text-gray-500 dark:text-slate-400">{result?.note ?? "forma simbólica"}</div>
        </div>
      )}
    </div>
  );
}

function DerivativePreview({ derivativeExpr, variable }: { derivativeExpr: string | null | undefined; variable: string }) {
  if (!derivativeExpr) return null;
  const latex = toLatex(derivativeExpr, variable);
  if (!latex) return null;
  return (
    <div>
      <h3 className="muted mb-2">f'({variable})</h3>
      <div className="katex-box katex-box--muted">
        <InlineMath math={`\\displaystyle ${latex}`} />
      </div>
    </div>
  );
}

function IntegralPreview({ integralExpr, variable }: { integralExpr: string | null | undefined; variable: string }) {
  if (!integralExpr) return null;
  const latex = toLatex(integralExpr, variable);
  if (!latex) return null;
  return (
    <div>
      <h3 className="muted mb-2">∫ f({variable}) d{variable}</h3>
      <div className="katex-box katex-box--muted">
        <InlineMath math={`\\int f(${variable})\\,d${variable}=\\displaystyle ${latex}`} />
      </div>
    </div>
  );
}

function toLatex(expr: string, variable: string) {
  try {
    const node = math.parse(expr.replace(/\^/g, "^"));
    return node.toTex({ parenthesis: "auto", implicit: "hide" });
  } catch {
    try {
      const escVar = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const node = math.parse(expr.replace(new RegExp(escVar, "g"), "x"));
      return node.toTex({ parenthesis: "auto", implicit: "hide" });
    } catch {
      return null;
    }
  }
}

function Placeholder({ title, desc }:{title:string; desc:string}) {
  return (
    <section className="card p-8 text-center space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-slate-300">{desc}</p>
      <div className="tag mx-auto">WIP</div>
    </section>
  );
}
