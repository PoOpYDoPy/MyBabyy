import React from 'react';
import { X, ExternalLink, Sparkles, Clock } from 'lucide-react';

interface TimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Container Card */}
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-[#031926] border border-teal-400/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#02101e] border-b border-teal-500/25 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-white text-base sm:text-lg">
                  8th June — Best Friends Day
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-950 text-[10px] text-teal-300 border border-teal-500/30 font-mono">
                  Time Capsule
                </span>
              </div>
              <p className="text-[11px] text-teal-300/70">
                The website I made for you with all my heart on Best Friends Day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/old-website.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-950/70 hover:bg-teal-900 border border-teal-500/30 text-xs text-teal-200 transition-colors"
              title="Open full page in new tab"
            >
              <span>Full Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Time Capsule"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Viewport */}
        <div className="relative flex-1 w-full bg-slate-900 overflow-hidden">
          <iframe
            src="/old-website.html"
            title="Where It Started - 8th June Best Friends Day Website"
            className="w-full h-full border-none"
          />
        </div>

        {/* Bottom bar inside modal */}
        <div className="px-4 py-2.5 bg-[#02101e] border-t border-teal-500/20 flex items-center justify-between text-xs text-teal-300/80 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">The website I made for you on Best Friends Day</span>
            <span className="sm:hidden">8th June Website</span>
          </span>
          <a
            href="/old-website.html"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden flex items-center gap-1 text-teal-300 underline"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
