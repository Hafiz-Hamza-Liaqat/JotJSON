import type { MascotExpression } from '../../features/learning/learningTypes';

type ByteMascotProps = {
  expression?: MascotExpression;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
};

export function ByteMascot({
  expression = 'idle',
  size = 'md',
  className = '',
  animate = true,
}: ByteMascotProps) {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const currentSize = sizeMap[size];

  return (
    <div
      role="img"
      aria-label={`Byte the JSON mascot (${expression} expression)`}
      className={`relative inline-flex items-center justify-center shrink-0 ${currentSize} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md select-none ${
          animate ? 'transition-transform duration-300 hover:scale-105' : ''
        }`}
      >
        <defs>
          <linearGradient id="byte-body-grad" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="0.5" stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="byte-belly-grad" x1="30" y1="45" x2="70" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" stopOpacity="0.4" />
            <stop offset="1" stopColor="#93C5FD" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Curly brace side antenneas / ears: { and } */}
        <g stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left curly brace ear */}
          <path d="M 18 36 C 14 36, 11 40, 11 46 C 11 50, 7 50, 7 50 C 7 50, 11 50, 11 54 C 11 60, 14 64, 18 64" />
          {/* Right curly brace ear */}
          <path d="M 82 36 C 86 36, 89 40, 89 46 C 89 50, 93 50, 93 50 C 93 50, 89 50, 89 54 C 89 60, 86 64, 82 64" />
        </g>

        {/* Main Body - Squircle mascot shape */}
        <rect
          x="18"
          y="22"
          width="64"
          height="62"
          rx="22"
          fill="url(#byte-body-grad)"
          stroke="#1E40AF"
          strokeWidth="3"
        />

        {/* Belly soft highlight */}
        <rect x="26" y="44" width="48" height="34" rx="16" fill="url(#byte-belly-grad)" />

        {/* Cheek Blush (visible on happy, champion) */}
        {(expression === 'happy' || expression === 'champion') && (
          <g fill="#F472B6" opacity="0.6">
            <ellipse cx="28" cy="58" rx="5" ry="3" />
            <ellipse cx="72" cy="58" rx="5" ry="3" />
          </g>
        )}

        {/* EYES & BROWS depending on expression */}
        {expression === 'idle' && (
          <g>
            {/* Friendly open eyes with bright highlights */}
            <circle cx="36" cy="46" r="6" fill="#0B1220" />
            <circle cx="64" cy="46" r="6" fill="#0B1220" />
            <circle cx="38" cy="44" r="2.2" fill="#FFFFFF" />
            <circle cx="66" cy="44" r="2.2" fill="#FFFFFF" />
            <circle cx="34.5" cy="48" r="1.2" fill="#FFFFFF" />
            <circle cx="62.5" cy="48" r="1.2" fill="#FFFFFF" />
            {/* Gentle smile */}
            <path
              d="M 42 56 Q 50 64 58 56"
              stroke="#0B1220"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {expression === 'happy' && (
          <g>
            {/* Cheerful inverted crescent eyes ^^ */}
            <path
              d="M 30 48 Q 36 38 42 48"
              stroke="#0B1220"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 58 48 Q 64 38 70 48"
              stroke="#0B1220"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Big happy open smile with tongue */}
            <path
              d="M 40 56 Q 50 68 60 56 Z"
              fill="#EF4444"
              stroke="#0B1220"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M 44 60 Q 50 63 56 60" stroke="#FCA5A5" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {expression === 'thinking' && (
          <g>
            {/* Left eyebrow raised high, right neutral */}
            <path d="M 28 36 Q 36 30 43 35" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 57 39 Q 64 40 70 38" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Eyes looking up and to the right */}
            <circle cx="36" cy="45" r="6" fill="#0B1220" />
            <circle cx="64" cy="45" r="6" fill="#0B1220" />
            <circle cx="38" cy="42" r="2.5" fill="#FFFFFF" />
            <circle cx="66" cy="42" r="2.5" fill="#FFFFFF" />
            {/* Puzzled wavy mouth */}
            <path
              d="M 42 60 Q 46 56 50 59 T 58 57"
              stroke="#0B1220"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tiny thinking dots near ear */}
            <circle cx="76" cy="28" r="2" fill="#93C5FD" />
            <circle cx="82" cy="22" r="3" fill="#60A5FA" />
            <circle cx="88" cy="14" r="4.5" fill="#3B82F6" />
          </g>
        )}

        {expression === 'detective' && (
          <g>
            {/* Focused squint eyes */}
            <circle cx="36" cy="48" r="5" fill="#0B1220" />
            <circle cx="38" cy="46" r="2" fill="#FFFFFF" />
            {/* Right eye covered by stylish glowing cyan magnifying lens */}
            <circle cx="64" cy="48" r="11" fill="#06B6D4" fillOpacity="0.25" stroke="#0891B2" strokeWidth="3.5" />
            <circle cx="64" cy="48" r="5.5" fill="#0B1220" />
            <circle cx="66" cy="46" r="2" fill="#FFFFFF" />
            {/* Magnifying handle */}
            <path d="M 72 56 L 82 66" stroke="#0E7490" strokeWidth="4.5" strokeLinecap="round" />
            {/* Determined smart smirk */}
            <path
              d="M 40 60 Q 48 64 56 59"
              stroke="#0B1220"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {expression === 'champion' && (
          <g>
            {/* Golden Crown on head */}
            <path
              d="M 32 24 L 38 12 L 50 18 L 62 12 L 68 24 Z"
              fill="url(#gold-grad)"
              stroke="#B45309"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="38" cy="12" r="2.5" fill="#EF4444" />
            <circle cx="50" cy="18" r="2.5" fill="#3B82F6" />
            <circle cx="62" cy="12" r="2.5" fill="#10B981" />
            {/* Star sparkling eyes */}
            <g fill="#F59E0B">
              <path d="M 36 41 Q 36 46 32 46 Q 36 46 36 51 Q 36 46 40 46 Q 36 46 36 41 Z" />
              <path d="M 64 41 Q 64 46 60 46 Q 64 46 64 51 Q 64 46 68 46 Q 64 46 64 41 Z" />
            </g>
            {/* Ecstatic wide victory smile */}
            <path
              d="M 38 56 Q 50 72 62 56 Z"
              fill="#EF4444"
              stroke="#0B1220"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M 44 63 Q 50 67 56 63" stroke="#FCA5A5" strokeWidth="2.5" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
}
