import React, { useRef } from "react";

export function FunctionInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const insert = (txt: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + txt + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + txt.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const Row = ({
    title,
    items,
    defaultOpen = true,
  }: {
    title: string;
    items: { label: string; insert: string; aria?: string }[];
    defaultOpen?: boolean;
  }) => (
    <details className="mt-3" open={defaultOpen}>
      <summary className="cursor-pointer select-none muted mb-2">{title}</summary>
      <div className="grid-kbd">
        {items.map((b) => (
          <button
            key={b.label + b.insert}
            type="button"
            className="kbd-btn"
            onClick={() => insert(b.insert)}
            aria-label={b.aria ?? b.label}
          >
            {b.label}
          </button>
        ))}
      </div>
    </details>
  );

  return (
    <div>
      <div className="row-wrap mb-2">
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ex.: (x^2-1)/(x-1), sin(x)/x, ln(x)"
          className="input w-full"
          spellCheck={false}
          autoComplete="off"
          aria-label="Campo da função f(x)"
        />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            onChange("");
            requestAnimationFrame(() => ref.current?.focus());
          }}
          aria-label="Limpar expressão"
        >
          Limpar
        </button>
      </div>

      <Row
        title="Atalhos"
        defaultOpen={false}
        items={[
          { label: "x²", insert: "x^2", aria: "x ao quadrado" },
          { label: "1/x", insert: "1/x" },
          { label: "( )", insert: "()", aria: "parênteses" },
          { label: "√", insert: "sqrt(" },
          { label: "ln", insert: "ln(" },
          { label: "π", insert: "pi" },
          { label: "e", insert: "e" },
        ]}
      />

      <Row
        title="Números"
        items={["7","8","9","4","5","6","1","2","3","0","."].map((t) => ({
          label: t,
          insert: t,
        }))}
      />

      <Row
        title="Operadores"
        items={[
          { label: "+", insert: "+" },
          { label: "−", insert: "-" },
          { label: "×", insert: "*" },
          { label: "÷", insert: "/" },
          { label: "^", insert: "^" },
          { label: "(", insert: "(" },
          { label: ")", insert: ")" },
          { label: "x", insert: "x" },
        ]}
      />

      <Row
        title="Funções"
        items={[
          { label: "sin", insert: "sin(" },
          { label: "cos", insert: "cos(" },
          { label: "tan", insert: "tan(" },
          { label: "log", insert: "log(" },
          { label: "ln", insert: "ln(" },
          { label: "sqrt", insert: "sqrt(" },
          { label: "abs", insert: "abs(" },
        ]}
      />

      <Row
        title="Constantes"
        items={[
          { label: "π", insert: "pi" },
          { label: "e", insert: "e" },
        ]}
      />

      <div className="text-xs mt-2 text-gray-500 dark:text-slate-400">
        Sintaxe compatível com <code>math.js</code>. Use <code>pi</code>, <code>e</code>,{" "}
        <code>sqrt()</code>, <code>log()</code>, <code>ln(x)=log(x,e)</code>.
      </div>
    </div>
  );
}
