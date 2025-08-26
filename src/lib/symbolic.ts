import nerdamer from "nerdamer/all";

/** Tenta limite simbólico com Nerdamer.
 *  Retorna número, "+inf", "-inf" ou null se não conseguiu.
 */
export function nerdamerLimit(
  expr: string,
  variable: string,
  a: number,
  side: "both" | "left" | "right"
): number | "+inf" | "-inf" | null {
  try {
    const aStr =
      Number.isFinite(a) ? String(a) : a === Infinity ? "infinity" : "-infinity";
    const dir = side === "left" ? "-" : side === "right" ? "+" : "";
    const code = `limit((${expr}), ${variable}, ${aStr}${dir})`;
    const out = String(nerdamer(code)).trim().toLowerCase();

    if (!out) return null;

    // Normalizações comuns
    if (out === "infinity" || out === "∞" || out === "oo" || out === "1/0") return "+inf";
    if (out === "-infinity" || out === "-∞" || out === "-oo" || out === "-1/0") return "-inf";

    // Alguns retornos vêm como frações que equivalem a números
    const num = Number(out);
    if (Number.isFinite(num)) return num;

    return null;
  } catch {
    return null;
  }
}
