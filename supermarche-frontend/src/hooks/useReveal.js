import { useEffect, useRef } from 'react';

/**
 * Ajoute la classe 'visible' quand l'élément entre dans le viewport
 * Utilisation: const ref = useReveal(); <section ref={ref} className="reveal">
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}
