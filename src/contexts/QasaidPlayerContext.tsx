/**
 * Global player context for Husayni elegies (Qasaid).
 * Allows audio playback to persist across navigation while the user
 * browses other pages. A small floating control appears below the
 * app header (rendered by AppLayout) when something is playing.
 *
 * Background note: when the app/tab is in the background or the device
 * is locked, the Media Session API surfaces play/pause controls in the
 * system notification (already wired in AudioElement listeners). True
 * "play after closing the app" requires a Capacitor native plugin and
 * is planned for a later release per user spec.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QasaidTrack {
  id: string;
  title: string;
  reciter: string;
  cover_path: string | null;
  audio_path: string | null;
  duration_seconds: number | null;
  category?: 'qasaid' | 'podcast';
  youtube_url?: string | null;
}

export type RepeatMode = 'off' | 'all' | 'one';

interface Ctx {
  current: QasaidTrack | null;
  queue: QasaidTrack[];
  isPlaying: boolean;
  position: number;
  duration: number;
  repeat: RepeatMode;
  setRepeat: (m: RepeatMode) => void;
  cycleRepeat: () => void;
  setQueue: (tracks: QasaidTrack[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (s: number) => void;
  seekBy: (delta: number) => void;
  stop: () => void;
}

const QasaidPlayerContext = createContext<Ctx | null>(null);

const publicUrl = (path: string | null) =>
  path ? supabase.storage.from('qasaid-media').getPublicUrl(path).data.publicUrl : '';

export const QasaidPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueueState] = useState<QasaidTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState<RepeatMode>('off');

  // Lazily create the singleton audio element
  if (typeof window !== 'undefined' && !audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';
  }

  const current = queue[index] ?? null;

  const playInternal = useCallback(() => {
    void audioRef.current?.play().catch(() => {/* ignore autoplay restrictions */});
  }, []);

  const pauseInternal = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (queue.length ? (i + 1) % queue.length : 0));
  }, [queue.length]);

  const prev = useCallback(() => {
    setIndex((i) => (queue.length ? (i - 1 + queue.length) % queue.length : 0));
  }, [queue.length]);

  const cycleRepeat = useCallback(() => {
    setRepeat((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'));
  }, []);

  const seekBy = useCallback((delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + delta));
  }, []);

  // Wire audio element events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setPosition(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      if (repeat === 'one' && audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play().catch(() => {});
        return;
      }
      if (repeat === 'off' && queue.length > 0 && index >= queue.length - 1) {
        setIsPlaying(false);
        return;
      }
      next();
    };
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, [next]);

  // Load new track when current changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    const url = publicUrl(current.audio_path);
    if (!url) return;
    a.src = url;
    a.load();
    void a.play().catch(() => {/* user gesture needed */});

    // Media Session metadata for background/lock-screen notification
    if ('mediaSession' in navigator) {
      const cover = current.cover_path ? publicUrl(current.cover_path) : '';
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: current.title,
          artist: current.reciter,
          album: 'منصة عترة — قصائد حسينية',
          artwork: cover ? [
            { src: cover, sizes: '512x512', type: 'image/png' },
            { src: cover, sizes: '256x256', type: 'image/png' },
          ] : [],
        });
        navigator.mediaSession.setActionHandler('play', () => playInternal());
        navigator.mediaSession.setActionHandler('pause', () => pauseInternal());
        navigator.mediaSession.setActionHandler('previoustrack', () => prev());
        navigator.mediaSession.setActionHandler('nexttrack', () => next());
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          if (a) a.currentTime = Math.max(0, a.currentTime - 10);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          if (a) a.currentTime += 10;
        });
      } catch { /* no-op */ }
    }
  }, [current?.id, current?.audio_path, playInternal, pauseInternal, prev, next, current]);

  const setQueue = useCallback((tracks: QasaidTrack[], startIndex = 0) => {
    setQueueState(tracks);
    setIndex(Math.max(0, Math.min(startIndex, tracks.length - 1)));
  }, []);

  const stop = useCallback(() => {
    pauseInternal();
    setQueueState([]);
    setIndex(0);
    setPosition(0);
    if (audioRef.current) audioRef.current.src = '';
  }, [pauseInternal]);

  const value = useMemo<Ctx>(() => ({
    current,
    queue,
    isPlaying,
    position,
    duration,
    setQueue,
    play: playInternal,
    pause: pauseInternal,
    toggle: () => (isPlaying ? pauseInternal() : playInternal()),
    next,
    prev,
    seek: (s) => { if (audioRef.current) audioRef.current.currentTime = s; },
    stop,
  }), [current, queue, isPlaying, position, duration, setQueue, playInternal, pauseInternal, next, prev, stop]);

  return <QasaidPlayerContext.Provider value={value}>{children}</QasaidPlayerContext.Provider>;
};

export const useQasaidPlayer = (): Ctx => {
  const ctx = useContext(QasaidPlayerContext);
  if (!ctx) throw new Error('useQasaidPlayer must be used within QasaidPlayerProvider');
  return ctx;
};

export { publicUrl as qasaidPublicUrl };
