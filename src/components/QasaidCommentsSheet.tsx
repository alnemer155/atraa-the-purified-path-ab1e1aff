/**
 * Unified Qasida sheet — playback + comments + likes.
 * Opens when the user taps an elegy. Anonymous (name only).
 * Adds: ±10s seek, repeat (off/all/one), share-with-4-digit-code, video badge,
 * and a dedicated podcast layout with YouTube/video embeds.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Send, Play, Pause, SkipBack, SkipForward,
  Repeat, Repeat1, Rewind, FastForward, Share2, Video, Headphones,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQasaidPlayer, qasaidPublicUrl } from '@/contexts/QasaidPlayerContext';

interface Comment {
  id: string;
  visitor_name: string;
  content: string;
  created_at: string;
}

interface Props {
  qasidaId: string;
  open: boolean;
  onClose: () => void;
}

const TOKEN_KEY = 'atraa_visitor_token';
const NAME_KEY = 'atraa_visitor_name';

const getToken = (): string => {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) { t = crypto.randomUUID(); localStorage.setItem(TOKEN_KEY, t); }
    return t;
  } catch { return crypto.randomUUID(); }
};

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

const extractYoutubeId = (url: string): string => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : url; // fallback to raw if already an ID
};

const QasaidCommentsSheet = ({ qasidaId, open, onClose }: Props) => {
  const { current, isPlaying, toggle, next, prev, position, duration, seek, seekBy, repeat, cycleRepeat } = useQasaidPlayer();
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [iLiked, setILiked] = useState(false);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(NAME_KEY) ?? ''; } catch { return ''; }
  });
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('qasaid');
  const token = useMemo(() => getToken(), []);

  const showPlayer = current && current.id === qasidaId;
  const isPodcast = category === 'podcast';

  useEffect(() => {
    if (!open || !qasidaId) return;
    void (async () => {
      const [{ data: cs }, { data: ls }, { data: mine }, { data: qasida }] = await Promise.all([
        supabase.from('qasida_comments').select('*').eq('qasida_id', qasidaId).order('created_at', { ascending: false }).limit(100),
        supabase.from('qasida_likes').select('id', { count: 'exact', head: true }).eq('qasida_id', qasidaId),
        supabase.from('qasida_likes').select('id').eq('qasida_id', qasidaId).eq('visitor_token', token).maybeSingle(),
        supabase.from('admin_qasaid').select('youtube_url, video_path, share_code, category').eq('id', qasidaId).maybeSingle(),
      ]);
      setComments((cs as Comment[]) ?? []);
      setLikeCount((ls as unknown as { count?: number })?.count ?? 0);
      setILiked(!!mine);
      const q = qasida as { youtube_url?: string | null; video_path?: string | null; share_code?: string | null; category?: string | null } | null;
      setYoutubeUrl(q?.youtube_url ?? null);
      setVideoPath(q?.video_path ?? null);
      setShareCode(q?.share_code ?? null);
      setCategory(q?.category ?? 'qasaid');
    })();
  }, [open, qasidaId, token]);

  const sharePublic = async () => {
    if (!shareCode) { toast({ title: 'لا يوجد رمز مشاركة' }); return; }
    const url = `https://qasaid.atraa.xyz/q/${shareCode}`;
    const text = current ? `${current.title} — ${current.reciter}` : 'قصيدة من منصة عترة';
    try {
      if (navigator.share) await navigator.share({ title: 'قصيدة', text, url });
      else { await navigator.clipboard.writeText(url); toast({ title: 'تم نسخ الرابط' }); }
    } catch { /* cancelled */ }
  };

  const toggleLike = async () => {
    if (iLiked) {
      await supabase.from('qasida_likes').delete().eq('qasida_id', qasidaId).eq('visitor_token', token);
      setILiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      const { error } = await supabase.from('qasida_likes').insert({ qasida_id: qasidaId, visitor_token: token });
      if (!error) { setILiked(true); setLikeCount((c) => c + 1); }
    }
  };

  const submit = async () => {
    const n = name.trim();
    const c = content.trim();
    if (n.length < 2) { toast({ title: 'الاسم قصير جدًا', variant: 'destructive' }); return; }
    if (c.length < 1) { toast({ title: 'اكتب تعليقك أولًا', variant: 'destructive' }); return; }
    if (c.length > 500) { toast({ title: 'الحد ٥٠٠ حرف', variant: 'destructive' }); return; }
    setPosting(true);
    const { data, error } = await supabase
      .from('qasida_comments')
      .insert({ qasida_id: qasidaId, visitor_name: n, content: c, visitor_token: token })
      .select()
      .single();
    setPosting(false);
    if (error) { toast({ title: 'تعذّر إرسال التعليق', variant: 'destructive' }); return; }
    try { localStorage.setItem(NAME_KEY, n); } catch { /* ignore */ }
    setComments((prev) => [data as Comment, ...prev]);
    setContent('');
  };

  const cover = showPlayer && current?.cover_path ? qasaidPublicUrl(current.cover_path) : '';
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-background/85 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-3xl border-t border-border/30 flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-border/60" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-border/15">
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/40" aria-label="إغلاق">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-1.5">
                {isPodcast && <Headphones className="w-3.5 h-3.5 text-primary" strokeWidth={1.6} />}
                {(videoPath || youtubeUrl) && (
                  <span className="flex items-center gap-1 px-2 h-5 rounded-full bg-primary/10 text-primary text-[9px]">
                    <Video className="w-2.5 h-2.5" strokeWidth={1.8} /> فيديو
                  </span>
                )}
                <p className="text-[13px] text-foreground">{isPodcast ? 'حلقة بودكاست' : 'القصيدة'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={sharePublic}
                  className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/40"
                  aria-label="مشاركة"
                  title={shareCode ? `رمز ${shareCode}` : 'مشاركة'}
                >
                  <Share2 className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => void toggleLike()}
                  className={`flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] ${iLiked ? 'bg-foreground text-background' : 'bg-secondary/50 text-foreground'}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${iLiked ? 'fill-current' : ''}`} strokeWidth={1.6} />
                  <span className="tabular-nums">{likeCount}</span>
                </button>
              </div>
            </div>

            {/* Video / YouTube embed first for podcast or video posts */}
            {(youtubeUrl || videoPath) && (
              <div className={`px-5 pt-3 pb-3 ${isPodcast ? 'bg-primary/5' : ''} border-b border-border/15`}>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                  {youtubeUrl ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`}
                      title="YouTube"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={qasaidPublicUrl(videoPath)}
                      controls
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                </div>
                {shareCode && (
                  <p className="mt-2 text-[10px] text-center text-muted-foreground/70 font-light tabular-nums">
                    رمز المشاركة: {shareCode}
                  </p>
                )}
              </div>
            )}

            {showPlayer && current && (
              <div className="px-5 py-4 border-b border-border/15">
                <div className="flex items-center gap-3">
                  {cover ? (
                    <img src={cover} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {isPodcast ? (
                        <Headphones className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      ) : (
                        <Play className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{current.title}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-light truncate mt-0.5">{current.reciter}</p>
                  </div>
                </div>
                <div
                  className="mt-3 h-1 rounded-full bg-border/30 cursor-pointer"
                  onClick={(e) => {
                    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const x = (e.clientX - r.left) / r.width;
                    if (duration) seek(Math.max(0, Math.min(1, 1 - x)) * duration); // RTL
                  }}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted-foreground/60 font-light tabular-nums">
                  <span>{fmt(position)}</span>
                  <span>{fmt(duration)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={cycleRepeat}
                    aria-label="تكرار"
                    title={repeat === 'one' ? 'تكرار ١' : repeat === 'all' ? 'تكرار الكل' : 'بدون تكرار'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/50 ${repeat !== 'off' ? 'bg-primary/10 text-primary' : 'text-foreground/70'}`}
                  >
                    {repeat === 'one' ? <Repeat1 className="w-4 h-4" strokeWidth={1.7} /> : <Repeat className="w-4 h-4" strokeWidth={1.7} />}
                  </button>
                  <button onClick={prev} aria-label="السابق" className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/50">
                    <SkipForward className="w-4 h-4 text-foreground" strokeWidth={1.6} />
                  </button>
                  <button
                    onClick={() => seekBy(-10)}
                    aria-label="إرجاع ١٠ ثوانٍ"
                    className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/50 relative"
                  >
                    <Rewind className="w-4 h-4 text-foreground" strokeWidth={1.6} />
                    <span className="absolute -bottom-0.5 text-[7px] tabular-nums text-muted-foreground/70">10−</span>
                  </button>
                  <button onClick={toggle} aria-label={isPlaying ? 'إيقاف' : 'تشغيل'} className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center">
                    {isPlaying ? <Pause className="w-4 h-4" strokeWidth={2} /> : <Play className="w-4 h-4 ms-0.5" strokeWidth={2} />}
                  </button>
                  <button
                    onClick={() => seekBy(10)}
                    aria-label="تقديم ١٠ ثوانٍ"
                    className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/50 relative"
                  >
                    <FastForward className="w-4 h-4 text-foreground" strokeWidth={1.6} />
                    <span className="absolute -bottom-0.5 text-[7px] tabular-nums text-muted-foreground/70">10+</span>
                  </button>
                  <button onClick={next} aria-label="التالي" className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/50">
                    <SkipBack className="w-4 h-4 text-foreground" strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              <p className="text-[11px] text-foreground mb-2">التعليقات</p>
              {comments.length === 0 ? (
                <p className="text-center text-[11px] text-muted-foreground/60 py-6 font-light">
                  لا توجد تعليقات بعد — كن أول من يعلّق
                </p>
              ) : comments.map((c) => (
                <div key={c.id} className="rounded-2xl bg-secondary/30 border border-border/20 p-3">
                  <p className="text-[11px] text-foreground">{c.visitor_name}</p>
                  <p className="text-[12px] text-foreground/85 font-light leading-relaxed mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-border/15 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك"
                maxLength={50}
                className="w-full h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none text-right"
              />
              <div className="flex gap-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب تعليقًا محترمًا…"
                  rows={2}
                  maxLength={500}
                  className="flex-1 rounded-xl bg-secondary/40 border border-border/30 p-2.5 text-[12px] outline-none resize-none text-right"
                />
                <button
                  onClick={() => void submit()}
                  disabled={posting}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center self-end disabled:opacity-50"
                  aria-label="إرسال"
                >
                  <Send className="w-4 h-4" strokeWidth={1.6} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QasaidCommentsSheet;
