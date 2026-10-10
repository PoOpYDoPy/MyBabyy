import React, { useState, useMemo, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  Sparkles, 
  Plus, 
  X, 
  ArrowLeft, 
  ArrowRight,
  MessageSquare, 
  Shuffle, 
  Camera, 
  Image as ImageIcon, 
  Maximize2, 
  Bookmark,
  Upload
} from 'lucide-react';
import { SCRAPBOOK_MEMORIES } from '../data/scrapbookMemories';
import { ScrapbookMemory, MemoryTag } from '../types';
import { getMemoryPhotos, saveMemoryPhotos } from '../utils/photoStorage';

interface DigitalScrapbookProps {
  onBack: () => void;
  onNext?: () => void;
}

const ALL_TAGS: MemoryTag[] = [
  'All',
  'Sweet Moments',
  'Late Nights',
  'Inside Jokes',
  'Milestones',
  'Little Things',
];

export const DigitalScrapbook: React.FC<DigitalScrapbookProps> = ({ onBack, onNext }) => {
  const [memories, setMemories] = useState<ScrapbookMemory[]>(() => {
    try {
      const saved = localStorage.getItem('kittu_custom_scrapbook');
      if (saved) {
        const custom = JSON.parse(saved);
        return [...custom, ...SCRAPBOOK_MEMORIES];
      }
    } catch {
      // safe fallback
    }
    return SCRAPBOOK_MEMORIES;
  });

  const [likedMemories, setLikedMemories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('kittu_liked_scrapbook');
      if (saved) return JSON.parse(saved);
    } catch {
      // safe
    }
    return {};
  });

  const [memoryPhotosMap, setMemoryPhotosMap] = useState<Record<string, string[]>>({});
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [retryMap, setRetryMap] = useState<Record<string, number>>({});

  const handleScrapbookImageError = (e: React.SyntheticEvent<HTMLImageElement>, originalUrl: string) => {
    const currentAttempt = retryMap[originalUrl] || 0;
    const clean = originalUrl.split('/').pop() || '';
    const numMatch = clean.match(/(\d+)/);
    const num = numMatch ? numMatch[1] : '';

    const candidates = [
      originalUrl,
      originalUrl.replace('/photos/', '/'),
      num ? `/photos/${num}.jpg` : '',
      num ? `/photos/${num}.JPG` : '',
      num ? `/photos/${num}.jpeg` : '',
      num ? `/photos/${num}.JPEG` : '',
      num ? `/photos/${num}.png` : '',
      num ? `/photos/${num}.PNG` : '',
      num ? `/photos/${num}.webp` : '',
      num ? `/${num}.jpg` : '',
      num ? `/${num}.JPG` : '',
      num ? `/${num}.jpeg` : '',
      num ? `/${num}.png` : '',
      num ? `photos/${num}.jpg` : '',
      num ? `photos/${num}.JPG` : '',
    ].filter(Boolean);

    const nextAttempt = currentAttempt + 1;
    if (nextAttempt < candidates.length) {
      setRetryMap((prev) => ({ ...prev, [originalUrl]: nextAttempt }));
      e.currentTarget.src = candidates[nextAttempt];
    } else {
      setBrokenImages((prev) => ({ ...prev, [originalUrl]: true }));
    }
  };
  const [selectedTag, setSelectedTag] = useState<MemoryTag>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState<number>(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return dayOfYear % SCRAPBOOK_MEMORIES.length;
  });
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [focusedMemory, setFocusedMemory] = useState<ScrapbookMemory | null>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState<ScrapbookMemory['tag']>('Sweet Moments');
  const [newSticker, setNewSticker] = useState('✨');

  useEffect(() => {
    let isMounted = true;
    const loadAllPhotos = async () => {
      const map: Record<string, string[]> = {};
      for (const mem of memories) {
        const dbPhotos = await getMemoryPhotos(mem.id);
        const hardcodedPhotos = mem.photos || [];
        const merged = [...new Set([...hardcodedPhotos, ...dbPhotos])];
        if (merged.length > 0) {
          map[mem.id] = merged;
        }
      }
      if (isMounted) {
        setMemoryPhotosMap(map);
      }
    };
    loadAllPhotos();
    return () => {
      isMounted = false;
    };
  }, [memories]);

  const toggleLike = (id: string) => {
    setLikedMemories((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('kittu_liked_scrapbook', JSON.stringify(updated));
      } catch {
        // safe
      }
      return updated;
    });
  };

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const shuffleFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % memories.length);
  };

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
    const existing = memoryPhotosMap[memoryId] || [];
    const merged = [...existing, ...newPhotos];
    await saveMemoryPhotos(memoryId, merged);
    setMemoryPhotosMap((prev) => ({ ...prev, [memoryId]: merged }));
  };

  const filteredMemories = useMemo(() => {
    return memories.filter((mem) => {
      const matchesTag = selectedTag === 'All' || mem.tag === selectedTag;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mem.title.toLowerCase().includes(q) ||
        mem.story.toLowerCase().includes(q) ||
        mem.personalNote.toLowerCase().includes(q) ||
        mem.date.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [memories, selectedTag, searchQuery]);

  const featuredMemory = memories[featuredIndex] || memories[0];

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStory.trim()) return;
    const newEntry: ScrapbookMemory = {
      id: `custom-mem-${Date.now()}`,
      date: newDate.trim() || 'Today',
      title: newTitle.trim(),
      story: newStory.trim(),
      personalNote: newNote.trim() || 'A cherished little memory with Kittu.',
      tag: newTag,
      sticker: newSticker || '✨',
      accentColor: '#2dd4bf',
      likesCount: 1,
    };
    const updated = [newEntry, ...memories];
    setMemories(updated);
    try {
      const customOnly = updated.filter((m) => m.id.startsWith('custom-mem-'));
      localStorage.setItem('kittu_custom_scrapbook', JSON.stringify(customOnly));
    } catch {
      // safe
    }
    setNewTitle('');
    setNewDate('');
    setNewStory('');
    setNewNote('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-950/70 hover:bg-teal-900 border border-teal-500/30 text-xs sm:text-sm text-teal-200 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
          title="Return to Welcome Home"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Back to Home</span>
        </button>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-xs font-medium text-teal-200 cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-teal-300" />
          <span>Add Memory</span>
        </button>
      </div>

      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-950/70 border border-teal-500/25 text-xs text-teal-300">
          <Bookmark className="w-3.5 h-3.5 text-teal-400" />
          <span>Digital Scrapbook — Keepsakes & Polaroids</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <span>Our Memories</span>
          <span className="text-red-500">❤️</span>
        </h1>
        <p className="font-serif italic text-base sm:text-lg text-teal-200/90 font-light max-w-md mx-auto">
          The little moments that mean the entire world.
        </p>
      </div>

      {featuredMemory && (
        <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border-2 border-teal-400/30 shadow-2xl bg-gradient-to-r from-teal-950/60 via-[#032230]/70 to-teal-950/60 overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-teal-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-semibold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Memory Of The Day</span>
              </span>
              <span className="text-xs text-teal-400/70">{featuredMemory.date}</span>
            </div>
            <button
              onClick={shuffleFeatured}
              className="flex items-center gap-1.5 text-xs text-teal-300/80 hover:text-white transition-colors cursor-pointer"
              title="Shuffle another memory"
            >
              <Shuffle className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{featuredMemory.sticker || '✨'}</span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                  {featuredMemory.title}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-100 font-light leading-relaxed">
                {featuredMemory.story}
              </p>
              <div className="mt-3 p-3.5 rounded-2xl bg-teal-950/50 border border-teal-500/20">
                <p className="font-serif italic text-xs sm:text-sm text-teal-200/90 leading-relaxed">
                  "{featuredMemory.personalNote}"
                </p>
              </div>
            </div>
            <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2 pt-2 sm:pt-0">
              <button
                onClick={() => setFocusedMemory(featuredMemory)}
                className="px-4 py-2 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs transition-all cursor-pointer shadow-md"
              >
                Open Memory
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-teal-400/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search memories, dates, inside jokes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-teal-950/60 border border-teal-500/25 text-xs sm:text-sm text-white placeholder-teal-400/40 focus:outline-none focus:border-teal-400 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 font-medium cursor-pointer ${
                selectedTag === tag
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-teal-950/60 border border-teal-500/20 text-teal-300 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        {filteredMemories.map((mem) => {
          const isLiked = likedMemories[mem.id];
          const isExpanded = expandedNotes[mem.id];
          const photos = memoryPhotosMap[mem.id] || [];
          const isAugust7 = mem.id === 'mem-august-7-photos';
          return (
            <div
              key={mem.id}
              className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between shadow-xl group hover:shadow-2xl ${
                isAugust7 
                  ? 'border-teal-400/50 bg-gradient-to-b from-[#032333]/90 to-[#021826]/90' 
                  : 'border-teal-500/25 hover:border-teal-400/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {mem.sticker || '🌸'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/20 text-[10px] font-medium text-teal-300">
                      {mem.tag}
                    </span>
                    {photos.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>{photos.length}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-teal-400/70 font-mono">
                    {mem.date}
                  </span>
                </div>

                <h3 
                  onClick={() => setFocusedMemory(mem)}
                  className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight cursor-pointer hover:text-teal-200 transition-colors"
                >
                  {mem.title}
                </h3>

                {photos.length > 0 && (
                  <div className="mt-3.5 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          className="relative group/photo rounded-xl overflow-hidden border border-teal-500/30 bg-slate-900 aspect-4/3 cursor-pointer shadow-md"
                          onClick={() => setZoomedPhoto(photoUrl)}
                        >
                          {brokenImages[photoUrl] ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-b from-[#042436] to-[#02131d] text-teal-300">
                              <Camera className="w-5 h-5 mb-1 text-teal-400 group-hover/photo:scale-110 transition-transform" />
                              <span className="text-[10px] font-mono text-teal-200">
                                {photoUrl.split('/').pop()}
                              </span>
                              <span className="text-[8px] text-teal-400/70 mt-0.5">
                                Photo {pIdx + 1}
                              </span>
                            </div>
                          ) : (
                            <img
                              src={photoUrl}
                              alt={`${mem.title} ${pIdx + 1}`}
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                              onError={(e) => handleScrapbookImageError(e, photoUrl)}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedPhoto(photoUrl);
                              }}
                              className="p-1.5 rounded-full bg-black/70 text-white hover:text-teal-300 transition-colors"
                              title="Zoom"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
                  {mem.story}
                </p>

                {mem.personalNote && (
                  <div className="mt-3.5 pt-2.5 border-t border-teal-500/15">
                    <button
                      onClick={() => toggleNote(mem.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 text-teal-400" />
                      <span>{isExpanded ? 'Hide Note' : 'What was in my heart'}</span>
                    </button>
                    {isExpanded && (
                      <div className="mt-2 p-3 rounded-2xl bg-teal-950/45 border border-teal-500/20 text-xs font-serif italic text-teal-100/90 leading-relaxed animate-fadeIn">
                        "{mem.personalNote}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-teal-500/15 flex items-center justify-between text-xs text-teal-400/60 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setFocusedMemory(mem)}
                    className="text-teal-300 hover:text-white underline underline-offset-4 cursor-pointer text-[11px]"
                  >
                    View Details →
                  </button>
                  <label className="flex items-center gap-1 text-[11px] text-teal-300/80 hover:text-white cursor-pointer px-2.5 py-1 rounded-full bg-teal-950/70 border border-teal-500/25 hover:border-teal-400/50 transition-colors" title="Upload photos for this memory">
                    <Upload className="w-3 h-3 text-teal-400" />
                    <span>Add Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadPhotos(mem.id, e.target.files)}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(mem.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                      isLiked
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                        : 'hover:text-teal-200'
                    }`}
                    title="Remember this memory"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{isLiked ? 'Cherished' : 'Remember'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-3xl border border-teal-500/20 space-y-2">
          <p className="font-serif italic text-base text-teal-200">
            No memories match "{searchQuery}" in {selectedTag}.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
            }}
            className="text-xs text-teal-400 underline underline-offset-4 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {focusedMemory && (
        <div
          onClick={() => setFocusedMemory(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#031c2d] border border-teal-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 cursor-default text-left max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{focusedMemory.sticker || '✨'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-500/30 text-[10px] text-teal-300">
                  {focusedMemory.tag}
                </span>
                <span className="text-xs text-teal-400/70 font-mono">
                  {focusedMemory.date}
                </span>
              </div>
              <button
                onClick={() => setFocusedMemory(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="font-serif font-bold text-2xl text-white">
              {focusedMemory.title}
            </h2>

            {memoryPhotosMap[focusedMemory.id] && memoryPhotosMap[focusedMemory.id].length > 0 && (
              <div className="space-y-2 my-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-teal-400 uppercase tracking-wider">
                    Keepsake Photos ({memoryPhotosMap[focusedMemory.id].length})
                  </span>
                  <label className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 hover:bg-teal-900 border border-teal-400/30 text-xs text-teal-200 hover:text-white cursor-pointer transition-colors" title="Upload more photos for this memory">
                    <Upload className="w-3 h-3 text-teal-400" />
                    <span>Upload More</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadPhotos(focusedMemory.id, e.target.files)}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {memoryPhotosMap[focusedMemory.id].map((photoUrl, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative group rounded-xl overflow-hidden border border-teal-500/30 bg-slate-900 aspect-4/3 cursor-pointer"
                      onClick={() => setZoomedPhoto(photoUrl)}
                    >
                      {brokenImages[photoUrl] ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-b from-[#042436] to-[#02131d] text-teal-300">
                          <Camera className="w-6 h-6 mb-1 text-teal-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-mono text-teal-200">
                            {photoUrl.split('/').pop()}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={photoUrl}
                          alt="Memory photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleScrapbookImageError(e, photoUrl)}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm sm:text-base text-slate-100 font-light leading-relaxed">
              {focusedMemory.story}
            </p>

            <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/30">
              <span className="block text-[10px] uppercase tracking-wider text-teal-400/80 font-medium mb-1">
                What Was In My Heart
              </span>
              <p className="font-serif italic text-sm text-teal-100/95 leading-relaxed">
                "{focusedMemory.personalNote}"
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-teal-300/80">
              <button
                onClick={() => toggleLike(focusedMemory.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-950/80 border border-teal-500/30 hover:bg-teal-900 transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${likedMemories[focusedMemory.id] ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{likedMemories[focusedMemory.id] ? 'Cherished in my heart' : 'Cherish this memory'}</span>
              </button>
              <button
                onClick={() => setFocusedMemory(null)}
                className="px-4 py-2 rounded-full bg-teal-400 text-slate-950 font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
              onError={(e) => handleScrapbookImageError(e, zoomedPhoto)}
            />
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#031c2d] border border-teal-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
              <h3 className="font-serif font-bold text-white text-lg sm:text-xl">
                Add To Our Scrapbook
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-4 text-xs">
              <div>
                <label className="block text-teal-200 font-medium mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Midnight Laughter, Our Secret Smile..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-teal-950/70 border border-teal-500/30 text-white placeholder-teal-400/40 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-teal-200 font-medium mb-1">Date / Time</label>
                  <input
                    type="text"
                    placeholder="e.g. August 2026, That Rainy Night..."
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-teal-950/70 border border-teal-500/30 text-white placeholder-teal-400/40 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-teal-200 font-medium mb-1">Tag Category</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value as ScrapbookMemory['tag'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-teal-950/70 border border-teal-500/30 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Sweet Moments">Sweet Moments</option>
                    <option value="Late Nights">Late Nights</option>
                    <option value="Inside Jokes">Inside Jokes</option>
                    <option value="Milestones">Milestones</option>
                    <option value="Little Things">Little Things</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-teal-200 font-medium mb-1">Sticker / Icon</label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {['✨', '💖', '🍨', '🍫', '🥋', '🌙', '💌', '🌸', '📞', '💍', '🫂'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewSticker(emoji)}
                      className={`text-xl p-1.5 rounded-xl transition-all cursor-pointer ${
                        newSticker === emoji ? 'bg-teal-500/30 border border-teal-400 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-teal-200 font-medium mb-1">The Memory / What Happened</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe this little moment in our story..."
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-teal-950/70 border border-teal-500/30 text-white placeholder-teal-400/40 focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-teal-200 font-medium mb-1">Personal Note / How It Felt</label>
                <textarea
                  rows={2}
                  placeholder="What was living in your heart during this moment..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-teal-950/70 border border-teal-500/30 text-white placeholder-teal-400/40 focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold shadow-md cursor-pointer"
                >
                  Save to Scrapbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-950/70 hover:bg-teal-900 border border-teal-500/30 text-xs sm:text-sm text-teal-200 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Back to Home</span>
        </button>
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
    </div>
  );
};
