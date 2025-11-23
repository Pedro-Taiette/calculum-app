/// <reference lib="webworker" />
type Req = { id: number; expr: string; at: number; variable: string };
type Res =
  | { id: number; ok: true; kind: "value" | "undefined"; value?: number; derivative: string | null }
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

async function evalDerivative(expr: string, at: number, variable: string) {
  const p = await ensurePyodide();
  const e = preprocess(expr);
  const code = `
from sympy import symbols, diff
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, convert_xor, implicit_multiplication_application
v = symbols('${variable}')
transform = standard_transformations + (convert_xor, implicit_multiplication_application,)
try:
    parsed = parse_expr("${e.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}", transformations=transform, evaluate=False)
    d = diff(parsed, v)
    d_str = str(d)
    val = d.subs(v, ${Number.isFinite(at) ? at : 0})
    if val.is_Number:
        return f"value::{float(val.evalf(15))}::{d_str}"
    return f"undefined::{d_str}"
except Exception as ex:
    return f"error::{ex}"
  `.trim();
  return String(p.runPython(code)).trim();
}

function normalizeDerivative(raw: string): { kind: "value" | "undefined"; value?: number; derivative: string | null } | { error: string } {
  if (raw.startsWith("error::")) return { error: raw.slice(7) };
  if (raw.startsWith("value::")) {
    const [, valStr] = raw.split("::", 3);
    const num = Number(valStr);
    return { kind: "value", value: num, derivative: stripPow(raw.split("::", 3)[2] ?? null) };
  }
  if (raw.startsWith("undefined::")) {
    const [, d] = raw.split("::", 2);
    return { kind: "undefined", derivative: stripPow(d ?? null) };
  }
  return { error: raw };
}

function stripPow(expr: string | null): string | null {
  if (!expr) return null;
  return expr.replace(/\*\*/g, "^");
}

self.onmessage = async (ev: MessageEvent<Req>) => {
  const { id, expr, at, variable } = ev.data;
  try {
    const raw = await evalDerivative(expr, at, variable);
    const parsed = normalizeDerivative(raw);
    if ("error" in parsed) { (self as any).postMessage({ id, ok: false, error: parsed.error } as Res); return; }
    if (parsed.kind === "value") { (self as any).postMessage({ id, ok: true, kind: "value", value: parsed.value, derivative: parsed.derivative } as Res); return; }
    (self as any).postMessage({ id, ok: true, kind: "undefined", derivative: parsed.derivative ?? null } as Res);
  } catch (e: any) {
    (self as any).postMessage({ id, ok: false, error: String(e?.message || e) } as Res);
  }
};

export {};
