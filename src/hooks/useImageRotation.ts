import { useEffect, useState } from "react";

interface Options {
  count: number;
  intervalMs?: number;
  paused?: boolean;
}

/**
 * Cycles an index 0..count-1 on an interval. Pauses when `paused` is true or
 * when `count <= 1`. No DOM ties — the consumer decides how to render.
 */
export function useImageRotation({ count, intervalMs = 1800, paused = false }: Options) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, count, intervalMs]);

  useEffect(() => {
    setIndex(0);
  }, [count]);

  return index;
}
