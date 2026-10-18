import { useId } from 'react';

type FloatingDotsProps = {
  className?: string;
  count?: number;
};

type DotDef = {
  top: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
};

export function FloatingDots({ className = '', count = 14 }: FloatingDotsProps) {
  const id = useId();

  // Deterministic seed-based layout to prevent SSR/hydration jumps
  const dots: DotDef[] = [
    { top: 8, left: 12, size: 7, color: '#38BDF8', duration: 7, delay: 0.2, opacity: 0.25 },
    { top: 18, left: 85, size: 5, color: '#818CF8', duration: 9, delay: 1.5, opacity: 0.2 },
    { top: 32, left: 6, size: 6, color: '#A78BFA', duration: 8, delay: 0.8, opacity: 0.22 },
    { top: 45, left: 92, size: 8, color: '#38BDF8', duration: 11, delay: 2.1, opacity: 0.18 },
    { top: 62, left: 18, size: 5, color: '#60A5FA', duration: 7.5, delay: 0.5, opacity: 0.25 },
    { top: 78, left: 80, size: 7, color: '#C084FC', duration: 10, delay: 1.2, opacity: 0.2 },
    { top: 88, left: 40, size: 6, color: '#38BDF8', duration: 8.5, delay: 2.8, opacity: 0.18 },
    { top: 15, left: 52, size: 5, color: '#818CF8', duration: 9.5, delay: 0.9, opacity: 0.15 },
    { top: 55, left: 60, size: 8, color: '#60A5FA', duration: 12, delay: 1.8, opacity: 0.16 },
    { top: 72, left: 8, size: 6, color: '#38BDF8', duration: 7.8, delay: 2.5, opacity: 0.2 },
    { top: 25, left: 35, size: 5, color: '#A78BFA', duration: 8.2, delay: 1.1, opacity: 0.18 },
    { top: 40, left: 74, size: 7, color: '#38BDF8', duration: 10.5, delay: 0.4, opacity: 0.22 },
    { top: 82, left: 24, size: 6, color: '#818CF8', duration: 9.2, delay: 1.7, opacity: 0.2 },
    { top: 92, left: 68, size: 5, color: '#60A5FA', duration: 8.8, delay: 2.2, opacity: 0.15 },
  ].slice(0, count);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      <style>{`
        @keyframes float-drift-${id.replace(/:/g, '')} {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-16px) scale(1.08);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-dot-anim {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
      {dots.map((dot, idx) => (
        <span
          key={idx}
          className="floating-dot-anim absolute rounded-full"
          style={{
            top: `${dot.top}%`,
            left: `${dot.left}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            opacity: dot.opacity,
            animation: `float-drift-${id.replace(/:/g, '')} ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
