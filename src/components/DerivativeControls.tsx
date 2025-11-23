import { useEffect, useRef, useState } from "react";

export function DerivativeControls({
  variable,
  onChangeVariable,
  point,
  onChangePoint,
}: {
  variable: string;
  onChangeVariable: (v: string) => void;
  point: number;
  onChangePoint: (v: number) => void;
}) {
  const firstRender = useRef(true);
  const [pointStr, setPointStr] = useState(point.toString());

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setPointStr(point.toString());
    }
  }, [point]);

  function parsePoint(val: string): number | null {
    if (val.trim() === "") return null;
    const sanitized = val.replace(",", ".").trim();
    if (/^-?\d+\s*\/\s*-?\d+$/.test(sanitized)) {
      const [numer, denom] = sanitized.split("/").map((s) => Number(s.trim()));
      if (denom === 0) return null;
      return numer / denom;
    }
    const num = Number(sanitized);
    return Number.isFinite(num) ? num : null;
  }

  return (
    <div className="space-y-3">
      <div className="grid-2-auto items-end">
        <div>
          <label className="text-sm text-gray-600 dark:text-slate-300">Variável</label>
          <input
            className="input"
            maxLength={1}
            value={variable}
            onChange={(e) => onChangeVariable(e.target.value || "x")}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-slate-300">Avaliar em</label>
          <input
            type="text"
            className="input"
            value={pointStr}
            inputMode="decimal"
            pattern="[0-9.,\\-/]*"
            onChange={(e) => {
              const val = e.target.value;
              setPointStr(val);
              const parsed = parsePoint(val);
              if (parsed !== null) onChangePoint(parsed);
            }}
            placeholder="Digite um número ou fração"
          />
        </div>
      </div>
      <div className="tag">
        Visualização: <span className="ml-1 font-semibold">{variable} = {pointStr}</span>
        {parsePoint(pointStr) !== null && pointStr.includes("/") && (
          <span className="ml-2 text-xs text-gray-500">(≈ {parsePoint(pointStr)?.toPrecision(4)})</span>
        )}
      </div>
    </div>
  );
}
