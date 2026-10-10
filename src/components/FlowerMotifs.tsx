import React from 'react';

interface FlowerProps {
  className?: string;
  size?: number;
}

export const SunflowerIcon: React.FC<FlowerProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <defs>
      <linearGradient id="sunPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="60%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
      <radialGradient id="sunCenterGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#78350F" />
        <stop offset="70%" stopColor="#451A03" />
        <stop offset="100%" stopColor="#291102" />
      </radialGradient>
      <filter id="sunGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#sunGlow)">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <path
          key={deg}
          d="M32 32 C30 18 34 8 32 4 C30 8 34 18 32 32"
          fill="url(#sunPetalGrad)"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
      {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
        <path
          key={deg}
          d="M32 32 C30 20 33 11 32 7 C31 11 34 20 32 32"
          fill="#FACC15"
          opacity="0.9"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </g>
    <circle cx="32" cy="32" r="11" fill="url(#sunCenterGrad)" stroke="#B45309" strokeWidth="1" />
    <circle cx="32" cy="32" r="8" fill="none" stroke="#D97706" strokeWidth="0.8" strokeDasharray="2 2" />
    <circle cx="32" cy="32" r="4.5" fill="#291102" />
  </svg>
);

export const LilyIcon: React.FC<FlowerProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <defs>
      <linearGradient id="lilyGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.8" />
        <stop offset="40%" stopColor="#F0FDFA" />
        <stop offset="100%" stopColor="#FFFFFF" />
      </linearGradient>
      <linearGradient id="lilyCenterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="100%" stopColor="#FDE047" />
      </linearGradient>
      <filter id="lilyGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#lilyGlow)">
      <path d="M32 46 C20 44 10 36 6 26 C16 28 26 36 32 46Z" fill="url(#lilyGrad)" opacity="0.85" />
      <path d="M32 46 C44 44 54 36 58 26 C48 28 38 36 32 46Z" fill="url(#lilyGrad)" opacity="0.85" />
      <path d="M32 48 C22 40 14 26 16 14 C26 22 30 36 32 48Z" fill="url(#lilyGrad)" opacity="0.95" />
      <path d="M32 48 C42 40 50 26 48 14 C38 22 34 36 32 48Z" fill="url(#lilyGrad)" opacity="0.95" />
      <path d="M32 50 C26 34 26 16 32 6 C38 16 38 34 32 50Z" fill="url(#lilyGrad)" />
      <path d="M32 44 L32 20" stroke="url(#lilyCenterGrad)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="18" r="2.5" fill="#FACC15" />
    </g>
  </svg>
);

export const TogetherFlowerEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center p-1 rounded-full ${className}`}
      title="Sunflower & Lily — Kanishka & Me"
    >
      <div className="relative flex items-center -space-x-2">
        <SunflowerIcon size={Math.round(size * 0.9)} className="relative z-10 drop-shadow-md" />
        <LilyIcon size={Math.round(size * 0.95)} className="relative z-20 drop-shadow-md" />
      </div>
    </div>
  );
};
