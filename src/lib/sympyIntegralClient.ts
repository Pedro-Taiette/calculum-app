let worker: Worker | null = null;
let seq = 1;
const pending = new Map<number, { resolve: (v: Ok) => void; reject: (e: Err) => void }>();

type Ok = { indefinite: string | null; definite: number | null };
type Err = { error: string };

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./sympyIntegral.worker.ts", import.meta.url), { type: "classic" });
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

export async function sympyIntegral(
  expr: string,
  lower: number | null,
  upper: number | null,
  variable: string
): Promise<Ok> {
  const w = getWorker();
  const id = seq++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    w.postMessage({ id, expr, lower, upper, variable });
  });
}
