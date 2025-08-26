import { useState, useEffect, useRef } from "react";
import type { LimitSide } from "@/lib/limit";

export function LimitControls({
  variable, onChangeVariable, a, onChangeA, side, onChangeSide
}: {
  variable: string; onChangeVariable:(v:string)=>void;
  a: number; onChangeA: (v:number)=>void;
  side: LimitSide; onChangeSide: (s: LimitSide)=>void;
}) {
  // Só sincroniza aString com a no primeiro render, ou quando a mudar externamente
  const firstRender = useRef(true);
  const [aString, setAString] = useState(a.toString());

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setAString(a.toString());
    } else {
      // Só sincroniza se a mudança veio de fora (não do input)
      // Exemplo: reset, ou mudança por props externas
      // Se quiser sempre manter o digitado, pode REMOVER essa linha!
      // setAString(a.toString());
    }
  }, [a]);

  function parseA(val: string): number | null {
    if (val.trim() === "") return null;
    const sanitized = val.replace(",", ".").trim();
    if (/^-?\d+\s*\/\s*-?\d+$/.test(sanitized)) {
      const [numer, denom] = sanitized.split("/").map(s => Number(s.trim()));
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
            onChange={e => onChangeVariable(e.target.value || "x")}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-slate-300">Tende a</label>
          <input
            type="text"
            className="input"
            value={aString}
            inputMode="decimal"
            pattern="[0-9.,\\-/]*"
            onChange={e => {
              const val = e.target.value;
              setAString(val);
              const parsed = parseA(val);
              if (parsed !== null) onChangeA(parsed);
            }}
            placeholder="Digite um número ou fração"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600 dark:text-slate-300">Tipo</label>
          <div className="row-wrap">
            <Radio label="Bilateral" checked={side === "both"} onChange={() => onChangeSide("both")} />
            <Radio label="Esquerda"  checked={side === "left"} onChange={() => onChangeSide("left")} />
            <Radio label="Direita"   checked={side === "right"} onChange={() => onChangeSide("right")} />
          </div>
        </div>
      </div>
      <div className="tag">
        Visualização: <span className="ml-1 font-semibold">{variable} → {aString}</span>
        {parseA(aString) !== null && aString.includes("/") && (
          <span className="ml-2 text-xs text-gray-500">(≈ {parseA(aString)?.toPrecision(4)})</span>
        )}
        {side !== "both" && (
          <span className="ml-2">
            ({side === "left" ? "pela esquerda" : "pela direita"})
          </span>
        )}
      </div>
    </div>
  );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`btn ${checked ? "btn-primary" : "btn-ghost"} shrink-0`}
    >
      {label}
    </button>
  );
}