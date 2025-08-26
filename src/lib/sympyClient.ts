type Side = "left"|"right"|"both";
type Ok = { kind: "value"; value: number } | { kind: "infinity" } | { kind: "neg_infinity" };
type Err = { error: string };

let worker: Worker | null = null;
let seq = 1;
const pending = new Map<number, { resolve: (v: Ok) => void; reject: (e: Err) => void }>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./sympyLimit.worker.ts", import.meta.url), { type: "classic" });
    worker.onmessage = (ev: MessageEvent<any>) => {
      const { id, ok, ...rest } = ev.data || {};
      const slot = pending.get(id);
      if (!slot) return;
      pending.delete(id);
      if (ok) slot.resolve(rest as Ok); else slot.reject(rest as Err);
    };
  }
  return worker;
}

export async function sympyLimit(expr: string, a: number, side: Side): Promise<Ok> {
  const w = getWorker();
  const id = seq++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, expr, a, side });
  });
}