import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Maximize2,
  Minimize2,
  ChevronDown,
  Upload,
  Plus,
  Trash2,
  Disc,
  Sparkles,
  ListMusic,
  Heart,
  HardDrive
} from 'lucide-react';
import { INITIAL_PRESET_TRACKS, TrackItem } from '../data/defaultTracks';
import {
  saveAudioFile,
  getAllStoredTracks,
  deleteStoredTrack,
  StoredAudioTrack
} from '../utils/audioStorage';
import { generateRomanticTrack } from '../utils/romanticMelodyGenerator';

// Helper to format seconds as mm:ss
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const MusicPlayer: React.FC = () => {
  // Persistent expanded/minimized UI state
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kittu_player_expanded') === 'true';
    } catch {
      return false;
    }
  });

  // Track list (combines built-in presets and user-added custom tracks)
  const [playlist, setPlaylist] = useState<TrackItem[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const savedVol = localStorage.getItem('kittu_player_volume');
      return savedVol ? parseFloat(savedVol) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [activeTab, setActiveTab] = useState<'now_playing' | 'playlist'>('now_playing');
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const [trackErrorMap, setTrackErrorMap] = useState<Record<string, boolean>>({});

  // Hidden audio element ref & file input ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const generatedBlobUrls = useRef<Map<string, string>>(new Map());

  // Save expanded preference
  useEffect(() => {
    try {
      localStorage.setItem('kittu_player_expanded', isExpanded ? 'true' : 'false');
    } catch {
      // safe
    }
  }, [isExpanded]);

  // Save volume preference
  useEffect(() => {
    try {
      localStorage.setItem('kittu_player_volume', volume.toString());
    } catch {
      // safe
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load initial playlist & stored custom tracks from IndexedDB
  useEffect(() => {
    let isMounted = true;

    async function initTracks() {
      // 1. Generate URLs for preset generator tracks
      const presetsWithUrls: TrackItem[] = INITIAL_PRESET_TRACKS.map((preset) => {
        let url = preset.audioUrl;
        if (!url && preset.generatorType) {
          try {
            const { blob } = generateRomanticTrack(preset.generatorType);
            url = URL.createObjectURL(blob);
            generatedBlobUrls.current.set(preset.id, url);
          } catch (e) {
            console.error('Failed generating melody:', e);
          }
        }
        return {
          ...preset,
          audioUrl: url
        };
      });

      // 2. Load custom user downloaded tracks from IndexedDB
      try {
        const stored = await getAllStoredTracks();
        const customTrackItems: TrackItem[] = stored.map((st: StoredAudioTrack) => {
          const blobUrl = URL.createObjectURL(st.fileBlob);
          generatedBlobUrls.current.set(st.id, blobUrl);
          return {
            id: st.id,
            title: st.title,
            artist: st.artist,
            album: 'Downloaded Songs',
            duration: st.duration,
            coverColor: 'from-pink-500 to-rose-700',
            audioUrl: blobUrl,
            isCustom: true
          };
        });

        if (isMounted) {
          const combined = [...presetsWithUrls, ...customTrackItems];
          setPlaylist(combined);
        }
      } catch (err) {
        console.error('Error loading stored tracks:', err);
        if (isMounted) {
          setPlaylist(presetsWithUrls);
        }
      }
    }

    initTracks();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Update audio source when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack || !currentTrack.audioUrl) return;

    const audio = audioRef.current;
    const wasPlaying = isPlaying;

    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
      if (wasPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, currentTrack?.audioUrl]);

  // HTML5 Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setPlaylist((prev) =>
          prev.map((t, idx) =>
            idx === currentTrackIndex && (!t.duration || t.duration === 0)
              ? { ...t, duration: Math.round(audio.duration) }
              : t
          )
        );
      }
      if (currentTrack) {
        setTrackErrorMap((prev) => ({ ...prev, [currentTrack.id]: false }));
      }
    };

    const handleAudioError = () => {
      const currentSrc = audio.src;
      if (currentSrc.includes('/songs/')) {
        const filename = currentSrc.split('/songs/').pop();
        if (filename && !currentSrc.endsWith('/' + filename)) {
          audio.src = '/' + filename;
          audio.load();
          return;
        }
      }
      setIsPlaying(false);
      if (currentTrack) {
        setTrackErrorMap((prev) => ({ ...prev, [currentTrack.id]: true }));
      }
      setImportNotification(
        `File not found for ${currentTrack?.title || 'this track'}. Place ${currentTrackIndex + 1}.mp3 in public/songs/ or tap "Add Songs".`
      );
      setTimeout(() => setImportNotification(null), 5000);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [repeatMode, playlist.length, currentTrackIndex, currentTrack]);

  // Play / Pause toggle
  const togglePlayPause = () => {
    if (playlist.length === 0) {
      fileInputRef.current?.click();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn('Playback prevented or file missing:', err);
        setIsPlaying(false);
        if (currentTrack) {
          setTrackErrorMap((prev) => ({ ...prev, [currentTrack.id]: true }));
        }
        setImportNotification(
          `Place ${currentTrack?.title || 'song'} into public/songs/ folder or click "Add Songs" to upload.`
        );
        setTimeout(() => setImportNotification(null), 5000);
      });
    }
  };

  // Next track
  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (isShuffle && playlist.length > 1) {
      let nextIdx = Math.floor(Math.random() * playlist.length);
      while (nextIdx === currentTrackIndex) {
        nextIdx = Math.floor(Math.random() * playlist.length);
      }
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  }, [playlist.length, isShuffle, currentTrackIndex]);

  // Previous track
  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentTrackIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
  };

  // Seeking on progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Toggle Repeat Mode
  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  // File Upload Handlers (for user downloading songs from their playlist)
  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsImporting(true);

    const addedTracks: TrackItem[] = [];
    let count = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac)$/i)) {
        continue;
      }

      try {
        const stored = await saveAudioFile(file);
        const blobUrl = URL.createObjectURL(stored.fileBlob);
        generatedBlobUrls.current.set(stored.id, blobUrl);

        addedTracks.push({
          id: stored.id,
          title: stored.title,
          artist: stored.artist,
          album: 'Downloaded Songs',
          duration: stored.duration,
          coverColor: 'from-pink-500 to-rose-700',
          audioUrl: blobUrl,
          isCustom: true
        });
        count++;
      } catch (err) {
        console.error('Error saving audio file:', err);
      }
    }

    if (addedTracks.length > 0) {
      setPlaylist((prev) => [...addedTracks, ...prev]);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      if (audioRef.current && addedTracks[0].audioUrl) {
        audioRef.current.src = addedTracks[0].audioUrl;
        audioRef.current.play().catch(() => {});
      }
      setImportNotification(`Added ${count} song${count > 1 ? 's' : ''} to player!`);
      setTimeout(() => setImportNotification(null), 3500);
    }

    setIsImporting(false);
  };

  // Delete custom track
  const handleDeleteCustomTrack = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    try {
      await deleteStoredTrack(trackId);
      const url = generatedBlobUrls.current.get(trackId);
      if (url) {
        URL.revokeObjectURL(url);
        generatedBlobUrls.current.delete(trackId);
      }

      setPlaylist((prev) => {
        const filtered = prev.filter((t) => t.id !== trackId);
        return filtered;
      });

      if (currentTrack?.id === trackId) {
        setCurrentTrackIndex(0);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Failed to delete track:', err);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  return (
    <>
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} preload="auto" />

      {/* Hidden File Input for Adding Downloaded Songs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFilesAdded(e.target.files)}
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac"
        className="hidden"
      />

      {/* ============================================================== */}
      {/* FLOATING MINIMIZED CAPSULE (Persistent across all sections)    */}
      {/* ============================================================== */}
      {!isExpanded && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-[60] animate-fadeIn">
          <div className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#02101e]/95 border border-teal-400/40 hover:border-teal-300 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-teal-500/25">
            {/* Spinning Vinyl Cover Art */}
            <button
              onClick={() => setIsExpanded(true)}
              className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-md cursor-pointer bg-gradient-to-tr from-teal-600 to-cyan-400"
              title="Click to open full player"
            >
              <Disc
                className={`w-5 h-5 text-slate-950 ${
                  isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                }`}
              />
            </button>

            {/* Track Info (Click to expand) */}
            <div
              onClick={() => setIsExpanded(true)}
              className="cursor-pointer max-w-[130px] sm:max-w-[170px] overflow-hidden select-none"
            >
              <p className="text-xs font-semibold text-teal-100 truncate">
                {currentTrack?.title || 'Our Music Player'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 bg-teal-400 h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                    <span className="w-0.5 bg-teal-400 h-2 animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
                    <span className="w-0.5 bg-teal-400 h-1.5 animate-[pulse_0.7s_ease-in-out_infinite_0.4s]" />
                  </div>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />
                )}
                <span className="text-[10px] text-teal-300/70 truncate">
                  {currentTrack?.artist || (playlist.length === 0 ? 'Click + to add songs' : 'Ready to play')}
                </span>
              </div>
            </div>

            {/* Compact Quick Play/Pause Control */}
            <button
              onClick={togglePlayPause}
              className="w-7 h-7 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow cursor-pointer shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Quick Add Song Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-300/70 hover:text-teal-200 transition-colors p-1 cursor-pointer shrink-0"
              title="Add your downloaded songs"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Expand Full Player Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="text-teal-300/70 hover:text-white transition-colors p-1 cursor-pointer shrink-0"
              title="Expand player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EXPANDED SPOTIFY-STYLE DRAWER / FLOATING WINDOW                */}
      {/* ============================================================== */}
      {isExpanded && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="fixed bottom-4 right-3 sm:right-6 z-[60] w-[calc(100vw-1.5rem)] sm:w-[390px] max-h-[85vh] flex flex-col rounded-3xl bg-[#031525]/98 border border-teal-500/40 shadow-2xl backdrop-blur-2xl text-slate-100 overflow-hidden animate-fadeIn"
          style={{ boxShadow: '0 20px 50px -10px rgba(13, 148, 136, 0.35)' }}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-teal-500/20 bg-[#02101e]/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300">
                <Music className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                  Our Music Player
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-teal-900/60 border border-teal-500/30 text-teal-300">
                    Offline / Standalone
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Add Songs Trigger */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30 cursor-pointer transition-all"
                title="Add downloaded songs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Songs</span>
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimize player"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Import Notification Banner */}
          {importNotification && (
            <div className="bg-teal-500 text-slate-950 text-xs px-4 py-1.5 font-medium flex items-center justify-between animate-fadeIn">
              <span>{importNotification}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Tab Navigation: Now Playing vs Playlist */}
          <div className="px-5 pt-3 pb-1 flex items-center gap-4 text-xs font-medium border-b border-teal-500/10">
            <button
              onClick={() => setActiveTab('now_playing')}
              className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'now_playing'
                  ? 'border-teal-400 text-teal-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Now Playing
            </button>
            <button
              onClick={() => setActiveTab('playlist')}
              className={`pb-2 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'playlist'
                  ? 'border-teal-400 text-teal-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Playlist ({playlist.length})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'now_playing' ? (
              playlist.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-inner">
                    <Music className="w-10 h-10 text-teal-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-white">No Songs in Player</h4>
                    <p className="text-xs text-teal-300/80 max-w-xs mx-auto leading-relaxed">
                      Download songs from your playlist and add them here to play offline anytime.
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs shadow-lg shadow-teal-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Downloaded Songs</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Now Playing Album Art / Vinyl Presentation */}
                <div className="relative mx-auto w-44 h-44 sm:w-48 sm:h-48 rounded-2xl p-1 bg-gradient-to-br from-teal-400/30 via-slate-800 to-teal-900/40 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#041a2b] to-[#02101e] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                    {/* Vinyl Record */}
                    <div
                      className={`w-28 h-28 rounded-full border-4 border-slate-950 bg-slate-900 shadow-inner flex items-center justify-center relative ${
                        isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center">
                        <Disc className="w-6 h-6 text-slate-950" />
                      </div>
                      <div className="absolute inset-0 rounded-full border border-teal-500/20 pointer-events-none" />
                    </div>

                    <span className="text-[10px] text-teal-400/80 mt-2 font-mono uppercase tracking-wider">
                      {currentTrack?.album || 'Keepsake Edition'}
                    </span>
                  </div>
                </div>

                {/* Track Details */}
                <div className="text-center px-2">
                  <h4 className="font-serif text-lg font-bold text-white truncate">
                    {currentTrack?.title || 'No Song Selected'}
                  </h4>
                  <p className="text-xs text-teal-300/80 truncate mt-0.5">
                    {currentTrack?.artist || 'Unknown Artist'}
                  </p>
                </div>

                {/* Progress Bar & Seek */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || currentTrack?.duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-teal-400/70">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || currentTrack?.duration || 0)}</span>
                  </div>
                </div>

                {/* Main Playback Controls */}
                <div className="flex items-center justify-between pt-1">
                  {/* Shuffle Button */}
                  <button
                    onClick={() => setIsShuffle((prev) => !prev)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      isShuffle ? 'text-teal-400 bg-teal-950/60' : 'text-slate-400 hover:text-white'
                    }`}
                    title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  {/* Previous Track */}
                  <button
                    onClick={handlePrevTrack}
                    className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Previous Song"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* Large Center Play / Pause */}
                  <button
                    onClick={togglePlayPause}
                    className="w-13 h-13 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/25 cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    )}
                  </button>

                  {/* Next Track */}
                  <button
                    onClick={handleNextTrack}
                    className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Next Song"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* Repeat Cycle */}
                  <button
                    onClick={cycleRepeat}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      repeatMode !== 'off'
                        ? 'text-teal-400 bg-teal-950/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={`Repeat: ${repeatMode}`}
                  >
                    {repeatMode === 'one' ? (
                      <Repeat1 className="w-4 h-4" />
                    ) : (
                      <Repeat className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Volume Slider Bar */}
                <div className="flex items-center gap-2 pt-2 px-1">
                  <button
                    onClick={() => setIsMuted((prev) => !prev)}
                    className="text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <span className="text-[10px] font-mono text-teal-400/60 w-8 text-right">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
              </>
            )
          ) : (
            /* Playlist Tab */
            <div className="space-y-3">
              {/* Drag & Drop / Upload Callout */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDraggingOver
                    ? 'border-teal-400 bg-teal-950/70 scale-[1.01]'
                    : 'border-teal-500/30 hover:border-teal-400/60 bg-teal-950/30'
                }`}
              >
                <Upload className="w-6 h-6 text-teal-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-teal-100">
                  Add Songs From Your Playlist
                </p>
                <p className="text-[11px] text-teal-300/70 mt-0.5">
                  Click to browse or drop your downloaded MP3 / audio files here
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-teal-300 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-500/25">
                  <HardDrive className="w-3 h-3 text-teal-400" />
                  <span>Permanent in public/songs/ (1.mp3, 2.mp3...) or upload here</span>
                </div>
              </div>

              {/* Track List */}
              <div className="space-y-1.5 pt-1">
                {playlist.length === 0 && (
                  <div className="py-7 text-center text-xs text-teal-300/70 border border-teal-500/20 rounded-2xl bg-teal-950/30 px-4">
                    <Music className="w-6 h-6 text-teal-400 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-teal-200">Your playlist is empty</p>
                    <p className="text-[11px] text-teal-400/60 mt-1 max-w-xs mx-auto">
                      Click the card above or &ldquo;Add Songs&rdquo; to add your downloaded songs!
                    </p>
                  </div>
                )}
                {playlist.map((track, idx) => {
                    const isSelected = idx === currentTrackIndex;
                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setCurrentTrackIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={`group p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-500/20 border border-teal-400/40'
                            : 'hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Track number / playing wave */}
                          <div className="w-6 text-center shrink-0">
                            {isSelected && isPlaying ? (
                              <div className="flex items-end justify-center gap-0.5 h-3">
                                <span className="w-0.5 bg-teal-400 h-full animate-[pulse_0.6s_infinite]" />
                                <span className="w-0.5 bg-teal-400 h-2 animate-[pulse_0.8s_infinite_0.2s]" />
                                <span className="w-0.5 bg-teal-400 h-1.5 animate-[pulse_0.7s_infinite_0.4s]" />
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 font-mono group-hover:text-teal-300">
                                {idx + 1}
                              </span>
                            )}
                          </div>

                          <div className="truncate">
                            <p
                              className={`text-xs font-medium truncate ${
                                isSelected ? 'text-teal-200' : 'text-slate-200'
                              }`}
                            >
                              {track.title}
                            </p>
                            <div className="text-[10px] text-teal-400/60 truncate flex items-center gap-1.5 mt-0.5">
                              <span>{track.artist}</span>
                              {track.isCustom ? (
                                <span className="text-teal-300/80">• Browser Upload</span>
                              ) : (
                                <span className="text-teal-400/70 font-mono">• /songs/{idx + 1}.mp3</span>
                              )}
                              {trackErrorMap[track.id] && (
                                <span className="text-amber-400">• Waiting for file</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-teal-400/50">
                            {formatTime(track.duration)}
                          </span>

                          {/* Delete option for user uploaded custom tracks */}
                          {track.isCustom && (
                            <button
                              onClick={(e) => handleDeleteCustomTrack(e, track.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                              title="Remove song"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-5 py-2.5 bg-[#02101e]/90 border-t border-teal-500/20 text-[11px] text-teal-400/70 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Plays continuously across navigation
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
