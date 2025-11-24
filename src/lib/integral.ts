import { safeCompile } from "./math";
import { sympyIntegral } from "./sympyIntegralClient";

export type IntegralResult =
  | {
      kind: "value";
      indefiniteExpr: string | null;
      definiteValue: number | null;
      note?: string;
      definiteNote?: string;
    }
  | {
      kind: "error";
      error: unknown;
      indefiniteExpr?: string | null;
      definiteValue?: number | null;
      note?: string;
      definiteNote?: string;
    };

export type IndefiniteIntegralResult =
  | {
      kind: "value";
      expression: string | null;
      note?: string;
    }
  | {
      kind: "error";
      error: unknown;
      expression?: string | null;
      note?: string;
    };

// O download inicial do Pyodide + SymPy costuma demorar vários segundos em
// conexões mais lentas. O timeout anterior (8s) fazia a chamada expirar antes
// do carregamento terminar, causando erro em todas as integrais (indefinidas e
// definidas) mesmo para funções simples como sin(x). Aumentamos a janela para
// acomodar o tempo de bootstrap do worker. Mantemos uma margem extra porque o
// carregamento agora é disparado em background, mas ainda pode levar tempo em
// redes mais lentas.
const SYMPY_TIMEOUT_MS = 45000;

export async function computeIntegral(
  expression: string,
  lower: number,
  upper: number,
  variable = "x"
): Promise<IntegralResult> {
  const numeric = numericDefiniteIntegral(expression, lower, upper, variable);

  try {
    const sym = await trySympy(expression, lower, upper, variable);
    if (sym) {
      return {
        ...sym,
        definiteValue: sym.definiteValue ?? numeric,
        definiteNote: sym.definiteNote ?? (numeric != null ? "Numérico" : undefined),
      };
    }
  } catch (error) {
    return { kind: "error", error, definiteValue: numeric ?? undefined };
  }

  if (numeric != null) {
    return { kind: "value", indefiniteExpr: null, definiteValue: numeric, note: "Numérico", definiteNote: "Numérico" };
  }

  return { kind: "error", error: "Não foi possível calcular" };
}

export async function computeIndefiniteIntegral(
  expression: string,
  variable = "x"
): Promise<IndefiniteIntegralResult> {
  try {
    const sym = await trySympy(expression, null, null, variable);
    if (sym?.indefiniteExpr) {
      return { kind: "value", expression: sym.indefiniteExpr, note: sym.note };
    }
    return { kind: "error", error: "Não foi possível calcular simbolicamente" };
  } catch (error) {
    return { kind: "error", error };
  }
}

async function trySympy(
  expr: string,
  lower: number | null,
  upper: number | null,
  variable: string
) {
  try {
    const r = await withTimeout(sympyIntegral(expr, lower, upper, variable), SYMPY_TIMEOUT_MS);
    if (!r) return null;
    return { kind: "value" as const, indefiniteExpr: r.indefinite ?? null, definiteValue: r.definite, note: "SymPy", definiteNote: "SymPy" };
  } catch {
    return null;
  }
}

function numericDefiniteIntegral(expr: string, lower: number, upper: number, variable: string): number | null {
  const f = safeCompile(expr);
  if (!f.node || !Number.isFinite(lower) || !Number.isFinite(upper)) return null;

  const a = lower;
  const b = upper;
  const n = 800; // even number of slices for Simpson
  const h = (b - a) / n;
  if (!Number.isFinite(h) || h === 0) return 0;

  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const y = f.evaluate({ [variable]: x, x });
    if (typeof y !== "number" || !Number.isFinite(y)) return null;
    const coef = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
    sum += coef * y;
  }

  return (h / 3) * sum;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return await Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}
