import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Upload,
  Flower2,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';
import { BouquetPhoto, INITIAL_BOUQUET_PHOTOS } from '../data/photoBouquetData';
import { 
  getAllBouquetPhotos, 
  saveBouquetPhoto, 
  saveAllBouquetPhotos, 
  optimizeImageFile 
} from '../utils/photoStorage';

interface PhotoBouquetProps {
  className?: string;
  onExploreMore?: () => void;
  onNextPage?: () => void;
  onBack?: () => void;
}

// Handcrafted, perfectly balanced 26-bloom bouquet arrangement with generous breathing room
function getBouquetLayout(index: number, total: number) {
  const layouts26 = [
    // --- Layer 1: Top Crown Arc (7 blooms) ---
    { x: 12, y: 12, rot: -18, scale: 0.88, z: 12 },
    { x: 24, y: 8,  rot: -12, scale: 0.90, z: 13 },
    { x: 37, y: 5.5, rot: -6,  scale: 0.92, z: 14 },
    { x: 50, y: 4.5, rot: 0,   scale: 0.95, z: 15 },
    { x: 63, y: 5.5, rot: 6,   scale: 0.92, z: 14 },
    { x: 76, y: 8,  rot: 12,  scale: 0.90, z: 13 },
    { x: 88, y: 12, rot: 18,  scale: 0.88, z: 12 },

    // --- Layer 2: Upper Mid Tier (6 blooms) ---
    { x: 16, y: 20.5, rot: -14, scale: 0.90, z: 16 },
    { x: 29, y: 17,   rot: -8,  scale: 0.92, z: 17 },
    { x: 43, y: 14.5, rot: -3,  scale: 0.94, z: 18 },
    { x: 57, y: 14.5, rot: 3,   scale: 0.94, z: 18 },
    { x: 71, y: 17,   rot: 8,   scale: 0.92, z: 17 },
    { x: 84, y: 20.5, rot: 14,  scale: 0.90, z: 16 },

    // --- Layer 3: Central Heart Tier (5 blooms) ---
    // Bloom 14 (idx 13) is Queen Blossom, the focal heart center!
    { x: 50, y: 28, rot: 0,   scale: 1.25, z: 35 }, // Centerpiece Queen Blossom
    { x: 22, y: 29.5, rot: -10, scale: 0.92, z: 20 },
    { x: 36, y: 27,   rot: -5,  scale: 0.94, z: 22 },
    { x: 64, y: 27,   rot: 5,   scale: 0.94, z: 22 },
    { x: 78, y: 29.5, rot: 10,  scale: 0.92, z: 20 },

    // --- Layer 4: Lower Mid Tier (6 blooms) ---
    { x: 18, y: 39, rot: -12, scale: 0.90, z: 22 },
    { x: 31, y: 38, rot: -6,  scale: 0.92, z: 24 },
    { x: 44, y: 38, rot: -2,  scale: 0.94, z: 25 },
    { x: 56, y: 38, rot: 2,   scale: 0.94, z: 25 },
    { x: 69, y: 38, rot: 6,   scale: 0.92, z: 24 },
    { x: 82, y: 39, rot: 12,  scale: 0.90, z: 22 },

    // --- Layer 5: Base Tier near Silk Bow (2 blooms) ---
    { x: 37, y: 48, rot: -5, scale: 0.92, z: 28 },
    { x: 63, y: 48, rot: 5,  scale: 0.92, z: 28 },
  ];

  if (total === 26 && index < layouts26.length) {
    return layouts26[index];
  }

  // Dynamic fallback layout
  const topCount = Math.ceil(total * 0.32);
  const midCount = Math.floor(total * 0.38);
  const baseCount = total - topCount - midCount;

  if (index < topCount) {
    const progress = topCount > 1 ? index / (topCount - 1) : 0.5;
    const x = 12 + progress * 76;
    const arc = Math.sin(progress * Math.PI) * 8;
    const y = 12 - arc;
    const rot = -18 + progress * 36;
    return { x, y, rot, scale: 0.88, z: 11 };
  } else if (index < topCount + midCount) {
    const subIdx = index - topCount;
    const progress = midCount > 1 ? subIdx / (midCount - 1) : 0.5;
    const x = 20 + progress * 60;
    const isCenter = subIdx === Math.floor(midCount / 2);
    const y = 26 + (isCenter ? 3 : 0);
    const rot = -10 + progress * 20;
    return { x, y, rot, scale: isCenter ? 1.2 : 0.95, z: isCenter ? 30 : 18 };
  } else {
    const subIdx = index - (topCount + midCount);
    const progress = baseCount > 1 ? subIdx / (baseCount - 1) : 0.5;
    const x = 30 + progress * 40;
    const y = 44 + (subIdx % 2 === 0 ? 0 : 4);
    const rot = -7 + progress * 14;
    return { x, y, rot, scale: 0.92, z: 22 };
  }
}

// Decorative botanical filler blossoms tucked into bouquet foliage
const BOTANICAL_ACCENTS = [
  { x: 6, y: 19, icon: '🌿', label: 'Silver Eucalyptus', delay: '0s' },
  { x: 94, y: 19, icon: '🌿', label: 'Silver Eucalyptus', delay: '0.4s' },
  { x: 28, y: 7.5, icon: '✨', label: "Baby's Breath Spray", delay: '0.8s' },
  { x: 72, y: 7.5, icon: '✨', label: "Baby's Breath Spray", delay: '1.2s' },
  { x: 50, y: 1.2, icon: '🪷', label: 'Crown Lily Petal', delay: '0.2s' },
  { x: 14, y: 15.5, icon: '🌻', label: 'Sunflower Bud', delay: '0.6s' },
  { x: 86, y: 15.5, icon: '🌻', label: 'Sunflower Bud', delay: '1.0s' },
  { x: 20, y: 26.5, icon: '✨', label: 'Gypsophila Whispers', delay: '1.4s' },
  { x: 80, y: 26.5, icon: '✨', label: 'Gypsophila Whispers', delay: '0.3s' },
  { x: 50, y: 20.5, icon: '🌹', label: 'Blush Rosebud', delay: '0.7s' },
  { x: 34, y: 35, icon: '🌼', label: 'Daisy Floret', delay: '1.1s' },
  { x: 66, y: 35, icon: '🌼', label: 'Daisy Floret', delay: '0.5s' },
  { x: 50, y: 44.5, icon: '🌸', label: 'Sweet Cherry Blossom', delay: '0.9s' },
  { x: 22, y: 46, icon: '🍃', label: 'Emerald Fern', delay: '1.3s' },
];

/**
 * Generates an exhaustive list of candidate URLs for a given photo index.
 * Solves Netlify / Linux case-sensitivity, file format variations (.jpg, .JPG, .jpeg, .png, .webp),
 * zero-padded names, Windows double extensions (1.jpg.jpg), and root vs /photos/ folder locations.
 */
export function getCandidateUrls(num: number): string[] {
  const padded = num < 10 ? `0${num}` : `${num}`;
  return [
    `/photos/${num}.jpg`,
    `/photos/${num}.JPG`,
    `/photos/${num}.jpeg`,
    `/photos/${num}.JPEG`,
    `/photos/${num}.png`,
    `/photos/${num}.PNG`,
    `/photos/${num}.webp`,
    `/photos/${num}.WEBP`,
    `/photos/${num}.jpg.jpg`,
    `/photos/${num}.JPG.jpg`,
    `/photos/${padded}.jpg`,
    `/photos/${padded}.JPG`,
    `/photos/${padded}.jpeg`,
    `/photos/${padded}.png`,
    `/${num}.jpg`,
    `/${num}.JPG`,
    `/${num}.jpeg`,
    `/${num}.JPEG`,
    `/${num}.png`,
    `/${num}.PNG`,
    `/${num}.webp`,
    `/${padded}.jpg`,
    `/${padded}.JPG`,
    `/${padded}.jpeg`,
    `/${padded}.png`,
    `photos/${num}.jpg`,
    `photos/${num}.JPG`,
    `photos/${num}.jpeg`,
    `photos/${num}.png`,
    `${num}.jpg`,
    `${num}.JPG`,
  ];
}

export const PhotoBouquet: React.FC<PhotoBouquetProps> = ({ className = '', onBack, onNextPage }) => {
  const [photos] = useState<BouquetPhoto[]>(INITIAL_BOUQUET_PHOTOS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'bouquet' | 'grid'>('bouquet');
  const [localPhotoUploads, setLocalPhotoUploads] = useState<Record<string, string>>({});
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  const [imgFallbackMap, setImgFallbackMap] = useState<Record<string, string>>({});
  const [attemptIndexMap, setAttemptIndexMap] = useState<Record<string, number>>({});
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadSlotRef = useRef<string | null>(null);

  // Load custom user uploads from IndexedDB
  useEffect(() => {
    let isMounted = true;
    getAllBouquetPhotos().then((saved) => {
      if (isMounted && saved && Object.keys(saved).length > 0) {
        setLocalPhotoUploads(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Proactive candidate pre-probing on mount:
  // Tests each photo's potential file paths in background so correct Netlify paths resolve immediately!
  useEffect(() => {
    let isMounted = true;
    photos.forEach((p, idx) => {
      const num = idx + 1;
      const candidates = getCandidateUrls(num);
      let resolved = false;

      const testCandidate = (cIdx: number) => {
        if (!isMounted || resolved || cIdx >= candidates.length) return;
        const candidateUrl = candidates[cIdx];
        const testImg = new Image();
        testImg.onload = () => {
          if (!isMounted || resolved) return;
          resolved = true;
          setImgFallbackMap((prev) => ({ ...prev, [p.id]: candidateUrl }));
          setImgErrorMap((prev) => ({ ...prev, [p.id]: false }));
        };
        testImg.onerror = () => {
          if (!isMounted || resolved) return;
          testCandidate(cIdx + 1);
        };
        testImg.src = candidateUrl;
      };

      testCandidate(0);
    });

    return () => {
      isMounted = false;
    };
  }, [photos]);

  // Keyboard navigation for modal viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos.length]);

  // Cycles through candidate URLs whenever an image fails to load
  const handleImageError = (photoId: string, bloomNum: number) => {
    const currentIdx = attemptIndexMap[photoId] ?? 0;
    const candidates = getCandidateUrls(bloomNum);
    const nextIdx = currentIdx + 1;

    if (nextIdx < candidates.length) {
      setAttemptIndexMap((prev) => ({ ...prev, [photoId]: nextIdx }));
      setImgFallbackMap((prev) => ({ ...prev, [photoId]: candidates[nextIdx] }));
    } else {
      // Only set error after exhausting all candidate variations
      setImgErrorMap((prev) => ({ ...prev, [photoId]: true }));
    }
  };

  // Single slot photo replacement
  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetSlotId = activeUploadSlotRef.current;
    if (!file || !targetSlotId) return;

    setIsProcessingPhoto(true);
    try {
      const optimized = await optimizeImageFile(file);
      if (optimized) {
        const updated = { ...localPhotoUploads, [targetSlotId]: optimized };
        setLocalPhotoUploads(updated);
        setImgErrorMap((prev) => ({ ...prev, [targetSlotId]: false }));
        await saveBouquetPhoto(targetSlotId, optimized);
      }
    } catch (err) {
      console.error('Failed to optimize photo:', err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  // Batch multi-photo upload with natural sorting and persistence
  const handleBatchFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsProcessingPhoto(true);
    setBatchProgress(`Saving ${fileList.length} photos...`);
    const newMap: Record<string, string> = { ...localPhotoUploads };

    // Naturally sort files by number (1.jpg, 2.jpg ... 26.jpg)
    const filesArray = Array.from(fileList).sort((a, b) => {
      const matchA = a.name.match(/(\d+)/);
      const matchB = b.name.match(/(\d+)/);
      if (matchA && matchB) {
        return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|gif)$/i)) continue;

      // Extract number from filename (e.g., 1.jpg -> 1, 26.png -> 26)
      const numMatch = file.name.match(/(\d+)/);
      let targetSlotId: string | null = null;
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        if (num >= 1 && num <= photos.length) {
          targetSlotId = `bouquet-photo-${num}`;
        }
      }

      if (!targetSlotId) {
        const emptySlot = photos.find((p) => !newMap[p.id]);
        targetSlotId = emptySlot ? emptySlot.id : (photos[i % photos.length]?.id || `bouquet-photo-${i + 1}`);
      }

      setBatchProgress(`Saving photo ${i + 1} of ${filesArray.length}...`);

      try {
        const optimized = await optimizeImageFile(file);
        if (optimized && targetSlotId) {
          newMap[targetSlotId] = optimized;
        }
      } catch (err) {
        console.error('Error optimizing batch file:', file.name, err);
      }
    }

    setLocalPhotoUploads(newMap);
    // Reset any previous error states for uploaded slots
    setImgErrorMap((prev) => {
      const updated = { ...prev };
      Object.keys(newMap).forEach((id) => {
        updated[id] = false;
      });
      return updated;
    });

    await saveAllBouquetPhotos(newMap);
    setIsProcessingPhoto(false);
    setBatchProgress(null);
    e.target.value = '';
  };

  const triggerUploadForSlot = (slotId: string) => {
    activeUploadSlotRef.current = slotId;
    fileInputRef.current?.click();
  };

  const getDisplayPhoto = (photo: BouquetPhoto | null) => {
    if (!photo) return { src: '', hasPhoto: false, isError: false };
    const custom = localPhotoUploads[photo.id];
    if (custom) return { src: custom, hasPhoto: true, isError: false };
    if (imgErrorMap[photo.id]) return { src: '', hasPhoto: false, isError: true };
    const src = imgFallbackMap[photo.id] || photo.image;
    return { src, hasPhoto: Boolean(src && src.trim().length > 0), isError: false };
  };

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;
  const selectedPhotoDisplay = getDisplayPhoto(selectedPhoto);

  return (
    <section className={`relative w-full max-w-5xl mx-auto ${className}`}>
      {/* Hidden file input for single slot photo replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSingleFileChange}
      />

      {/* Hidden file input for batch multi-photo upload */}
      <input
        ref={batchFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleBatchFilesChange}
      />

      <div className="relative glass-panel rounded-3xl p-4 sm:p-7 md:p-9 border border-teal-400/30 overflow-hidden shadow-2xl bg-gradient-to-b from-[#032333]/75 via-[#021824]/85 to-[#02111c]/95">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-teal-400/10 blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-[95px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-300/10 blur-[95px] pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2.5 mb-5 sm:mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-950/70 border border-teal-400/30 text-xs text-teal-300 mb-0.5 shadow-sm">
            <Flower2 className="w-3.5 h-3.5 text-teal-300" />
            <span className="font-medium tracking-wide">A Keepsake Just For You</span>
            <Sparkles className="w-3 h-3 text-teal-300" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight drop-shadow-md flex items-center justify-center gap-2 flex-wrap">
            <span>Just For You</span>
            <span className="text-teal-300">💐</span>
          </h2>

          <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl mx-auto font-light leading-relaxed">
            Real flowers wilt and fade, but these blooms will stay forever fresh. Filled with sweet compliments for you — tap any bloom to open it.
          </p>

          {/* View Mode Switcher + Add Photos */}
          <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center p-1 rounded-full bg-teal-950/80 border border-teal-500/30">
              <button
                onClick={() => setViewMode('bouquet')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  viewMode === 'bouquet'
                    ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                <Flower2 className="w-3.5 h-3.5" />
                <span>Bouquet View</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All 26 Photos Grid</span>
              </button>
            </div>

            <button
              onClick={() => batchFileInputRef.current?.click()}
              disabled={isProcessingPhoto}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-xs text-teal-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              title="Add or replace photos"
            >
              <Upload className="w-3.5 h-3.5 text-teal-300" />
              <span>{isProcessingPhoto ? 'Optimizing & Saving...' : 'Add / Replace Photos'}</span>
            </button>

            {batchProgress && (
              <span className="text-xs text-teal-300 font-mono animate-pulse w-full text-center">
                {batchProgress}
              </span>
            )}
          </div>
        </div>

        {/* VIEW 1: BOUQUET FLORAL STAGE */}
        {viewMode === 'bouquet' ? (
          <div className="relative w-full max-w-[660px] mx-auto aspect-[4/4.6] sm:aspect-[4/4.3] flex items-center justify-center my-2 select-none">
            {/* Bouquet Wrapper, Stems & Foliage SVG */}
            <svg
              viewBox="0 0 500 560"
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="wrapperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#042c3d" stopOpacity="0.9" />
                  <stop offset="45%" stopColor="#0b3b4f" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#021a24" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="ribbonSilk" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="30%" stopColor="#5eead4" />
                  <stop offset="70%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
                <linearGradient id="ribbonDeep" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="goldWrapTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fde047" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#5eead4" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="stemColor" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5eead4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Radiating Floral Stems */}
              <g stroke="url(#stemColor)" strokeWidth="2.2" strokeLinecap="round" opacity="0.65">
                <path d="M250 370 Q180 220 50 80" />
                <path d="M250 370 Q195 210 115 55" />
                <path d="M250 370 Q215 190 185 38" />
                <path d="M250 370 Q235 180 250 30" />
                <path d="M250 370 Q265 180 315 38" />
                <path d="M250 370 Q285 190 385 55" />
                <path d="M250 370 Q305 210 450 80" />
                <path d="M250 370 Q180 240 75 130" />
                <path d="M250 370 Q200 230 145 110" />
                <path d="M250 370 Q225 220 215 95" />
                <path d="M250 370 Q255 220 285 95" />
                <path d="M250 370 Q280 230 355 110" />
                <path d="M250 370 Q300 240 425 130" />
                <path d="M250 370 Q240 250 250 175" />
                <path d="M250 370 Q200 280 110 190" />
                <path d="M250 370 Q215 270 180 175" />
                <path d="M250 370 Q270 270 320 175" />
                <path d="M250 370 Q285 280 390 190" />
                <path d="M250 370 Q205 310 140 245" />
              </g>

              {/* Decorative Leaves */}
              <g fill="url(#leafGrad)" opacity="0.6">
                <path d="M120 140 C100 120 90 90 115 80 C130 100 135 130 120 140 Z" />
                <path d="M380 140 C400 120 410 90 385 80 C370 100 365 130 380 140 Z" />
                <path d="M170 80 C155 60 150 35 175 30 C185 50 185 70 170 80 Z" />
                <path d="M330 80 C345 60 350 35 325 30 C315 50 315 70 330 80 Z" />
                <path d="M80 210 C60 200 45 180 65 170 C80 185 85 205 80 210 Z" />
                <path d="M420 210 C440 200 455 180 435 170 C420 185 415 205 420 210 Z" />
              </g>

              {/* Bouquet Wrapping Paper */}
              <g id="bouquetWrapper">
                <path
                  d="M110 260 L230 520 C240 535 260 535 270 520 L390 260 C320 295 180 295 110 260 Z"
                  fill="url(#wrapperGradient)"
                  stroke="url(#goldWrapTrim)"
                  strokeWidth="1.2"
                />
                <path
                  d="M170 360 Q240 410 255 512"
                  stroke="#5eead4"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  fill="none"
                />
                <path
                  d="M330 360 Q260 410 245 512"
                  stroke="#5eead4"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  fill="none"
                />
                <g stroke="#0d9488" strokeWidth="3" strokeLinecap="round" opacity="0.8">
                  <line x1="240" y1="515" x2="236" y2="545" />
                  <line x1="246" y1="517" x2="245" y2="548" />
                  <line x1="253" y1="517" x2="255" y2="548" />
                  <line x1="259" y1="515" x2="263" y2="544" />
                </g>
              </g>

              {/* Silk Ribbon Bow */}
              <g id="ribbonBow">
                <path
                  d="M246 375 C235 400 215 440 205 480 C202 495 210 505 218 490 C228 460 244 410 248 385 Z"
                  fill="url(#ribbonDeep)"
                  opacity="0.9"
                />
                <path
                  d="M254 375 C265 400 285 440 295 480 C298 495 290 505 282 490 C272 460 256 410 252 385 Z"
                  fill="url(#ribbonDeep)"
                  opacity="0.9"
                />
                <path
                  d="M247 378 C240 405 228 435 220 465 C226 455 235 425 249 385 Z"
                  fill="url(#ribbonSilk)"
                />
                <path
                  d="M253 378 C260 405 272 435 280 465 C274 445 265 425 251 385 Z"
                  fill="url(#ribbonSilk)"
                />
                <path
                  d="M250 375 C235 360 195 350 190 370 C185 388 220 390 250 378 Z"
                  fill="url(#ribbonSilk)"
                  stroke="#99f6e4"
                  strokeWidth="0.8"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                />
                <path
                  d="M250 375 C265 360 305 350 310 370 C315 388 280 390 250 378 Z"
                  fill="url(#ribbonSilk)"
                  stroke="#99f6e4"
                  strokeWidth="0.8"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                />
                <ellipse
                  cx="250"
                  cy="376"
                  rx="8"
                  ry="7"
                  fill="#5eead4"
                  stroke="#0f766e"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.5))"
                />
                <ellipse
                  cx="248.5"
                  cy="374.5"
                  rx="3.5"
                  ry="2"
                  fill="#ffffff"
                  opacity="0.75"
                />
              </g>
            </svg>

            {/* Decorative Botanical Filler Blooms & Accents */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {BOTANICAL_ACCENTS.map((botanical, bIdx) => (
                <div
                  key={`botanical-${bIdx}`}
                  style={{
                    left: `${botanical.x}%`,
                    top: `${botanical.y}%`,
                    animationDelay: botanical.delay,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity filter drop-shadow-[0_0_8px_rgba(94,234,212,0.4)]"
                  title={botanical.label}
                >
                  <span className="text-xs sm:text-sm md:text-base animate-pulse">
                    {botanical.icon}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive Photo Blooms (26 Blooms) */}
            <div className="absolute inset-0 w-full h-full">
              {photos.map((photo, idx) => {
                const layout = getBouquetLayout(idx, photos.length);
                const display = getDisplayPhoto(photo);
                const hasPhoto = display.hasPhoto;
                const isHovered = hoveredIndex === idx;
                const isQueenBlossom = idx === 13; // Bloom 14 Centerpiece

                return (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedIndex(idx)}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      left: `${layout.x}%`,
                      top: `${layout.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layout.rot}deg) scale(${
                        isHovered ? layout.scale * 1.2 : layout.scale
                      })`,
                      zIndex: isHovered ? 50 : layout.z,
                      transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                    }}
                    className={`group absolute cursor-pointer focus:outline-none rounded-full p-1 sm:p-1.5 transition-all ${
                      isHovered
                        ? 'shadow-[0_0_32px_rgba(45,212,191,0.85)] ring-2 ring-teal-300'
                        : isQueenBlossom
                        ? 'shadow-[0_0_25px_rgba(253,224,71,0.5)] ring-1 ring-amber-300/60'
                        : 'shadow-[0_6px_18px_rgba(0,18,25,0.7)]'
                    }`}
                    aria-label={`Photo Bloom ${idx + 1}: ${photo.caption}`}
                    title={`${photo.caption} — Tap to view photo`}
                  >
                    <div
                      className={`relative ${
                        isQueenBlossom
                          ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 bg-gradient-to-tr from-amber-500/50 via-teal-300/70 to-white/90 border-2 border-amber-300'
                          : 'w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-gradient-to-tr from-teal-500/40 via-cyan-300/60 to-white/70 border border-teal-200/60'
                      } rounded-full p-0.5 sm:p-1 shadow-inner flex items-center justify-center`}
                    >
                      <div className="absolute -inset-1 rounded-full border border-teal-400/25 pointer-events-none group-hover:border-teal-300/70 group-hover:scale-105 transition-all" />

                      <div className="relative w-full h-full rounded-full overflow-hidden bg-[#031c28] border border-teal-300/30 flex items-center justify-center">
                        {hasPhoto ? (
                          <img
                            src={display.src}
                            alt={photo.altText || photo.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={() => handleImageError(photo.id, idx + 1)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-0.5 bg-gradient-to-b from-[#063042] to-[#021824] text-teal-200">
                            <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-300 mb-0.5 group-hover:scale-110 transition-transform" />
                            <span className="text-[7px] sm:text-[8px] font-semibold text-teal-100 tracking-wider">
                              Bloom {idx + 1}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                      </div>

                      {/* Flower Badge */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full ${
                          isQueenBlossom ? 'bg-amber-950 border-amber-400' : 'bg-teal-950 border-teal-400/60'
                        } border flex items-center justify-center shadow-md text-[8px] sm:text-[10px]`}
                      >
                        {photo.flowerEmoji || '🌸'}
                      </div>
                    </div>

                    {/* Compliment Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-teal-950/98 border border-teal-300/70 text-[10.5px] sm:text-xs text-teal-100 px-3 py-1 rounded-full shadow-[0_4px_24px_rgba(45,212,191,0.5)] pointer-events-none animate-fadeIn z-50 flex items-center gap-1.5 backdrop-blur-md">
                        <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                        <span className="font-semibold text-white tracking-wide">{photo.caption}</span>
                        <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400 shrink-0" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW 2: FULL 26 PHOTOS GRID (EVERY PHOTO VISIBLE IN FULL GLORY) */
          <div className="my-4 space-y-4">
            <div className="text-center text-xs text-teal-300/70 mb-2">
              Showing all 26 photos with compliments — tap any photo to view in high resolution
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {photos.map((photo, idx) => {
                const display = getDisplayPhoto(photo);
                const hasPhoto = display.hasPhoto;
                const isQueenBlossom = idx === 13;

                return (
                  <div
                    key={`grid-${photo.id}`}
                    onClick={() => setSelectedIndex(idx)}
                    className={`group relative rounded-2xl overflow-hidden border ${
                      isQueenBlossom
                        ? 'border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)] bg-[#042436]'
                        : 'border-teal-500/30 hover:border-teal-400/70 shadow-lg bg-[#021825]'
                    } cursor-pointer transition-all hover:-translate-y-1`}
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-square w-full bg-[#01111a] overflow-hidden">
                      {hasPhoto ? (
                        <img
                          src={display.src}
                          alt={photo.altText || photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={() => handleImageError(photo.id, idx + 1)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-teal-300/80 bg-gradient-to-b from-[#063042] to-[#021824]">
                          <Camera className="w-8 h-8 text-teal-400/70 mb-1" />
                          <span className="text-xs font-mono text-teal-200">Bloom {idx + 1}</span>
                          <span className="text-[10px] text-teal-400/60">Tap to upload</span>
                        </div>
                      )}

                      {/* Number Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-teal-400/30 text-[10px] font-mono text-teal-300 flex items-center gap-1">
                        <span>{photo.flowerEmoji || '🌸'}</span>
                        <span>#{idx + 1}</span>
                      </div>

                      {/* Queen Tag */}
                      {isQueenBlossom && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                          👑 Queen
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-3 space-y-1 bg-gradient-to-b from-[#021a29] to-[#01111c]">
                      <h4 className="font-serif font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-teal-300 transition-colors">
                        {photo.caption}
                      </h4>
                      {photo.date && (
                        <div className="flex items-center gap-1 text-[11px] text-teal-400/80 font-mono">
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{photo.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Romantic Bottom Note */}
        <div className="mt-4 pt-4 border-t border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-teal-300/80">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-red-500 text-red-500 shrink-0" />
            <span>
              Tap any bloom to open your photo and read what is in my heart.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-teal-400/80 bg-teal-950/70 px-3 py-1 rounded-full border border-teal-500/25">
              Hand-Tied With Love
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Footer - Back to Home button */}
      {(onBack || onNextPage) && (
        <div className="flex items-center justify-center pt-6">
          <button
            onClick={onBack || onNextPage}
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_28px_rgba(45,212,191,0.6)] transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-slate-950" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Full Photo Modal Viewer */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#021824] border border-teal-400/40 rounded-3xl shadow-[0_0_60px_rgba(20,184,166,0.3)] overflow-hidden flex flex-col animate-scaleUp max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#01111a] border-b border-teal-500/25 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-lg">
                  {selectedPhoto.flowerEmoji || '🌸'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-white text-base sm:text-lg leading-tight">
                      {selectedPhoto.caption}
                    </h3>
                    {selectedPhoto.flowerType && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-400/30 text-[10px] text-teal-300 font-mono">
                        {selectedPhoto.flowerType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-teal-300/70 mt-0.5">
                    {selectedPhoto.date && (
                      <span className="flex items-center gap-1 font-mono text-teal-400">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {selectedPhoto.date}
                      </span>
                    )}
                    <span>•</span>
                    <span className="font-mono">
                      Flower {(selectedIndex ?? 0) + 1} of {photos.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerUploadForSlot(selectedPhoto.id)}
                  className="px-3 py-1 rounded-full bg-teal-950/80 hover:bg-teal-900 border border-teal-400/30 text-xs text-teal-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Upload or change photo for this flower"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Replace Photo</span>
                </button>
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close viewer (or press Escape)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Image Area */}
            <div className="relative flex-1 min-h-[260px] sm:min-h-[380px] max-h-[58vh] bg-[#010c14] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
              {selectedPhotoDisplay.hasPhoto ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selectedPhotoDisplay.src}
                    alt={selectedPhoto.altText || selectedPhoto.caption}
                    className="max-h-[54vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-teal-500/20"
                    onError={() => handleImageError(selectedPhoto.id, (selectedIndex ?? 0) + 1)}
                  />
                </div>
              ) : (
                <div className="w-full max-w-md p-6 rounded-2xl bg-teal-950/40 border border-teal-400/25 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-300">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    {selectedPhoto.flowerType && (
                      <span className="text-xs font-mono uppercase tracking-widest text-teal-400">
                        {selectedPhoto.flowerType}
                      </span>
                    )}
                    <h4 className="font-serif text-lg text-white font-semibold">
                      {selectedPhoto.caption}
                    </h4>
                    <p className="text-xs text-teal-200/80 max-w-sm mx-auto leading-relaxed">
                      Tap below to add your photo to this bloom.
                    </p>
                  </div>
                  <button
                    onClick={() => triggerUploadForSlot(selectedPhoto.id)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_20px_rgba(45,212,191,0.35)] cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}

              {/* Prev / Next Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                  );
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#021824]/80 hover:bg-teal-950 border border-teal-400/30 text-teal-200 hover:text-white flex items-center justify-center shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Previous photo (Left arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) =>
                    prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                  );
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#021824]/80 hover:bg-teal-950 border border-teal-400/30 text-teal-200 hover:text-white flex items-center justify-center shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Next photo (Right arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Note & Heartfelt message */}
            {selectedPhoto.personalMessage && (
              <div className="p-4 sm:p-5 bg-[#02131d] border-t border-teal-500/20 shrink-0 space-y-2">
                <div className="bg-teal-950/40 border border-teal-500/20 rounded-2xl p-3.5 sm:p-4 text-teal-100 text-xs sm:text-sm leading-relaxed font-light shadow-inner">
                  <p className="italic font-serif">
                    "{selectedPhoto.personalMessage}"
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-teal-400/60 pt-0.5">
                  <span>Use ← and → arrows to move between flowers</span>
                  <span>Press Esc to close</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
