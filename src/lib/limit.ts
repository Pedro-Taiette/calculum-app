import { safeCompile } from "./math";
import { sympyLimit } from "./sympyClient";

export type LimitSide = "both" | "left" | "right";
export type LimitResult =
  | { kind: "value"; value: number; side: LimitSide; note?: string }
  | { kind: "infinity"; side: LimitSide; note?: string }
  | { kind: "neg_infinity"; side: LimitSide; note?: string }
  | { kind: "undefined"; side: LimitSide; note?: string }
  | { kind: "error"; side: LimitSide; error: unknown; note?: string };

type LateralResult = Exclude<LimitResult, { side: "both" } | { kind: "error" }>;

export async function computeLimit(expression: string, a: number, side: LimitSide = "both"): Promise<LimitResult> {
  try {
    if (side !== "both") {
      const one = await trySympySide(expression, a, side);
      if (one) return one;
      return numericSide(expression, a, side);
    }
    const L: LateralResult = (await trySympySide(expression, a, "left"))  ?? numericSide(expression, a, "left");
    const R: LateralResult = (await trySympySide(expression, a, "right")) ?? numericSide(expression, a, "right");

    if (L.kind === "value" && R.kind === "value" && close(L.value, R.value))
      return { kind: "value", side: "both", value: 0.5*(L.value + R.value), note: notes([L.note, R.note]) };
    if (L.kind === "infinity" && R.kind === "infinity")
      return { kind: "infinity", side: "both", note: notes([L.note, R.note]) };
    if (L.kind === "neg_infinity" && R.kind === "neg_infinity")
      return { kind: "neg_infinity", side: "both", note: notes([L.note, R.note]) };
    return { kind: "undefined", side: "both" };
  } catch (e) {
    return { kind: "error", side, error: e };
  }
}

async function trySympySide(
  expr: string,
  a: number,
  side: Exclude<LimitSide, "both">
): Promise<LateralResult | null> {
  try {
    const r = await sympyLimit(expr, a, side);
    if (r.kind === "infinity")     return { kind: "infinity", side, note: "SymPy" };
    if (r.kind === "neg_infinity") return { kind: "neg_infinity", side, note: "SymPy" };
    if ("value" in r)              return { kind: "value", side, value: r.value, note: "SymPy" };
    return null;
  } catch { return null; }
}

/* Fallback numérico lateral */
function numericSide(expr: string, a: number, side: "left" | "right"): LateralResult {
  const f = safeCompile(expr);
  if (!f.node) return { kind: "undefined", side };

  const H = [1e-1,5e-2,2e-2,1e-2,5e-3,2e-3,1e-3,5e-4,2e-4,1e-4];
  const seq = side === "left" ? H.map(h => f.evaluate({ x: a - h })) : H.map(h => f.evaluate({ x: a + h }));
  const ys = seq.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (ys.length < 4) return { kind: "undefined", side };

  const recent = ys.slice(-4);
  const sameSign = recent.every(v => v > 0) || recent.every(v => v < 0);
  const absLarge = recent.every(v => Math.abs(v) > 1e4);
  const growing = recent.every((v,i,a_) => i===0 || Math.abs(v) >= Math.abs(a_[i-1]) * 0.95);
  if (sameSign && absLarge && growing) {
    return recent.at(-1)! > 0 ? { kind: "infinity", side, note: "Numérico" } : { kind: "neg_infinity", side, note: "Numérico" };
  }
  const mean = avg(recent);
  const span = Math.max(...recent) - Math.min(...recent);
  const stable = span <= Math.max(1e-6, 1e-4 * Math.max(1, Math.abs(mean)));
  if (stable) return { kind: "value", side, value: mean, note: "Numérico" };
  return { kind: "undefined", side };
}

/* utils */
function close(a: number, b: number) {
  return Math.abs(a - b) <= Math.max(1e-6, 1e-4 * Math.max(1, Math.abs(a), Math.abs(b)));
}
function avg(a: number[]) { return a.reduce((s,v)=>s+v,0)/a.length; }
function notes(ns: Array<string|undefined>) { return ns.filter(Boolean).join(" · "); }
