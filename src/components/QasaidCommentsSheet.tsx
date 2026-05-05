/**
 * Comments + likes bottom sheet for a Qasida.
 * Anonymous: requires only a name (no auth). Likes are token-based to
 * prevent duplicates per device.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, t);
    }
    return t;
  } catch { return crypto.randomUUID(); }
};

const QasaidCommentsSheet = ({ qasidaId, open, onClose }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [iLiked, setILiked] = useState(false);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(NAME_KEY) ?? ''; } catch { return ''; }
  });
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const [{ data: cs }, { data: ls }, { data: mine }] = await Promise.all([
        supabase.from('qasida_comments').select('*').eq('qasida_id', qasidaId).order('created_at', { ascending: false }).limit(100),
        supabase.from('qasida_likes').select('id', { count: 'exact', head: true }).eq('qasida_id', qasidaId),
        supabase.from('qasida_likes').select('id').eq('qasida_id', qasidaId).eq('visitor_token', token).maybeSingle(),
      ]);
      setComments((cs as Comment[]) ?? []);
      setLikeCount((ls as unknown as { count?: number })?.count ?? 0);
      setILiked(!!mine);
    })();
  }, [open, qasidaId, token]);

  const toggleLike = async () => {
    if (iLiked) {
      await supabase.from('qasida_likes').delete().eq('qasida_id', qasidaId).eq('visitor_token', token);
      setILiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      const { error } = await supabase.from('qasida_likes').insert({ qasida_id: qasidaId, visitor_token: token });
      if (!error) {
        setILiked(true);
        setLikeCount((c) => c + 1);
      }
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
            style={{ maxHeight: '85vh' }}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-border/60" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-border/15">
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/40" aria-label="إغلاق">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <p className="text-[13px] text-foreground">التعليقات والإعجابات</p>
              <button
                onClick={() => void toggleLike()}
                className={`flex items-center gap-1 px-3 h-8 rounded-full text-[11px] ${iLiked ? 'bg-foreground text-background' : 'bg-secondary/50 text-foreground'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${iLiked ? 'fill-current' : ''}`} strokeWidth={1.6} />
                <span className="tabular-nums">{likeCount}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {comments.length === 0 ? (
                <p className="text-center text-[11px] text-muted-foreground/60 py-10 font-light">
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
              <p className="text-[9px] text-muted-foreground/60 font-light leading-relaxed">
                التعليقات بدون تسجيل دخول — اكتب اسمك فقط. يُرجى الاحترام والابتعاد عن الإساءة.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QasaidCommentsSheet;
