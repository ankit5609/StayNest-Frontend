import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Pixels per second for the idle auto-scroll. */
  autoScrollSpeed?: number;
  /** Resume auto-scroll after this many ms of inactivity. */
  resumeDelayMs?: number;
}

/**
 * Behavior bundle for the premium horizontal gallery:
 *  - horizontal wheel scrolling
 *  - drag-to-scroll
 *  - slow idle auto-scroll that pauses on interaction and resumes after N ms
 *  - `scrollBy` helper for arrow buttons
 *  - `canScrollLeft` / `canScrollRight` for UI state
 */
export function useCarouselControls({
  autoScrollSpeed = 18,
  resumeDelayMs = 5000,
}: Options = {}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const interactingRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const pauseInteraction = useCallback(() => {
    interactingRef.current = true;
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      interactingRef.current = false;
    }, resumeDelayMs);
  }, [resumeDelayMs]);

  // Auto-scroll loop
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!interactingRef.current && !document.hidden) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          const next = el.scrollLeft + autoScrollSpeed * dt;
          el.scrollLeft = next >= max ? 0 : next;
        }
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    // Respect reduced motion — skip auto scroll entirely.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [autoScrollSpeed]);

  // Wheel → horizontal
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        pauseInteraction();
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [pauseInteraction]);

  // Drag to scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    const down = (e: PointerEvent) => {
      isDown = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      pauseInteraction();
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!isDown) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const up = (e: PointerEvent) => {
      isDown = false;
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [pauseInteraction]);

  // Track edges
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [updateEdges]);

  const scrollByAmount = useCallback(
    (amount: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      pauseInteraction();
      el.scrollBy({ left: amount, behavior: "smooth" });
    },
    [pauseInteraction],
  );

  return {
    scrollerRef,
    canScrollLeft,
    canScrollRight,
    scrollByAmount,
    pauseInteraction,
  };
}
