export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverColor: string;
  audioUrl?: string; // Direct audio URL or generated blob URL
  generatorType?: 'piano' | 'acoustic' | 'serenade';
  isCustom?: boolean;
}

export const INITIAL_PRESET_TRACKS: TrackItem[] = [
  {
    id: 'permanent-track-1',
    title: 'Song 1',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-teal-500 to-cyan-700',
    audioUrl: '/songs/1.mp3',
  },
  {
    id: 'permanent-track-2',
    title: 'Song 2',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-pink-500 to-rose-700',
    audioUrl: '/songs/2.mp3',
  },
  {
    id: 'permanent-track-3',
    title: 'Song 3',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-amber-500 to-orange-700',
    audioUrl: '/songs/3.mp3',
  },
  {
    id: 'permanent-track-4',
    title: 'Song 4',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-purple-500 to-indigo-700',
    audioUrl: '/songs/4.mp3',
  },
  {
    id: 'permanent-track-5',
    title: 'Song 5',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-emerald-500 to-teal-700',
    audioUrl: '/songs/5.mp3',
  },
  {
    id: 'permanent-track-6',
    title: 'Song 6',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-cyan-500 to-blue-700',
    audioUrl: '/songs/6.mp3',
  },
  {
    id: 'permanent-track-7',
    title: 'Song 7',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-rose-500 to-pink-700',
    audioUrl: '/songs/7.mp3',
  },
  {
    id: 'permanent-track-8',
    title: 'Song 8',
    artist: 'For Kittu',
    album: 'Our Special Playlist',
    duration: 0,
    coverColor: 'from-blue-500 to-indigo-700',
    audioUrl: '/songs/8.mp3',
  },
];
