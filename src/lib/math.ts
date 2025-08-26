import { create, all, MathJsStatic, MathJsInstance, MathNode } from "mathjs";

const config = {};
const math = create(all, config) as MathJsInstance & MathJsStatic;

export type MathCompiled = {
  evaluate: (scope: Record<string, number>) => number | null;
  node: MathNode | null;
};

export function safeCompile(expression: string): MathCompiled {
  let node: MathNode | null = null;
  try {
    node = math.parse(expression);
    const code = node.compile();
    return {
      node,
      evaluate: (scope) => {
        try {
          const v = code.evaluate(scope);
          return typeof v === "number" ? v : NaN;
        } catch {
          return NaN;
        }
      }
    };
  } catch {
    return { node: null, evaluate: () => NaN };
  }
}

/** Tenta simplificar de forma “forte”:
 *  1) rationalize(expr)  → cancela fatores racionais (ex.: (x^2-1)/(x-1) → x+1)
 *  2) simplify(expr)     → demais reduções
 */
export function simplifyExpression(expression: string): { expr: string; node: MathNode | null } {
  try {
    // 1) tentar racionalizar
    let node: any = null;

    try {
      // math.rationalize pode retornar Node ou {expression, variables}
      const rat: any = (math as any).rationalize(expression, { exact: true });
      if (rat && typeof rat.toString === "function") {
        node = rat as MathNode;
      } else if (rat && rat.expression) {
        node = rat.expression as MathNode;
      }
    } catch {
      // ignore e cai no simplify
    }

    // 2) fallback/ajuste com simplify sobre o que veio
    if (node) {
      try {
        node = math.simplify(node);
      } catch {}
      return { expr: node.toString(), node };
    }

    // apenas simplify se racionalização não rolou
    const simp = math.simplify(expression);
    return { expr: simp.toString(), node: simp };
  } catch {
    return { expr: expression, node: null };
  }
}

export { math };