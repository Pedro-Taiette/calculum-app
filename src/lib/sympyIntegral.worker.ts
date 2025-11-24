/// <reference lib="webworker" />
type Req = { id: number; expr: string; variable: string; lower: number | null; upper: number | null };
type Res =
  | { id: number; ok: true; indefinite: string | null; definite: number | null }
  | { id: number; ok: false; error: string };

const PYODIDE_VER = "0.24.1";
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VER}/full`;
let pyodide: any | null = null;
// Iniciamos o download do Pyodide assim que o worker é carregado para evitar
// que a primeira chamada expire enquanto os artefatos ainda estão baixando.
const pyodideReady = ensurePyodide();

async function ensurePyodide() {
  if (pyodide) return pyodide;
  (self as any).importScripts(`${BASE}/pyodide.js`);
  const loadPyodide = (self as any).loadPyodide;
  pyodide = await loadPyodide({ indexURL: BASE });
  await pyodide.loadPackage(["sympy"]);
  return pyodide;
}

function preprocess(expr: string): string {
  return expr
    .replace(/\^/g, "**")
    .replace(/√\(/g, "sqrt(")
    .replace(/ln\(/g, "log(")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");
}

async function evalIntegral(expr: string, variable: string, lower: number | null, upper: number | null) {
  const p = await pyodideReady;
  const e = preprocess(expr);
  const lowerPy = Number.isFinite(lower as number) ? String(lower) : "None";
  const upperPy = Number.isFinite(upper as number) ? String(upper) : "None";
  const code = `
from sympy import symbols, integrate, oo
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, convert_xor, implicit_multiplication_application
var = symbols('${variable}')
transform = standard_transformations + (convert_xor, implicit_multiplication_application,)

def do_integral(expr_str, lower, upper):
    try:
        e = parse_expr(expr_str, transformations=transform, evaluate=False)
    except Exception as ex:
        return ['error:' + str(ex), None]

    indef_str = None
    try:
        indef = integrate(e, var)
        if indef is not None:
            indef_str = str(indef)
    except Exception:
        pass

    definite_val = None
    if lower is not None and upper is not None:
        try:
            val = integrate(e, (var, lower, upper))
            if val.is_real:
                definite_val = float(val.evalf(15))
        except Exception:
            pass

    return [indef_str, definite_val]

do_integral("${e.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}", ${lowerPy}, ${upperPy})
  `.trim();
  return p.runPython(code);
}

self.onmessage = async (ev: MessageEvent<Req>) => {
  const { id, expr, variable, lower, upper } = ev.data;
  try {
    const out: [string | null, number | null] | string = await evalIntegral(expr, variable, lower, upper);
    if (typeof out === "string") {
      (self as any).postMessage({ id, ok: false, error: out.startsWith("error:") ? out.slice(6) : out } as Res);
      return;
    }
    const [indef, definite] = out;
    if (typeof indef === "string" && indef.startsWith("error:")) {
      (self as any).postMessage({ id, ok: false, error: indef.slice(6) } as Res);
      return;
    }
    (self as any).postMessage({ id, ok: true, indefinite: indef, definite } as Res);
  } catch (e: any) {
    (self as any).postMessage({ id, ok: false, error: String(e?.message || e) } as Res);
  }
};

export {};
