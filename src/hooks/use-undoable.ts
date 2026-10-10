import { useCallback, useReducer, useRef, useState } from "react";

const LIMIT = 100;
const IDLE_MS = 400;

/**
 * Estado con deshacer/rehacer. Los cambios seguidos (arrastrar un slider, mover un
 * dispositivo) se agrupan en un solo paso del historial cuando pasan IDLE_MS sin cambios.
 */
export function useUndoable<T>(initial: T | (() => T)) {
  const [state, setState] = useState(initial);
  const current = useRef(state);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const burstStart = useRef<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (burstStart.current !== null) {
      past.current.push(burstStart.current);
      if (past.current.length > LIMIT) past.current.shift();
      future.current = [];
      burstStart.current = null;
      rerender();
    }
  }, []);

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const prev = current.current;
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      if (Object.is(next, prev)) return;
      if (burstStart.current === null) burstStart.current = prev;
      current.current = next;
      setState(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, IDLE_MS);
    },
    [flush],
  );

  const undo = useCallback(() => {
    flush();
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(current.current);
    current.current = prev;
    setState(prev);
    rerender();
  }, [flush]);

  const redo = useCallback(() => {
    flush();
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(current.current);
    current.current = next;
    setState(next);
    rerender();
  }, [flush]);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: past.current.length > 0 || burstStart.current !== null,
    canRedo: future.current.length > 0,
  };
}
