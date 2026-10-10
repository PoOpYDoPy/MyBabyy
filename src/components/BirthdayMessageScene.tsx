import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { APP_CONTENT } from '../data/content';

interface BirthdayMessageSceneProps {
  onContinue: () => void;
  onReplayCandles?: () => void;
}

export const BirthdayMessageScene: React.FC<BirthdayMessageSceneProps> = ({
  onContinue,
}) => {
  const { birthdayLetter } = APP_CONTENT;

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-10 z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl h-[480px] bg-gradient-to-tr from-teal-500/15 via-cyan-400/20 to-sky-600/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-teal-400/25">
        <div className="flex items-center justify-between border-b border-teal-500/20 pb-5 mb-6">
          <div className="text-left">
            <span className="block text-xs uppercase tracking-widest text-teal-300/80 font-medium">
              From My Heart To Yours
            </span>
            <span className="text-[11px] text-teal-400/60">
              Made with all my love, just for you
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-300/70 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-500/20">
            <span>Special Day</span>
            <span>✨</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-white tracking-tight mb-6 flex items-center gap-2 flex-wrap drop-shadow-[0_2px_10px_rgba(20,184,166,0.4)]">
          <span>{birthdayLetter.openingHeading}</span>
        </h2>

        <div className="text-slate-100 text-base sm:text-lg leading-relaxed font-light">
          <p className="bg-teal-950/35 p-5 sm:p-7 rounded-2xl border border-teal-500/20 text-teal-50 leading-[1.85] font-normal shadow-inner whitespace-pre-line">
            {birthdayLetter.fullLetter}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left text-xs text-teal-200/80">
            <p className="font-serif italic text-white text-base">Forever and always yours,</p>
            <p className="text-teal-300 text-xs mt-0.5">Your person & your home</p>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
        <button
          onClick={onContinue}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 hover:from-teal-300 hover:to-sky-300 text-slate-950 text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer w-full sm:w-auto"
        >
          <span>Step Into Our World</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

      <p className="mt-4 text-xs text-teal-300/60 font-light">
        A private digital keepsake created just for Kanishka
      </p>
    </div>
  );
};
