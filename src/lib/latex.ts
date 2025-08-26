import { math } from "./math";

export function toLatex(expr: string): string {
  try {
    const node = math.parse(expr);
    return node.toTex({ parenthesis: "auto", implicit: "hide" });
  } catch {
    return sanitize(expr);
  }
}

export function toLatexSimplified(expr: string): string {
  try {
    const node = math.simplify(expr);
    return node.toTex({ parenthesis: "auto", implicit: "hide" });
  } catch {
    return sanitize(expr);
  }
}

function sanitize(s: string) {
  return String(s)
    .replaceAll("\\", "\\\\")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("^", "^{\\ }");
}