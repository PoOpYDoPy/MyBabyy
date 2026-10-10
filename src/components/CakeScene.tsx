import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Mic, MicOff, Wind, Sparkles, Volume2, VolumeX, Heart } from 'lucide-react';
import { playBlowWhoosh, playChimeChord } from '../utils/audio';

interface CakeSceneProps {
  onWishCompleted: () => void;
  recipientName?: string;
  nickname?: string;
}

export const CakeScene: React.FC<CakeSceneProps> = ({
  onWishCompleted,
  recipientName = 'Kanishka',
  nickname = 'Kittu',
}) => {
  // Candle state: lit, extinguishing, extinguished
  const [candlesLit, setCandlesLit] = useState<boolean>(true);
  const [isExtinguishing, setIsExtinguishing] = useState<boolean>(false);
  const [hasBlown, setHasBlown] = useState<boolean>(false);
  const [wishPhase, setWishPhase] = useState<boolean>(false);

  // Audio & Mic state
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [blowLevel, setBlowLevel] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // References
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const consecutiveBlowCount = useRef<number>(0);

  // Extinguish action
  const extinguishCandles = useCallback(() => {
    if (!candlesLit || isExtinguishing) return;
    setIsExtinguishing(true);

    // Stop mic if active
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsListeningMic(false);

    // Play synthesized sound effects
    playBlowWhoosh(soundEnabled);
    setTimeout(() => {
      playChimeChord(soundEnabled);
    }, 200);

    // Fire celebration particles
    try {
      const colors = ['#fde047', '#fef08a', '#2dd4bf', '#38bdf8', '#ffffff', '#fed7aa'];
      confetti({
        particleCount: 55,
        spread: 80,
        origin: { y: 0.62 },
        colors,
        ticks: 200,
        gravity: 0.8,
        scalar: 0.9,
      });
      setTimeout(() => {
        confetti({
          particleCount: 35,
          angle: 60,
          spread: 55,
          origin: { x: 0.2, y: 0.65 },
          colors,
        });
        confetti({
          particleCount: 35,
          angle: 120,
          spread: 55,
          origin: { x: 0.8, y: 0.65 },
          colors,
        });
      }, 250);
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setCandlesLit(false);
      setHasBlown(true);
      setIsExtinguishing(false);
      // Enter "Make a wish, Kittu ❤️" phase
      setTimeout(() => {
        setWishPhase(true);
      }, 700);
    }, 450);
  }, [candlesLit, isExtinguishing, soundEnabled]);

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Mic blowing detection loop
  const startMicDetection = async () => {
    try {
      setMicError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('Microphone not supported in this browser. Tap the candles or use "Blow Candles ✨" below!');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListeningMic(true);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!analyserRef.current || !stream.active) return;
        analyserRef.current.getByteFrequencyData(buffer);

        // Breath/blowing sound energy
        let sum = 0;
        let count = 0;
        for (let i = 15; i < 110; i++) {
          sum += buffer[i];
          count++;
        }
        const avg = sum / (count || 1);
        const normalized = Math.min(100, Math.round((avg / 120) * 100));
        setBlowLevel(normalized);

        // Trigger blowing when breath energy is sustained
        if (normalized > 42) {
          consecutiveBlowCount.current += 1;
          if (consecutiveBlowCount.current >= 4) {
            extinguishCandles();
            return;
          }
        } else {
          consecutiveBlowCount.current = Math.max(0, consecutiveBlowCount.current - 1);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (err: unknown) {
      const e = err as Error;
      setIsListeningMic(false);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setMicError('Microphone permission was denied. You can tap the candles directly to blow them out!');
      } else {
        setMicError('Microphone unavailable. Simply tap the candles to blow them out!');
      }
    }
  };

  const stopMicDetection = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsListeningMic(false);
    setBlowLevel(0);
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-between px-4 py-8 text-center select-none">
      {/* Top Header info & controls */}
      <div className="w-full max-w-xl flex items-center justify-between z-20 pt-2 pb-4">
        <span className="text-xs text-teal-300/80 tracking-widest uppercase font-medium">
          For My Favorite Person
        </span>
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-950/50 border border-teal-500/20 text-xs text-teal-200 hover:bg-teal-900/50 transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">Sound On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Main Cake Stage */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10 w-full max-w-lg">
        {/* Soft natural warm ambient glow behind the cake */}
        <div
          className={`absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full blur-[100px] transition-all duration-1000 ${
            candlesLit
              ? 'bg-amber-400/15 scale-100'
              : hasBlown
              ? 'bg-teal-400/20 scale-110'
              : 'bg-teal-500/10 scale-90'
          }`}
        />

        {/* Main Title Heading */}
        <div className="mb-6 z-10 transition-all duration-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold tracking-tight text-white drop-shadow-[0_2px_15px_rgba(20,184,166,0.4)]">
            Happy Birthday, {recipientName}
            <span className="inline-block ml-2 animate-pulse align-middle">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 inline fill-red-500 text-red-500" />
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-teal-200/80 font-light tracking-wide max-w-sm mx-auto">
            {candlesLit
              ? 'Blow gently into your microphone or tap the candles.'
              : wishPhase
              ? 'The candles have answered your breath.'
              : 'Releasing the gentle smoke of wishes...'}
          </p>
        </div>

        {/* Natural Bakery Celebration Cake */}
        <div
          onClick={candlesLit ? extinguishCandles : undefined}
          className={`relative group cursor-pointer transition-transform duration-500 ${
            candlesLit ? 'hover:scale-[1.02] active:scale-[0.99]' : ''
          }`}
          title={candlesLit ? 'Tap to extinguish candles' : ''}
        >
          {/* Candlelight radiance */}
          {candlesLit && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-24 rounded-full bg-amber-300/20 blur-xl pointer-events-none animate-pulse-glow" />
          )}

          {/* SVG Layered Cake */}
          <div className="relative w-64 sm:w-80 h-72 sm:h-84 flex items-center justify-center">
            <svg
              viewBox="0 0 320 340"
              className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="standPlate" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d1d5db" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="standStem" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
                <linearGradient id="goldStandRim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="50%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="cakeTierBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e5d9c5" />
                  <stop offset="25%" stopColor="#f7efe1" />
                  <stop offset="70%" stopColor="#fefbf6" />
                  <stop offset="100%" stopColor="#dfd2bd" />
                </linearGradient>
                <linearGradient id="cakeTierTop" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e8ded0" />
                  <stop offset="30%" stopColor="#faf3e8" />
                  <stop offset="70%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0d4c2" />
                </linearGradient>
                <linearGradient id="spongeCrumb" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c29b6d" />
                  <stop offset="50%" stopColor="#e0bc8d" />
                  <stop offset="100%" stopColor="#b88f5f" />
                </linearGradient>
                <linearGradient id="freshFrosting" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f8f4eb" />
                </linearGradient>
                <linearGradient id="ivoryCandle" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#fae8b2" />
                </linearGradient>
                <radialGradient id="naturalFlame" cx="50%" cy="80%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="20%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="85%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="160" cy="315" rx="126" ry="15" fill="url(#standPlate)" stroke="url(#goldStandRim)" strokeWidth="1.2" />
              <path d="M125 315 L130 294 L190 294 L195 315 Z" fill="url(#standStem)" opacity="0.9" />
              <ellipse cx="160" cy="294" rx="112" ry="12" fill="url(#standPlate)" stroke="#cbd5e1" strokeWidth="0.8" />
              
              {/* Bottom Tier */}
              <g id="bottomTier">
                <path
                  d="M60 274 C60 290 105 302 160 302 C215 302 260 290 260 274 L260 282 C260 298 215 308 160 308 C105 308 60 298 60 282 Z"
                  fill="url(#spongeCrumb)"
                />
                <path
                  d="M60 215 C60 215 60 278 60 278 C60 294 105 304 160 304 C215 304 260 294 260 278 C260 278 260 215 260 215 Z"
                  fill="url(#cakeTierBottom)"
                />
                <ellipse cx="160" cy="215" rx="100" ry="20" fill="#fcf9f2" />
                <path
                  d="M60 215 C65 232 75 238 85 220 C95 242 105 246 115 221 C125 238 135 240 145 220 C155 244 165 242 175 220 C185 238 195 236 205 218 C215 244 225 240 235 218 C245 234 255 228 260 215 C260 215 215 228 160 228 C105 228 60 215 60 215 Z"
                  fill="url(#freshFrosting)"
                  filter="drop-shadow(0 2px 4px rgba(180,150,120,0.25))"
                />
              </g>

              {/* Top Tier */}
              <g id="topTier">
                <path
                  d="M95 145 C95 145 95 195 95 195 C95 210 124 220 160 220 C196 220 225 210 225 195 C225 195 225 145 225 145 Z"
                  fill="url(#cakeTierTop)"
                />
                <ellipse cx="160" cy="145" rx="65" ry="15" fill="#ffffff" />
                <path
                  d="M95 145 C100 162 110 166 118 149 C126 168 136 172 144 150 C152 167 162 169 170 150 C178 171 188 167 196 148 C206 163 216 160 225 145 C225 145 196 156 160 156 C124 156 95 145 95 145 Z"
                  fill="url(#freshFrosting)"
                  filter="drop-shadow(0 2px 3px rgba(180,150,120,0.2))"
                />
              </g>

              {/* Candles */}
              {/* Candle 1 */}
              <g id="candle1">
                <rect x="126" y="98" width="6" height="42" rx="3" fill="url(#ivoryCandle)" stroke="#fef08a" strokeWidth="0.6" />
                <path d="M126 108 L132 112 M126 122 L132 126" stroke="#d97706" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
                <line x1="129" y1="98" x2="129" y2="90" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                {candlesLit && (
                  <g className="animate-flame" style={{ transformOrigin: '129px 90px', animationDelay: '0.1s' }}>
                    <ellipse cx="129" cy="79" rx="8.5" ry="14" fill="url(#naturalFlame)" />
                    <ellipse cx="129" cy="81" rx="3" ry="6" fill="#ffffff" />
                  </g>
                )}
                {hasBlown && (
                  <g className="animate-smoke" style={{ transformOrigin: '129px 90px' }}>
                    <path
                      d="M129 88 Q125 75 131 65 T127 45"
                      fill="none"
                      stroke="rgba(254,243,199,0.75)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>

              {/* Candle 2 (Center) */}
              <g id="candle2">
                <rect x="156" y="86" width="8" height="52" rx="4" fill="url(#ivoryCandle)" stroke="#fef08a" strokeWidth="0.6" />
                <path d="M156 98 L164 103 M156 114 L164 119 M156 128 L164 133" stroke="#d97706" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                <line x1="160" y1="86" x2="160" y2="76" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                {candlesLit && (
                  <g className="animate-flame" style={{ transformOrigin: '160px 76px', animationDelay: '0s' }}>
                    <ellipse cx="160" cy="63" rx="10.5" ry="17" fill="url(#naturalFlame)" />
                    <ellipse cx="160" cy="66" rx="4" ry="7.5" fill="#ffffff" />
                  </g>
                )}
                {hasBlown && (
                  <g className="animate-smoke" style={{ transformOrigin: '160px 76px', animationDelay: '0.15s' }}>
                    <path
                      d="M160 74 Q165 60 157 48 T163 28"
                      fill="none"
                      stroke="rgba(254,243,199,0.8)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>

              {/* Candle 3 */}
              <g id="candle3">
                <rect x="186" y="98" width="6" height="42" rx="3" fill="url(#ivoryCandle)" stroke="#fef08a" strokeWidth="0.6" />
                <path d="M186 108 L192 112 M186 122 L192 126" stroke="#d97706" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
                <line x1="189" y1="98" x2="189" y2="90" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                {candlesLit && (
                  <g className="animate-flame" style={{ transformOrigin: '189px 90px', animationDelay: '0.25s' }}>
                    <ellipse cx="189" cy="79" rx="8.5" ry="14" fill="url(#naturalFlame)" />
                    <ellipse cx="189" cy="81" rx="3" ry="6" fill="#ffffff" />
                  </g>
                )}
                {hasBlown && (
                  <g className="animate-smoke" style={{ transformOrigin: '189px 90px', animationDelay: '0.08s' }}>
                    <path
                      d="M189 88 Q194 75 188 62 T192 42"
                      fill="none"
                      stroke="rgba(254,243,199,0.75)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Area */}
      <div className="w-full max-w-md z-20 pb-4 flex flex-col items-center">
        {candlesLit ? (
          <div className="w-full flex flex-col items-center gap-3">
            {isListeningMic && (
              <div className="w-full glass-panel-subtle rounded-2xl p-3 flex flex-col items-center gap-2 animate-fadeIn">
                <div className="flex items-center justify-between w-full text-xs text-teal-200">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-teal-300 animate-spin" style={{ animationDuration: '3s' }} />
                    Listening for your blow...
                  </span>
                  <span className="font-mono text-teal-300 font-medium">{blowLevel}%</span>
                </div>
                <div className="w-full bg-teal-950/60 h-2 rounded-full overflow-hidden border border-teal-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 via-amber-300 to-white transition-all duration-75"
                    style={{ width: `${blowLevel}%` }}
                  />
                </div>
                <p className="text-[11px] text-teal-300/70">
                  Gently blow toward your microphone, or tap the button / cake directly!
                </p>
              </div>
            )}
            {micError && (
              <div className="text-xs text-cyan-200/90 bg-teal-950/70 border border-teal-500/30 rounded-xl px-3.5 py-2 max-w-sm">
                {micError}
              </div>
            )}
            <div className="flex items-center gap-3 w-full justify-center">
              {!isListeningMic ? (
                <button
                  onClick={startMicDetection}
                  className="flex-1 max-w-[200px] min-h-[48px] px-4 py-2.5 rounded-full bg-teal-900/60 hover:bg-teal-800/70 border border-teal-400/30 text-teal-100 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 transition-all active:scale-95 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-teal-300" />
                  Blow with Mic
                </button>
              ) : (
                <button
                  onClick={stopMicDetection}
                  className="px-3.5 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/30 text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Disable microphone"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Mic
                </button>
              )}
              <button
                onClick={extinguishCandles}
                className="flex-1 max-w-[200px] min-h-[48px] px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                Blow Candles ✨
              </button>
            </div>
            <p className="text-[11px] text-teal-300/60 tracking-wider">
              ✦ You can also tap the candles anytime ✦
            </p>
          </div>
        ) : wishPhase ? (
          <div className="flex flex-col items-center gap-4 text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-amber-400/10 border border-amber-300/25 text-amber-200 mb-1">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(45,212,191,0.5)]">
                Make a wish, {nickname}
                <span className="inline-block ml-1">
                  <Heart className="w-5 h-5 inline fill-red-500 text-red-500" />
                </span>
              </h2>
              <p className="text-sm text-teal-200/90 font-light italic max-w-xs mx-auto">
                Close your eyes for a moment, let your heart speak, and whisper your quietest hope...
              </p>
            </div>
            <button
              onClick={onWishCompleted}
              className="mt-3 min-h-[48px] px-8 py-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-[#021b24] font-semibold text-sm tracking-wide shadow-[0_0_25px_rgba(45,212,191,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>I ve Made My Wish</span>
              <Sparkles className="w-4 h-4 text-[#021b24]" />
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm font-serif italic text-teal-200 animate-pulse">
              Whispering your wish into the starlight...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
