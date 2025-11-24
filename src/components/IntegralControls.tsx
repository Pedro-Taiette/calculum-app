import { useEffect, useRef, useState } from "react";

function parseNumber(val: string): number | null {
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

export function IntegralControls({
  variable,
  onChangeVariable,
  lower,
  upper,
  onChangeLower,
  onChangeUpper,
  showVariable = true,
}: {
  variable: string;
  onChangeVariable: (v: string) => void;
  lower: number;
  upper: number;
  onChangeLower: (v: number) => void;
  onChangeUpper: (v: number) => void;
  showVariable?: boolean;
}) {
  const firstRender = useRef(true);
  const [lowerString, setLowerString] = useState(lower.toString());
  const [upperString, setUpperString] = useState(upper.toString());

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setLowerString(lower.toString());
      setUpperString(upper.toString());
    }
  }, [lower, upper]);

  return (
    <div className="space-y-3">
      <div className="grid-2-auto items-end">
        {showVariable ? (
          <div>
            <label className="text-sm text-gray-600 dark:text-slate-300">Variável</label>
            <input
              className="input"
              maxLength={1}
              value={variable}
              onChange={(e) => onChangeVariable(e.target.value || "x")}
            />
          </div>
        ) : (
          <div />
        )}
        <div>
          <label className="text-sm text-gray-600 dark:text-slate-300">Limite inferior</label>
          <input
            type="text"
            className="input"
            value={lowerString}
            inputMode="decimal"
            pattern="[0-9.,\\-/]*"
            onChange={(e) => {
              const val = e.target.value;
              setLowerString(val);
              const parsed = parseNumber(val);
              if (parsed !== null) onChangeLower(parsed);
            }}
            placeholder="ex.: 0, -1/2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-slate-300">Limite superior</label>
          <input
            type="text"
            className="input"
            value={upperString}
            inputMode="decimal"
            pattern="[0-9.,\\-/]*"
            onChange={(e) => {
              const val = e.target.value;
              setUpperString(val);
              const parsed = parseNumber(val);
              if (parsed !== null) onChangeUpper(parsed);
            }}
            placeholder="ex.: 1, 3/2"
          />
        </div>
      </div>
      <div className="tag">
        Intervalo: <span className="ml-1 font-semibold">{lowerString} ≤ {variable} ≤ {upperString}</span>
      </div>
    </div>
  );
}
