import React, { useState } from 'react';
import { 
  Gift, 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  ExternalLink,
  Maximize2,
  RefreshCw,
  ArrowRight,
  Flower2,
  X
} from 'lucide-react';
import { OPEN_WHEN_LETTERS } from '../data/phaseFourContent';

interface PhaseFourViewProps {
  onBack: () => void;
  onNextPage?: () => void;
}

export const PhaseFourView: React.FC<PhaseFourViewProps> = ({ 
  onBack,
  onNextPage
}) => {
  const giftUrl = "https://steady-kleicha-743a24.netlify.app/?fbclid=PAVERFWAU11QRleHRuA2FlbQIxMABwZG9mAmZkaWQWUP_TH9rmlewquhSSwhqHpjfivPI5q3NydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp5CDruwqu82IGQBj3mfoZlGCklC35ArtHiX7qVHxsVg_UuXnnxilikBiiBWP_aem_PuE-50neuG29aCh7mxx44g";
  const baseEmbedUrl = "/gift-website.html";
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreenIframe, setIsFullscreenIframe] = useState<boolean>(false);

  const boyfriendsDayLetter = OPEN_WHEN_LETTERS.find((l) => l.category === 'boyfriends_day');

  const handleRefreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-teal-500/20">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-950/70 hover:bg-teal-900 border border-teal-500/30 text-xs sm:text-sm text-teal-200 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
          title="Return to Welcome Home"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Back to Home</span>
        </button>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-400/30 text-xs text-teal-300 shadow-inner">
          <Gift className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-medium">The Gift You Gave Me</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-xs text-teal-300">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Boyfriend's Day • Soulmate Day Keepsake</span>
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          The Gift You Gave Me
        </h1>
        <p className="font-serif italic text-sm sm:text-base text-teal-200/90 font-light max-w-xl mx-auto leading-relaxed">
          Some feelings deserve more than a message. So I made you a little letter.
        </p>

        {/* Live Website action button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={giftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-400 text-slate-950 text-xs sm:text-sm font-semibold hover:bg-teal-300 transition-all shadow-lg hover:shadow-teal-400/25 active:scale-95 cursor-pointer"
          >
            <span>Live Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* INTERACTIVE LIVE EMBED AS DEFAULT */}
      <div className="space-y-4">
        <div className="glass-panel rounded-3xl p-3 sm:p-5 border border-teal-400/35 bg-[#021827]/85 shadow-2xl space-y-3">
          {/* Toolbar for the embed */}
          <div className="flex items-center justify-between px-2 py-1 text-xs text-teal-300/80 border-b border-teal-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] truncate max-w-[220px] sm:max-w-md text-teal-200">
                steady-kleicha-743a24.netlify.app
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshIframe}
                className="p-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900 border border-teal-500/25 text-teal-300 hover:text-white transition-colors cursor-pointer"
                title="Reload Gift Page"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullscreenIframe(true)}
                className="p-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900 border border-teal-500/25 text-teal-300 hover:text-white transition-colors cursor-pointer"
                title="Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Interactive Iframe Frame */}
          <div className="relative w-full h-[720px] sm:h-[820px] rounded-2xl overflow-hidden bg-white/5 border border-teal-500/30 shadow-inner">
            <iframe
              key={iframeKey}
              src={baseEmbedUrl}
              title="Kanishka's Gift for Tanmay"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          <p className="text-center text-xs text-teal-300/70 italic pt-1">
            Tap the card above to open her wax seal and reveal her gift, or tap "Live Website" to visit directly.
          </p>
        </div>
      </div>

      {/* TANMAY'S RESPONSE & THE BOYFRIEND'S DAY LETTER */}
      {boyfriendsDayLetter && (
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-teal-400/40 bg-gradient-to-b from-[#032a3d]/85 via-[#021a29]/80 to-[#02101e]/85 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 border-b border-teal-500/20 pb-4">
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                How Your Gift Made Me Feel
              </h3>
              <p className="text-xs text-teal-300/70">
                To the sweetest girl in the universe, who made me feel like the luckiest boyfriend alive
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-100 text-sm sm:text-base leading-relaxed font-light">
            {boyfriendsDayLetter.letterContent.map((para, idx) => (
              <p key={idx} className="bg-teal-950/40 p-4 rounded-2xl border border-teal-500/15 text-teal-50">
                {para}
              </p>
            ))}
          </div>

          <div className="pt-4 border-t border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif italic text-white text-base">Forever and always yours,</p>
              <p className="text-xs text-teal-300">Your Tanmay ❤️</p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-950/70 hover:bg-teal-900 border border-teal-500/30 text-xs sm:text-sm text-teal-200 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Back to Home</span>
        </button>
        {onNextPage && (
          <button
            onClick={onNextPage}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        )}
      </div>

      {/* FULLSCREEN IFRAME MODAL */}
      {isFullscreenIframe && (
        <div 
          onClick={() => setIsFullscreenIframe(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[95vh] flex flex-col bg-[#021827] rounded-3xl border border-teal-400/40 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-teal-500/20 bg-teal-950/90">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white font-serif">
                  Live Website • steady-kleicha-743a24.netlify.app
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={giftUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-teal-900/60 hover:bg-teal-800 border border-teal-500/30 text-teal-200 hover:text-white transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsFullscreenIframe(false)}
                  className="p-1.5 rounded-full hover:bg-teal-900/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full h-full bg-white">
              <iframe
                src={baseEmbedUrl}
                title="Fullscreen Kanishka Gift"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
