import React, { useState } from 'react';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  Maximize2, 
  X,
  Heart
} from 'lucide-react';

interface BestFriendsDayViewProps {
  onBack: () => void;
  onNextPage?: () => void;
}

export const BestFriendsDayView: React.FC<BestFriendsDayViewProps> = ({ 
  onBack, 
  onNextPage 
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleRefresh = () => {
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
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-medium">8th June • Best Friends Day</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-xs text-teal-300">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>Time Capsule • Where It All Started</span>
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          8th June — Best Friends Day
        </h1>
        <p className="font-serif italic text-sm sm:text-base text-teal-200/90 font-light max-w-xl mx-auto leading-relaxed">
          The website I made for you with all my heart back when we were best friends.
        </p>

        {/* Action Button */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/old-website.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-400 text-slate-950 text-xs sm:text-sm font-semibold hover:bg-teal-300 transition-all shadow-lg hover:shadow-teal-400/25 active:scale-95 cursor-pointer"
          >
            <span>Open in Full Browser Tab</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Embedded Interactive Frame */}
      <div className="space-y-4">
        <div className="glass-panel rounded-3xl p-3 sm:p-5 border border-teal-400/35 bg-[#021827]/85 shadow-2xl space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-2 py-1 text-xs text-teal-300/80 border-b border-teal-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-teal-200">
                8th June Website Experience
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900 border border-teal-500/25 text-teal-300 hover:text-white transition-colors cursor-pointer"
                title="Reload Website"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900 border border-teal-500/25 text-teal-300 hover:text-white transition-colors cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div className="relative w-full h-[600px] sm:h-[680px] rounded-2xl overflow-hidden bg-slate-900 border border-teal-500/30 shadow-inner">
            <iframe
              key={iframeKey}
              src="/old-website.html"
              title="8th June Best Friends Day Website"
              className="w-full h-full border-0"
            />
          </div>

          <p className="text-center text-xs text-teal-300/70 italic pt-1">
            Tap inside the frame to navigate through all 3 pages, answer the question, and unwrap your gifts!
          </p>
        </div>
      </div>

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

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[95vh] flex flex-col bg-[#021827] rounded-3xl border border-teal-400/40 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-teal-500/20 bg-teal-950/90">
              <span className="text-xs text-white font-serif">
                8th June — Best Friends Day Time Capsule
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/old-website.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-teal-900/60 hover:bg-teal-800 border border-teal-500/30 text-teal-200 hover:text-white transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-full hover:bg-teal-900/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full h-full bg-white">
              <iframe
                src="/old-website.html"
                title="Fullscreen 8th June Website"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
