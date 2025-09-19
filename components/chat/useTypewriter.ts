"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useTypewriter
 * Incrementally reveals target text at a fixed characters-per-second speed.
 * If target text grows over time (streaming), the hook smoothly continues animating.
 */
export function useTypewriter(targetText: string, opts?: { cps?: number; immediateOnBurst?: boolean }) {
  const cps = opts?.cps ?? 40; // characters per second
  const immediateOnBurst = opts?.immediateOnBurst ?? true;

  const [displayed, setDisplayed] = useState("");
  const targetRef = useRef(targetText);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const carryRef = useRef<number>(0);

  // When targetText changes, update ref; optionally fast-forward large bursts to avoid long delays
  useEffect(() => {
    const prev = targetRef.current;
    targetRef.current = targetText;

    if (immediateOnBurst && targetText.length - prev.length > cps * 1.5) {
      // If a large burst came in (e.g., network backlog), skip ahead most of it for responsiveness
      const keepTail = Math.max(0, Math.floor(cps * 0.5));
      const next = targetText.slice(0, Math.max(0, targetText.length - keepTail));
      setDisplayed((cur) => (cur.length < next.length ? next : cur));
    }
  }, [targetText, cps, immediateOnBurst]);

  useEffect(() => {
    function tick(ts: number) {
      const last = lastTimeRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTimeRef.current = ts;

      const cur = displayed;
      const target = targetRef.current;
      if (cur === target) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // characters to add this frame
      carryRef.current += dt * cps;
      let add = Math.floor(carryRef.current);
      if (add > 0) carryRef.current -= add;

      if (add <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const next = target.slice(0, Math.min(target.length, cur.length + add));
      setDisplayed(next);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // We intentionally depend only on displayed to keep animation loop smooth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed, cps]);

  // If target shrinks (shouldn't in our use-case), snap back
  useEffect(() => {
    if (displayed.length > targetText.length) {
      setDisplayed(targetText);
    }
  }, [displayed.length, targetText]);

  return displayed;
}

