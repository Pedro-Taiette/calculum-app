type Props = { onInsert: (token: string) => void };

const groups = [
  { title: "Números", keys: "7 8 9 4 5 6 1 2 3 0 .".split(" ").map(k=>({label:k, token:k})) },
  { title: "Operadores", keys: [
    {label:"+", token:"+"},{label:"−", token:"-"},{label:"×", token:"*"},{label:"÷", token:"/"},
    {label:"^", token:"^"},{label:"(", token:"("},{label:")", token:")"},{label:"x", token:"x"}
  ]},
  { title: "Funções", keys: [
    {label:"sin", token:"sin("},{label:"cos", token:"cos("},{label:"tan", token:"tan("},
    {label:"log", token:"log("},{label:"ln", token:"log(, e)"},{label:"sqrt", token:"sqrt("}
  ]},
  { title: "Constantes", keys: [{label:"π", token:"pi"}, {label:"e", token:"e"}] }
] as const;

export function MathKeyboard({ onInsert }: Props) {
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">{g.title}</div>
          <div className="grid-kbd">
            {g.keys.map((k, i) => (
              <button key={g.title + i} type="button" onClick={() => onInsert(k.token)}
                className="btn btn-ghost w-full">{k.label}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}