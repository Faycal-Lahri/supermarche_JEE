import { useEffect, useState } from 'react';

/**
 * Hook pour l'apparition progressive des éléments
 * Utilise Intersection Observer pour déclencher les animations
 */
export const useRevealAnimation = (threshold = 0.1, triggerOnce = true) => {
  const [revealed, setRevealed] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (triggerOnce) observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return { ref, revealed };
};

/**
 * Composant Reveal animé
 */
export const RevealElement = ({ children, delay = 0, className = '', style = {} }) => {
  const { ref, revealed } = useRevealAnimation(0.1, true);

  return (
    <div
      ref={ref}
      style={{
        animation: revealed ? `fadeSlideUp 600ms cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms forwards` : 'none',
        opacity: revealed ? 1 : 0,
        ...style
      }}
      className={className}
    >
      {children}
    </div>
  );
};
