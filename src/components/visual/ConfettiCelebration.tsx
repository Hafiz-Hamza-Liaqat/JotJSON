import { useEffect, useState } from 'react';

type ConfettiCelebrationProps = {
  durationMs?: number;
  onComplete?: () => void;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  dx: number;
  dy: number;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

const STATIC_PARTICLES: Particle[] = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 + (((i * 17) % 10) - 5) * 0.05;
  const speed = 40 + ((i * 37) % 65);
  return {
    id: i,
    x: 50,
    y: 40,
    size: 6 + ((i * 13) % 7),
    color: COLORS[i % COLORS.length]!,
    rotation: (i * 47) % 360,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed - 15,
  };
});

export function ConfettiCelebration({ durationMs = 2400, onComplete }: ConfettiCelebrationProps) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
      onComplete?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  if (!active) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
    >
      <style>{`
        @keyframes confetti-pop {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.6);
          }
          70% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1.1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-particle {
            display: none !important;
          }
        }
      `}</style>
      <div className="relative h-64 w-64">
        {STATIC_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="confetti-particle absolute rounded-sm"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size * 0.7}px`,
                backgroundColor: p.color,
                '--dx': `${p.dx * 3}px`,
                '--dy': `${p.dy * 3 + 120}px`,
                '--rot': `${p.rotation + 360}deg`,
                animation: `confetti-pop ${durationMs}ms cubic-bezier(0.2, 0.8, 0.4, 1) forwards`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
