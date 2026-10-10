import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Cake, 
  Star, 
  Compass, 
  BookOpen, 
  Clock, 
  Gift, 
  ChevronRight,
  ArrowRight,
  MoreVertical,
  X,
  Flower2
} from 'lucide-react';
import { APP_CONTENT } from '../data/content';
import { OurJourneyTimeline } from './OurJourneyTimeline';
import { DigitalScrapbook } from './DigitalScrapbook';
import { PhaseFourView } from './PhaseFourView';
import { PhotoBouquet } from './PhotoBouquet';
import { BestFriendsDayView } from './BestFriendsDayView';
import { MainWorldTab } from '../types';

interface MainWorldProps {
  onReplayCake: () => void;
  onOpenTimeCapsule: () => void;
}

export const MainWorld: React.FC<MainWorldProps> = ({ onReplayCake, onOpenTimeCapsule }) => {
  const { nickname, relationshipStartDate } = APP_CONTENT;

  // Active view tab: 'home' | 'journey' | 'time_capsule' | 'memories' | 'gift' | 'bouquet'
  const [activeTab, setActiveTab] = useState<MainWorldTab>('home');

  // Daily messages state with custom storage
  const [messages, setMessages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kittu_daily_messages');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return APP_CONTENT.dailyMessages;
  });
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);

  // Live real-time counter since 21 June (days, hours, minutes, seconds)
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      try {
        const start = new Date(relationshipStartDate).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - start);
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
        const seconds = Math.floor((diffMs / 1000) % 60);
        setTimeTogether({ days, hours, minutes, seconds });
      } catch {
        setTimeTogether({ days: 104, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [relationshipStartDate]);

  // Auto-rotate daily reminders every 30 seconds
  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 30000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const nextDailyMessage = () => {
    setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
  };

  const navigateToTab = (tab: MainWorldTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col pb-16 z-10">
      {/* Clean Minimalist Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#02101e]/85 backdrop-blur-md border-b border-teal-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 3-Dot Navigation Bar (Appears on all pages other than the first two stages) */}
          <div className="relative">
              <button
                onClick={() => setIsNavMenuOpen((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isNavMenuOpen
                    ? 'bg-teal-500/30 border-teal-300 text-teal-200 shadow-lg shadow-teal-500/20'
                    : 'bg-teal-950/60 hover:bg-teal-900/70 border-teal-500/35 text-teal-300 hover:text-white'
                }`}
                title="Navigation Menu"
                aria-label="Navigation Menu"
              >
                <MoreVertical className="w-4.5 h-4.5" />
              </button>

              {/* 3-Dot Navigation Dropdown Menu showing all options */}
              {isNavMenuOpen && (
                <>
                  {/* Backdrop overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNavMenuOpen(false)}
                  />

                  <div className="absolute left-0 mt-2.5 w-72 sm:w-80 rounded-2xl bg-[#021422]/98 border border-teal-400/40 shadow-2xl backdrop-blur-2xl py-3 z-50 animate-fadeIn divide-y divide-teal-500/15">
                    <div className="px-4 pb-2.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 font-mono">
                        Navigate Sections
                      </span>
                      <button
                        onClick={() => setIsNavMenuOpen(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-2 space-y-1 px-2">
                      {/* Home */}
                      <button
                        onClick={() => {
                          navigateToTab('home');
                          setIsNavMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          activeTab === 'home'
                            ? 'bg-teal-500/20 text-teal-200 font-medium'
                            : 'text-slate-200 hover:bg-teal-950/60 hover:text-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300 shrink-0">
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Home</div>
                          <div className="text-[11px] text-teal-300/60">Welcome & time counter</div>
                        </div>
                      </button>

                      {/* Our Journey */}
                      <button
                        onClick={() => {
                          navigateToTab('journey');
                          setIsNavMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-slate-200 hover:bg-teal-950/60 hover:text-white"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300 shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Our Journey</div>
                          <div className="text-[11px] text-teal-300/60">From the Taekwondo ground to today</div>
                        </div>
                      </button>

                      {/* Best Friends Day (8th June) */}
                      <button
                        onClick={() => {
                          navigateToTab('time_capsule');
                          setIsNavMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-slate-200 hover:bg-teal-950/60 hover:text-white"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">8th June — Best Friends Day</div>
                          <div className="text-[11px] text-teal-300/60">Our milestone & friendship celebration</div>
                        </div>
                      </button>

                      {/* Memories & Scrapbook */}
                      <button
                        onClick={() => {
                          navigateToTab('memories');
                          setIsNavMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-slate-200 hover:bg-teal-950/60 hover:text-white"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300 shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Memories & Scrapbook</div>
                          <div className="text-[11px] text-teal-300/60">Polaroids, moments & notes</div>
                        </div>
                      </button>

                      {/* The Gift You Gave Me */}
                      <button
                        onClick={() => {
                          navigateToTab('gift');
                          setIsNavMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-slate-200 hover:bg-teal-950/60 hover:text-white"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300 shrink-0">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">The Gift You Gave Me</div>
                          <div className="text-[11px] text-teal-300/60">Boyfriend's Day letter & token</div>
                        </div>
                      </button>

                      {/* Just For You */}
                      <button
                        onClick={() => {
                          navigateToTab('bouquet');
                          setIsNavMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-slate-200 hover:bg-teal-950/60 hover:text-white"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300 shrink-0">
                          <Flower2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Just For You</div>
                          <div className="text-[11px] text-teal-300/60">Blooms & words dedicated to you</div>
                        </div>
                      </button>

                      {/* Replay Cake Ceremony */}
                      <button
                        onClick={() => {
                          setIsNavMenuOpen(false);
                          onReplayCake();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-slate-200 hover:bg-teal-950/60 hover:text-white"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-300 shrink-0">
                          <Cake className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Replay Cake Ceremony</div>
                          <div className="text-[11px] text-teal-300/60">Blowing candles & wishing again</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          <div 
            onClick={() => navigateToTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="font-serif font-semibold text-lg text-white tracking-wide">
              Kanishka & Me
            </span>
            <Heart className="w-4 h-4 fill-red-500 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Current Active Tab Pill */}
        <div className="text-xs text-teal-300 font-medium px-3.5 py-1 rounded-full bg-teal-950/60 border border-teal-500/25">
          {activeTab === 'home'
            ? 'Welcome Home'
            : activeTab === 'journey'
            ? 'Our Journey'
            : activeTab === 'time_capsule'
            ? '8th June — Best Friends Day'
            : activeTab === 'memories'
            ? 'Our Memories'
            : activeTab === 'gift'
            ? 'The Gift You Gave Me'
            : 'Just For You'}
        </div>
      </header>

      {/* VIEW SWITCHER: EACH SECTION HAS ITS OWN SEPARATE DEDICATED PAGE */}
      {activeTab === 'journey' ? (
        /* PAGE 2: DEDICATED OUR JOURNEY PAGE */
        <OurJourneyTimeline 
          onBack={() => navigateToTab('home')}
          onNext={() => navigateToTab('time_capsule')}
        />
      ) : activeTab === 'time_capsule' ? (
        /* PAGE 3: DEDICATED BEST FRIENDS DAY (8TH JUNE) PAGE */
        <BestFriendsDayView 
          onBack={() => navigateToTab('home')}
          onNextPage={() => navigateToTab('memories')}
        />
      ) : activeTab === 'memories' ? (
        /* PAGE 4: DEDICATED DIGITAL SCRAPBOOK / MEMORIES PAGE */
        <DigitalScrapbook
          onBack={() => navigateToTab('home')}
          onNext={() => navigateToTab('gift')}
        />
      ) : activeTab === 'gift' ? (
        /* PAGE 5: DEDICATED THE GIFT YOU GAVE ME (BOYFRIEND'S DAY) PAGE */
        <PhaseFourView
          onBack={() => navigateToTab('home')}
          onNextPage={() => navigateToTab('bouquet')}
        />
      ) : activeTab === 'bouquet' ? (
        /* PAGE 6: DEDICATED PHOTO BOUQUET PAGE — AT THE VERY LAST! */
        <main className="max-w-4xl mx-auto px-4 pt-6 pb-12 w-full space-y-6 animate-fadeIn">
          <PhotoBouquet 
            onBack={() => navigateToTab('home')}
          />
        </main>
      ) : (
        /* PAGE 1: WELCOME HOME VIEW */
        <main className="max-w-4xl mx-auto px-4 pt-6 w-full space-y-8 animate-fadeIn">
          {/* Welcome Home Hero Card */}
          <div className="relative glass-panel rounded-3xl p-6 sm:p-10 text-center overflow-hidden border border-teal-500/25 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-950/70 border border-teal-400/25 text-xs text-teal-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Welcome Home, {nickname}</span>
              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-md">
              A World Made Just For You
            </h1>
            <p className="mt-4 text-base sm:text-lg text-teal-100/90 max-w-xl mx-auto font-light leading-relaxed">
              Every screen, every word, and every quiet memory here exists to remind you of how deeply loved, valued, and cherished you are.
            </p>

            {/* Live Real-Time Days Together Counter (Anchored to 21 June) */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="bg-teal-950/50 border border-teal-400/25 rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between text-xs text-teal-300/80 mb-3 px-1">
                  <span className="uppercase tracking-widest font-semibold text-[10px] text-teal-400">
                    Time Together
                  </span>
                  <span className="font-medium text-teal-200">
                    Since you confessed on 21 June 💍
                  </span>
                </div>
                {/* Counter Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-[#02101e]/80 rounded-xl py-3 px-2 border border-teal-500/20">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-white">
                      {timeTogether.days}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-teal-400/70 mt-0.5">
                      Days
                    </span>
                  </div>
                  <div className="bg-[#02101e]/80 rounded-xl py-3 px-2 border border-teal-500/20">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-white">
                      {timeTogether.hours}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-teal-400/70 mt-0.5">
                      Hours
                    </span>
                  </div>
                  <div className="bg-[#02101e]/80 rounded-xl py-3 px-2 border border-teal-500/20">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-white">
                      {timeTogether.minutes}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-teal-400/70 mt-0.5">
                      Minutes
                    </span>
                  </div>
                  <div className="bg-[#02101e]/80 rounded-xl py-3 px-2 border border-teal-500/20">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-teal-300 tabular-nums">
                      {timeTogether.seconds}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-teal-400/70 mt-0.5">
                      Seconds
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-teal-300/60 mt-3 text-center">
                  And every single second makes me fall in love all over again.
                </p>
              </div>
            </div>
          </div>

          {/* Daily Love Message Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/20 relative shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-teal-400 font-medium">
                <Star className="w-4 h-4 fill-teal-400 text-teal-400" />
                <span>Daily Reminder For You</span>
              </div>
              <button
                onClick={nextDailyMessage}
                className="text-xs text-teal-300 hover:text-white underline underline-offset-4 cursor-pointer"
              >
                Next Reminder →
              </button>
            </div>
            <p className="font-serif italic text-xl sm:text-2xl text-teal-50 leading-relaxed py-2">
              "{messages[currentMessageIndex]}"
            </p>
            <div className="flex items-center justify-end text-xs text-teal-400/70 mt-2 pt-2 border-t border-teal-500/10">
              <span>— With all my love, always ❤️</span>
            </div>
          </div>

          {/* Single Our Journey Card */}
          <div 
            onClick={() => navigateToTab('journey')}
            className="glass-panel rounded-3xl p-5 sm:p-6 border border-teal-400/35 hover:border-teal-300/60 hover:bg-teal-950/60 transition-all cursor-pointer shadow-xl group bg-gradient-to-r from-teal-950/60 via-[#032433]/70 to-teal-950/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-105 transition-transform shrink-0">
                  <Compass className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-lg sm:text-xl group-hover:text-teal-200 transition-colors">
                    Our Journey
                  </h4>
                  <p className="text-xs sm:text-sm text-teal-200/80 font-light mt-0.5">
                    From the Taekwondo ground to today and beyond
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-900/60 border border-teal-400/30 text-teal-200 text-xs font-semibold group-hover:bg-teal-400 group-hover:text-slate-950 transition-all shadow-sm">
                <span className="hidden sm:inline">Explore Story</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
