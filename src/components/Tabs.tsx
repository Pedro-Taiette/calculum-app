export type TabKey = "limits" | "derivatives" | "integrals" | "docs";

export function Tabs({ value, onChange }:{
  value: TabKey; onChange:(t:TabKey)=>void;
}) {
  const Item = (k:TabKey, label:string) => (
    <button
      type="button"
      onClick={()=>onChange(k)}
      className={
        "px-4 py-2 rounded-xl text-sm " +
        (value===k ? "bg-primary text-white" : "btn-ghost")
      }
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-2 flex-wrap">
      {Item("limits","Limites")}
      {Item("derivatives","Derivadas")}
      {Item("integrals","Integrais")}
      {Item("docs","Documentação")}
    </div>
  );
}
