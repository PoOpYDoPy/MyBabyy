import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const BackgroundStars: React.FC = () => {
  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 38; i++) {
      list.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.2,
        duration: 12 + Math.random() * 16,
        delay: Math.random() * 8,
        opacity: 0.2 + Math.random() * 0.5,
      });
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep ocean & turquoise gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02101e] via-[#041d2d] to-[#010b14]" />
      
      {/* Soft atmospheric turquoise & cyan ambient glow orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-teal-500/12 blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[150px] pointer-events-none" />

      {/* Subtle fine stars / luminous dust */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-cyan-200"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px rgba(45, 212, 191, 0.7)`,
            animation: `floatGentle ${p.duration}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Very subtle grain / noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
