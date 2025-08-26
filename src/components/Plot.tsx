import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
  ToolboxComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type {
  EChartsOption,
  SeriesOption,
  ToolboxComponentOption,
} from "echarts";
import { safeCompile, type MathCompiled } from "@/lib/math";
import type { LimitResult } from "@/lib/limit";

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

/* ===================== tema ===================== */
function useDark(): boolean {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const el = document.documentElement;
    const mo = new MutationObserver(() => setDark(el.classList.contains("dark")));
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

/* ===================== amostragem ===================== */
type Pt = [number, number];
type Segments = Pt[][];

function sampleSegments(f: MathCompiled, x0: number, x1: number, px: number): { segs: Segments; asym: number[] } {
  // densidade: ~1 ponto a cada 2 px; buffer lateral 8%
  const N = Math.max(400, Math.min(8000, Math.floor(px / 2)));
  const len = x1 - x0;
  const min = x0 - 0.08 * len;
  const max = x1 + 0.08 * len;

  const xs = new Array<number>(N + 1);
  const ys = new Array<number | null>(N + 1);
  const CAP = 1e6;

  for (let i = 0; i <= N; i++) {
    const x = min + (i * (max - min)) / N;
    let y = f.evaluate({ x }) as number;
    if (typeof y !== "number" || !Number.isFinite(y) || Math.abs(y) > CAP) y = NaN as any;
    xs[i] = x;
    ys[i] = Number.isFinite(y) ? y : null;
  }

  // limiar adaptativo para "saltos" (assíntotas)
  let lo = Infinity, hi = -Infinity;
  for (const v of ys) if (v != null) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const spanY = Number.isFinite(hi - lo) && hi - lo > 0 ? hi - lo : 1;
  const TH = Math.max(50, spanY * 50);

  // marca null na borda do salto
  for (let i = 1; i <= N; i++) {
    const a = ys[i - 1], b = ys[i];
    if (a == null || b == null) continue;
    if (Math.abs(b - a) > TH) ys[i] = null;
  }

  // transforma em segmentos contíguos (sem null)
  const segs: Segments = [];
  let cur: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const y = ys[i];
    if (y == null) {
      if (cur.length > 1) segs.push(cur);
      cur = [];
    } else {
      cur.push([xs[i], y]);
    }
  }
  if (cur.length > 1) segs.push(cur);

  // assíntotas aproximadas no meio de blocos de null
  const asym: number[] = [];
  let run: number | null = null;
  for (let i = 0; i <= N; i++) {
    if (ys[i] == null) { if (run == null) run = i; }
    else if (run != null) { asym.push(xs[Math.floor((run + i - 1) / 2)]); run = null; }
  }
  if (run != null) asym.push(xs[Math.floor((run + N) / 2)]);

  return { segs, asym };
}

/* ===================== componente ===================== */
export function Plot({
  expression,
  around,
  limitResult,
}: {
  expression: string;
  around: number;
  limitResult: LimitResult | null;
}) {
  const dark = useDark();
  const compiled = useMemo(() => safeCompile(expression), [expression]);

  // viewport X controlado
  const [xRange, setXRange] = useState<[number, number]>(() => {
    const span = 2 + Math.max(1, Math.abs(around));
    return [around - span, around + span];
  });
  useEffect(() => {
    const span = 2 + Math.max(1, Math.abs(around));
    setXRange([around - span, around + span]);
  }, [expression, around]);

  // largura do container para densidade
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [pxW, setPxW] = useState(960);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((ents) => {
      setPxW(Math.max(720, Math.floor(ents[0].contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // amostragem com debounce leve
  const [{ segs, asym }, setSamp] = useState(() => sampleSegments(compiled, xRange[0], xRange[1], pxW));
  const tRef = useRef<number | null>(null);
  const resample = () => {
    if (tRef.current) cancelAnimationFrame(tRef.current);
    tRef.current = requestAnimationFrame(() => {
      setSamp(sampleSegments(compiled, xRange[0], xRange[1], pxW));
      tRef.current = null;
    });
  };
  useEffect(resample, [compiled, xRange, pxW]);

  // paleta
  const cGrid = dark ? "rgba(148,163,184,.22)" : "rgba(148,163,184,.28)"; // slate-400
  const cAxis = dark ? "#cbd5e1" : "#334155"; // slate-300 / 800
  const cText = dark ? "#e2e8f0" : "#0f172a"; // slate-200 / 900
  const cFx   = dark ? "#34d399" : "#059669"; // emerald-400 / 600
  const cA    = dark ? "#a78bfa" : "#7c3aed"; // violet-400 / 700
  const bg    = "transparent";

  // séries: cada segmento é uma linha contínua (sem lacunas internas)
  const series = useMemo(() => {
    const arr: SeriesOption[] = [];
    for (let i = 0; i < segs.length; i++) {
      arr.push({
        type: "line",
        name: i === 0 ? "f(x)" : `f(x) · ${i + 1}`,
        data: segs[i],
        showSymbol: false,
        symbol: "none",
        smooth: 0,
        lineStyle: { width: 2, color: cFx },
        connectNulls: true,
        emphasis: { focus: "series" },
        // linha x=a + assíntotas, desenhadas na primeira série
        markLine: i === 0 ? {
          symbol: "none",
          silent: true,
          lineStyle: { type: "dashed", width: 2, color: cA },
          data: [
            { xAxis: around },
            ...mergeAsym(asym, xRange).map(x => ({ xAxis: x })),
          ],
        } : undefined,
      } as SeriesOption);
    }
    // marcador do limite finito
    if (limitResult?.kind === "value") {
      arr.push({
        type: "line",
        data: [[around, (limitResult as any).value]],
        showSymbol: true,
        symbol: "circle",
        symbolSize: 10,
        lineStyle: { opacity: 0 },
        itemStyle: { color: "transparent", borderColor: cA, borderWidth: 2 },
        tooltip: { show: true, formatter: () => `x = ${around}<br/>lim f(x) = ${(limitResult as any).value}` },
      } as SeriesOption);
    }
    return arr;
  }, [segs, cFx, around, limitResult, cA, asym, xRange]);

  // toolbox com botões 100% clicáveis (oficial do ECharts)
  const toolbox = useMemo(() => {
    const iconPlus  = "path://M448 224v224H672v64H448V736H384V512H160V448H384V224h64z";
    const iconMinus = "path://M160 448H672v64H160z";
    return {
      show: true,
      right: 10,
      top: 10,
      itemSize: 16,
      feature: {
        myZoomIn: {
          show: true,
          title: "Zoom +",
          icon: iconPlus,
          onclick: () => zoom(0.85),
        },
        myZoomOut: {
          show: true,
          title: "Zoom −",
          icon: iconMinus,
          onclick: () => zoom(1 / 0.85),
        },
        restore: { title: "Resetar" },
        dataZoom: { yAxisIndex: "none", title: { zoom: "Zoom", back: "Voltar" } },
      },
    } as ToolboxComponentOption;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange]);

  // opção final
  const option = useMemo((): EChartsOption => ({
    animation: false,
    backgroundColor: bg,
    grid: { left: 56, right: 20, top: 54, bottom: 72, containLabel: false },
    toolbox,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", label: { backgroundColor: dark ? "#0b1220" : "#ffffff" } },
      valueFormatter: (v: any) => (typeof v === "number" ? v.toFixed(6) : String(v)),
    },
    xAxis: {
      type: "value",
      min: xRange[0],
      max: xRange[1],
      axisLine: { lineStyle: { color: cAxis } },
      axisLabel: { color: cText },
      splitLine: { lineStyle: { color: cGrid } },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLine: { lineStyle: { color: cAxis } },
      axisLabel: { color: cText },
      splitLine: { lineStyle: { color: cGrid } },
    },
    dataZoom: [
      { type: "inside", xAxisIndex: 0, filterMode: "none" },
      { type: "slider", xAxisIndex: 0, height: 18 },
    ],
    series,
    textStyle: { color: cText, fontFamily: "Inter, ui-sans-serif, system-ui" },
  }), [bg, toolbox, dark, xRange, cAxis, cText, cGrid, series]);

  // sincroniza xRange quando usuário pan/zoom/restaura
  const onEvents = useMemo(
    () => ({
      datazoom: (e: any) => {
        const zr = e?.batch?.[0] ?? e;
        if (zr && typeof zr.startValue === "number" && typeof zr.endValue === "number") {
          const nx: [number, number] = [zr.startValue, zr.endValue];
          setXRange((prev) => (prev[0] !== nx[0] || prev[1] !== nx[1] ? nx : prev));
        }
      },
      restore: () => resetView(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [around]
  );

  // refs para chamar setOption direto (zoom programático)
  const chartRef = useRef<ReactECharts>(null);
  function zoom(factor: number) {
    const [min, max] = xRange;
    const mid = (min + max) / 2;
    const nx: [number, number] = [mid - (mid - min) * factor, mid + (max - mid) * factor];
    setXRange(nx);
  }
  function resetView() {
    const span = 2 + Math.max(1, Math.abs(around));
    setXRange([around - span, around + span]);
  }

  return (
    <div ref={wrapperRef} className="w-full rounded-xl overflow-hidden">
      <ReactECharts
        ref={chartRef}
        option={option}
        notMerge={true}
        lazyUpdate={true}
        opts={{ renderer: "canvas", width: "auto", height: 600 }}
        style={{ width: "100%", height: 600 }}
        onEvents={onEvents}
      />
    </div>
  );
}

/* ===================== helpers ===================== */
function mergeAsym(xs: number[], range: [number, number]) {
  // junta assíntotas muito próximas para não poluir
  const [a, b] = range;
  const tol = (b - a) * 0.01;
  const out: number[] = [];
  const sorted = [...xs].sort((p, q) => p - q);
  for (const x of sorted) {
    if (!out.length || Math.abs(x - out[out.length - 1]) > tol) out.push(x);
  }
  return out;
}