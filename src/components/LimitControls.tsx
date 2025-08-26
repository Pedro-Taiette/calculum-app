import type { LimitSide } from "@/lib/limit";

export function LimitControls({
  variable, onChangeVariable, a, onChangeA, side, onChangeSide
}: {
  variable: string; onChangeVariable:(v:string)=>void;
  a: number; onChangeA: (v:number)=>void;
  side: LimitSide; onChangeSide: (s: LimitSide)=>void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid-2-auto items-end">
        <div>
          <label className="text-sm text-gray-600 dark:text-slate-300">Variável</label>
          <input className="input" maxLength={1} value={variable} onChange={e=>onChangeVariable(e.target.value || "x")} />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-slate-300">Tende a</label>
          <input type="number" className="input" value={Number.isFinite(a) ? a : ""} onChange={e=>onChangeA(Number(e.target.value))} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600 dark:text-slate-300">Tipo</label>
          <div className="row-wrap">
            <Radio label="Bilateral" checked={side==="both"} onChange={()=>onChangeSide("both")} />
            <Radio label="Esquerda"  checked={side==="left"} onChange={()=>onChangeSide("left")} />
            <Radio label="Direita"   checked={side==="right"} onChange={()=>onChangeSide("right")} />
          </div>
        </div>
      </div>
      <div className="tag">Visualização: <span className="ml-1 font-semibold">{variable} → {a}</span> {side!=="both" && <span className="ml-2">({side==="left"?"pela esquerda":"pela direita"})</span>}</div>
    </div>
  );
}

function Radio({ label, checked, onChange }:{label:string; checked:boolean; onChange:()=>void}) {
  return <button type="button" onClick={onChange} className={`btn ${checked ? "btn-primary" : "btn-ghost"} shrink-0`}>{label}</button>;
}