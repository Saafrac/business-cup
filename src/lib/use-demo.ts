"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noop = () => () => {};

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Шаг демо-анимации 0..last; при reduced motion сразу последний кадр */
export function useDemoStep(last: number, intervalMs: number) {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => {
      setTick((s) => {
        if (s + 1 >= last) clearInterval(timer);
        return Math.min(s + 1, last);
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [reduce, last, intervalMs]);

  return reduce ? last : tick;
}

/** origin текущей страницы; на сервере — боевой домен */
export function useOrigin(fallback = "https://classgift.app") {
  return useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => fallback,
  );
}
