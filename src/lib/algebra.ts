import nerdamer from "nerdamer/all";

export type PrettySimp = { expr: string; changed: boolean };

export function simplifyPretty(expr: string): PrettySimp {
  try {
    const s = nerdamer(expr).simplify();
    const out = s.toString();
    return { expr: out, changed: normalize(out) !== normalize(expr) };
  } catch {
    return { expr, changed: false };
  }
}

function normalize(s: string) {
  return String(s).replace(/\s+/g, "");
}
