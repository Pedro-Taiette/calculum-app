/// <reference lib="webworker" />
type Req = { id: number; expr: string; a: number; side: "left"|"right"|"both" };
type Res =
  | { id: number; ok: true; kind: "value"|"infinity"|"neg_infinity"; value?: number }
  | { id: number; ok: false; error: string };

const PYODIDE_VER = "0.24.1";
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VER}/full`;
let pyodide: any | null = null;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  (self as any).importScripts(`${BASE}/pyodide.js`);
  const loadPyodide = (self as any).loadPyodide;
  pyodide = await loadPyodide({ indexURL: BASE });
  await pyodide.loadPackage(["sympy"]);
  return pyodide;
}

function preprocess(expr: string): string {
  return expr.replace(/\^/g, "**").replace(/√\(/g, "sqrt(").replace(/ln\(/g, "log(").replace(/×/g, "*").replace(/÷/g, "/");
}

async function evalLimit(expr: string, a: number, side: "left"|"right"|"both") {
  const p = await ensurePyodide();
  const e = preprocess(expr);
  const code = `
from sympy import symbols, limit, oo
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, convert_xor, implicit_multiplication_application
x = symbols('x')
transform = standard_transformations + (convert_xor, implicit_multiplication_application,)
def do_limit(expr_str, a_val, side):
    try:
        e = parse_expr(expr_str, transformations=transform, evaluate=False)
        if side == "both":
            L = limit(e, x, a_val, dir="-")
            R = limit(e, x, a_val, dir="+")
            if L == oo and R == oo: return "inf"
            if L == -oo and R == -oo: return "-inf"
            if L.is_Number and R.is_Number and L.equals(R): return str(L.evalf(15))
            return "undefined"
        else:
            d = "+" if side == "right" else "-"
            v = limit(e, x, a_val, dir=d)
            if v == oo: return "inf"
            if v == -oo: return "-inf"
            if v.is_Number: return str(v.evalf(15))
            return "undefined"
    except Exception as ex:
        return "error:"+str(ex)
do_limit("${e.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}", ${Number.isFinite(a) ? a : 0}, "${side}")
  `.trim();
  return String(p.runPython(code)).trim().toLowerCase();
}

self.onmessage = async (ev: MessageEvent<Req>) => {
  const { id, expr, a, side } = ev.data;
  try {
    const out = await evalLimit(expr, a, side);
    if (out.startsWith("error:")) { (self as any).postMessage({ id, ok: false, error: out.slice(6) } as Res); return; }
    if (out === "inf")  { (self as any).postMessage({ id, ok: true, kind: "infinity" } as Res); return; }
    if (out === "-inf") { (self as any).postMessage({ id, ok: true, kind: "neg_infinity" } as Res); return; }
    if (out === "undefined") { (self as any).postMessage({ id, ok: false, error: "undefined" } as Res); return; }
    const num = Number(out);
    if (Number.isFinite(num)) { (self as any).postMessage({ id, ok: true, kind: "value", value: num } as Res); return; }
    (self as any).postMessage({ id, ok: false, error: "parse_failed:"+out } as Res);
  } catch (e: any) {
    (self as any).postMessage({ id, ok: false, error: String(e?.message || e) } as Res);
  }
};