import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  ArrowLeft,
  ArrowRight,
  Camera,
  Maximize2,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { APP_CONTENT } from '../data/content';
import { getMemoryPhotos, saveMemoryPhotos } from '../utils/photoStorage';

interface OurJourneyTimelineProps {
  onBack?: () => void;
  onNext?: () => void;
}

export const OurJourneyTimeline: React.FC<OurJourneyTimelineProps> = ({ onBack, onNext }) => {
  const chapters = APP_CONTENT.journeyChapters;

  const [likedChapters, setLikedChapters] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('kittu_liked_chapters');
      if (saved) return JSON.parse(saved);
    } catch {
      // safe
    }
    return {};
  });

  const [activeChapterId, setActiveChapterId] = useState<string>('ch-1');
  const [showIndexMenu, setShowIndexMenu] = useState<boolean>(false);
  const [chapterPhotosMap, setChapterPhotosMap] = useState<Record<string, string[]>>({});
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPhotos = async () => {
      const map: Record<string, string[]> = {};
      for (const ch of chapters) {
        if (ch.photoMemoryId) {
          const photos = await getMemoryPhotos(ch.photoMemoryId);
          if (photos && photos.length > 0) {
            map[ch.photoMemoryId] = photos;
          }
        }
      }
      if (isMounted) {
        setChapterPhotosMap(map);
      }
    };
    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, [chapters]);

  const handleUploadPhotos = async (memoryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newPhotos.push(dataUrl);
    }
    const existing = chapterPhotosMap[memoryId] || [];
    const merged = [...existing, ...newPhotos];
    await saveMemoryPhotos(memoryId, merged);
    setChapterPhotosMap((prev) => ({ ...prev, [memoryId]: merged }));
  };

  const toggleLike = (id: string) => {
    setLikedChapters((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('kittu_liked_chapters', JSON.stringify(updated));
      } catch {
        // safe
      }
      return updated;
    });
  };

  const scrollToChapter = (id: string) => {
    setActiveChapterId(id);
    setShowIndexMenu(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {onBack && (
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-950/70 hover:bg-teal-900 border border-teal-500/30 text-xs sm:text-sm text-teal-200 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
            title="Return to Welcome Home"
          >
            <ArrowLeft className="w-4 h-4 text-teal-400" />
            <span>Back to Home</span>
          </button>
          <span className="text-xs text-teal-400/60 font-mono">
            {chapters.length} Chapters
          </span>
        </div>
      )}

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-950/70 border border-teal-500/25 text-xs text-teal-300">
          <BookOpen className="w-3.5 h-3.5 text-teal-400" />
          <span>Our Story — Written Just For You</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <span>Our Journey</span>
          <span className="text-teal-400">✨</span>
        </h1>
        <p className="font-serif italic text-base sm:text-lg text-teal-200/90 font-light max-w-lg mx-auto">
          From the day we met to the days we chose each other.
        </p>
      </div>

      <div className="sticky top-18 z-30 flex justify-center">
        <div className="relative">
          <button
            onClick={() => setShowIndexMenu(!showIndexMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#021827]/90 backdrop-blur-md border border-teal-400/30 text-xs text-teal-200 hover:text-white shadow-xl transition-all cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-teal-400" />
            <span>Jump To Chapter</span>
            {showIndexMenu ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showIndexMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-2xl bg-[#031c2d] border border-teal-500/30 p-2 shadow-2xl space-y-1 animate-fadeIn z-50">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => scrollToChapter(ch.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    activeChapterId === ch.id
                      ? 'bg-teal-500/20 text-white font-medium'
                      : 'text-teal-300/80 hover:bg-teal-950/60 hover:text-white'
                  }`}
                >
                  <span className="truncate pr-2">
                    {idx + 1}. {ch.dateTag} — {ch.title}
                  </span>
                  {likedChapters[ch.id] && <Heart className="w-3 h-3 fill-red-500 text-red-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative space-y-10 sm:space-y-12">
        {chapters.map((chapter, index) => {
          const isLiked = likedChapters[chapter.id];
          const isConclusion = chapter.isConcluding;
          return (
            <article
              key={chapter.id}
              id={chapter.id}
              className={`relative scroll-mt-24 transition-all duration-300 ${
                isConclusion
                  ? 'glass-panel rounded-3xl p-6 sm:p-10 border-2 border-teal-400/40 bg-gradient-to-b from-[#032233]/90 via-[#031d2c]/90 to-[#021524]/90 shadow-2xl'
                  : 'glass-panel rounded-3xl p-6 sm:p-9 border border-teal-500/25 shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between border-b border-teal-500/15 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-950/80 border border-teal-400/30 text-xs font-serif font-semibold text-teal-300 tracking-wide">
                    {chapter.dateTag}
                  </span>
                  {!isConclusion && (
                    <span className="text-[11px] text-teal-400/60 font-mono">
                      Chapter {String(index + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleLike(chapter.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                      : 'text-teal-400/60 hover:text-teal-200'
                  }`}
                  title="Remember this chapter"
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="hidden sm:inline">{isLiked ? 'Cherished' : 'Cherish'}</span>
                </button>
              </div>

              <h2 className={`font-serif font-bold text-white tracking-tight mb-5 ${
                isConclusion ? 'text-2xl sm:text-3xl text-teal-100' : 'text-xl sm:text-2xl'
              }`}>
                {chapter.title}
              </h2>

              <div className="space-y-4 text-slate-100 text-sm sm:text-base leading-[1.85] font-light">
                {chapter.content.map((paragraph, pIdx) => {
                  const isBoldEnding =
                    paragraph.startsWith('This is our story, babyy.') ||
                    paragraph.startsWith('This is our journey, Kittu.');
                  if (isBoldEnding) {
                    return (
                      <p
                        key={pIdx}
                        className="font-serif italic font-semibold text-teal-200 text-base sm:text-lg bg-teal-950/60 p-4 sm:p-5 rounded-2xl border border-teal-400/30 shadow-inner mt-4"
                      >
                        {paragraph}
                      </p>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-teal-50/95 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {chapter.subsections && chapter.subsections.length > 0 && (
                <div className="mt-7 pt-6 border-t border-teal-500/20 space-y-4">
                  {chapter.subsections.map((sub, sIdx) => (
                    <div key={sIdx} className="p-5 sm:p-6 rounded-2xl bg-teal-950/40 border border-teal-500/20 space-y-3">
                      <h3 className="font-serif font-semibold text-teal-200 text-base sm:text-lg">
                        {sub.title}
                      </h3>
                      <div className="space-y-3 text-sm sm:text-base leading-[1.85] text-teal-50/90 font-light">
                        {sub.content.map((subP, subPIdx) => (
                          <p key={subPIdx}>{subP}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {chapter.photoMemoryId && (() => {
                const photos = chapterPhotosMap[chapter.photoMemoryId] || [];
                return (
                  <div className="mt-7 pt-6 border-t border-teal-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📸</span>
                        <h4 className="font-serif font-semibold text-white text-sm sm:text-base">
                          Our Photos Together — 7th August
                        </h4>
                      </div>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-xs text-teal-200 cursor-pointer transition-colors shadow-sm active:scale-95">
                        <Camera className="w-3.5 h-3.5 text-teal-300" />
                        <span>{photos.length > 0 ? '+ Add photo' : 'Select photos'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleUploadPhotos(chapter.photoMemoryId!, e.target.files)}
                        />
                      </label>
                    </div>

                    {photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                        {photos.map((photoUrl, pIdx) => (
                          <div
                            key={pIdx}
                            className="relative group/photo rounded-2xl overflow-hidden border border-teal-400/30 bg-[#021422] aspect-4/3 cursor-pointer shadow-md"
                            onClick={() => setZoomedPhoto(photoUrl)}
                          >
                            <img
                              src={photoUrl}
                              alt={`7th August photo ${pIdx + 1}`}
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedPhoto(photoUrl);
                                }}
                                className="p-1.5 rounded-full bg-black/70 text-white hover:text-teal-300 transition-colors"
                                title="Zoom photo"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl border-2 border-dashed border-teal-400/40 bg-teal-950/40 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mx-auto text-teal-300">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="text-xs text-teal-200">
                          <p className="font-serif font-semibold text-white">Our 7th August Keepsake Photos</p>
                          <p className="text-[11px] text-teal-300/70 mt-0.5">
                            Select the photos you took together to preserve them forever in this chapter
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-semibold text-xs shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Select Photos</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleUploadPhotos(chapter.photoMemoryId!, e.target.files)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })()}

              {isConclusion && (
                <div className="mt-6 pt-5 border-t border-teal-500/20 flex items-center justify-between text-xs text-teal-300/80">
                  <span className="flex items-center gap-1.5 font-serif italic text-sm text-teal-200">
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    <span>To be continued, together...</span>
                  </span>
                  <span className="text-teal-400/60 font-mono">Forever & Always</span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-950/70 hover:bg-teal-900 border border-teal-500/30 text-xs sm:text-sm text-teal-200 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-teal-400" />
            <span>Back to Home</span>
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        )}
      </div>

      {zoomedPhoto && (
        <div
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute -top-12 right-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedPhoto}
              alt="Zoomed keepsake photo"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-teal-400/30"
            />
          </div>
        </div>
      )}
    </div>
  );
};
