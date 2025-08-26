import { InlineMath } from "react-katex";
import { math } from "@/lib/math";
import { simplifyPretty } from "@/lib/algebra";

/** Converte string → LaTeX com math.js */
function toLatex(expr: string): string {
  try {
    const node = math.parse(expr);
    return node.toTex({ parenthesis: "auto", implicit: "hide" });
  } catch {
    return expr;
  }
}

export function ExpressionPreview({ expression }: { expression: string }) {
  // original
  const latexOrig = toLatex(expression);

  // forma simplificada: usa Nerdamer para obter a string e math.js para gerar o LaTeX
  const simp = simplifyPretty(expression);
  const simpLatex = toLatex(simp.expr);

  return (
    <div className="space-y-2">
      <div className="katex-box">
        <InlineMath math={`f(x)=\\displaystyle ${latexOrig}`} />
      </div>

      <div className="katex-box katex-box--muted">
        <InlineMath math={`\\text{Forma simplificada:}\\quad ${simpLatex}`} />
        {!simp.changed && (
          <div className="text-xs mt-1 text-gray-500 dark:text-slate-400">
            sem alteração
          </div>
        )}
      </div>
    </div>
  );
}
