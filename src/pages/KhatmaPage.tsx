import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookMarked, Share2, Trash2, Clock, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  getCreatorToken,
  forgetCreator,
  getReaderToken,
  rememberReader,
  forgetReader,
  generateReaderToken,
  khatmaShareUrl,
} from '@/lib/khatma-creator';

interface Khatma {
  id: string;
  slug: string;
  title: string;
  dedication: string | null;
  completed_juz_count: number;
  created_at: string;
  expires_at: string | null;
}

interface JuzClaim {
  id: string;
  khatma_id: string;
  juz_number: number;
  reader_name: string | null;
  completed_at: string;
}

const TOTAL_JUZ = 30;

const KhatmaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [khatma, setKhatma] = useState<Khatma | null>(null);
  const [claims, setClaims] = useState<JuzClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [deleting, setDeleting] = useState(false);
  const [pickJuz, setPickJuz] = useState<number | null>(null);
  const [readerName, setReaderName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const creatorToken = khatma ? getCreatorToken(khatma.id) : null;
  const isCreator = !!creatorToken;
  const isExpired = !!khatma?.expires_at && new Date(khatma.expires_at).getTime() <= now;

  const claimedMap = useMemo(() => {
    const m = new Map<number, JuzClaim>();
    for (const c of claims) m.set(c.juz_number, c);
    return m;
  }, [claims]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!slug) return;
    void load();
  }, [slug]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('khatmas')
      .select('id, slug, title, dedication, completed_juz_count, created_at, expires_at')
      .eq('slug', slug!)
      .eq('is_published', true)
      .maybeSingle();
    if (error) console.error(error);
    if (data) {
      setKhatma(data as Khatma);
      const { data: cl } = await supabase
        .from('khatma_juz_claims')
        .select('id, khatma_id, juz_number, reader_name, completed_at')
        .eq('khatma_id', (data as Khatma).id)
        .order('juz_number');
      setClaims((cl as JuzClaim[]) ?? []);
    } else {
      setKhatma(null);
    }
    setLoading(false);
  }

  async function claimJuz() {
    if (!khatma || pickJuz === null) return;
    setSubmitting(true);
    const token = generateReaderToken();
    const { error } = await supabase.from('khatma_juz_claims').insert({
      khatma_id: khatma.id,
      juz_number: pickJuz,
      reader_name: readerName.trim() || null,
      reader_token: token,
    });
    if (error) {
      setSubmitting(false);
      toast({
        title: error.code === '23505' ? 'هذا الجزء محجوز بالفعل' : 'تعذّر التسجيل',
        variant: 'destructive',
      });
      void load();
      return;
    }
    rememberReader(khatma.id, pickJuz, token);
    toast({ title: 'تُقبَّل منكم — تم تسجيل قراءتك للجزء' });
    setPickJuz(null);
    setReaderName('');
    setSubmitting(false);
    void load();
  }

  async function releaseJuz(juz: number) {
    if (!khatma) return;
    const token = getReaderToken(khatma.id, juz);
    if (!token) return;
    const ok = window.confirm('هل تريد إلغاء تسجيلك لهذا الجزء؟');
    if (!ok) return;
    const { error } = await supabase
      .from('khatma_juz_claims')
      .delete()
      .eq('khatma_id', khatma.id)
      .eq('juz_number', juz)
      .eq('reader_token', token);
    if (error) {
      toast({ title: 'تعذّر الإلغاء', variant: 'destructive' });
      return;
    }
    forgetReader(khatma.id, juz);
    toast({ title: 'تم إلغاء التسجيل' });
    void load();
  }

  async function share() {
    if (!khatma) return;
    const url = khatmaShareUrl(khatma.slug);
    const text = `${khatma.title} — ختمة قرآن كاملة`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ختمة', text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'تم نسخ الرابط' });
      }
    } catch { /* ignore */ }
  }

  async function handleDelete() {
    if (!khatma || !creatorToken) return;
    const ok = window.confirm('هل تريد حذف هذه الختمة؟ لا يمكن التراجع.');
    if (!ok) return;
    setDeleting(true);
    const { error } = await supabase
      .from('khatmas')
      .delete()
      .eq('id', khatma.id)
      .eq('creator_token', creatorToken);
    if (error) {
      setDeleting(false);
      toast({ title: 'تعذّر الحذف', variant: 'destructive' });
      return;
    }
    forgetCreator(khatma.id);
    toast({ title: 'تم حذف الختمة' });
    navigate('/');
  }

  function expiryLabel(): string {
    if (!khatma?.expires_at) return '';
    const ms = new Date(khatma.expires_at).getTime() - now;
    if (ms <= 0) return 'انتهت';
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    if (hours >= 1) return `يتبقى ${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
    return `يتبقى ${mins} دقيقة`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary/15 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!khatma || (isExpired && !isCreator)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" dir="rtl">
        <p className="text-[14px] text-foreground mb-2">الختمة غير متاحة</p>
        <p className="text-[11px] text-muted-foreground mb-6">قد تكون قد انتهت مدتها أو حُذفت أو الرابط غير صحيح</p>
        <Link to="/" className="text-[12px] text-primary underline-offset-4 underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const completed = khatma.completed_juz_count;
  const progressPct = Math.round((completed / TOTAL_JUZ) * 100);

  return (
    <div className="min-h-screen bg-background pb-10" dir="rtl">
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 transition-colors"
            aria-label="رجوع"
          >
            <ChevronRight className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </Link>
          <p className="text-[13px] text-foreground">ختمة قرآن</p>
          <button
            onClick={share}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 transition-colors"
            aria-label="مشاركة"
          >
            <Share2 className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 pt-10 pb-4 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <BookMarked className="w-6 h-6 text-primary" strokeWidth={1.3} />
        </div>
        <h1 className="text-[20px] text-foreground leading-relaxed font-light mb-3 px-2">
          {khatma.title}
        </h1>
        {khatma.dedication && (
          <p className="text-[12px] text-muted-foreground leading-relaxed font-light mb-4 px-2">
            {khatma.dedication}
          </p>
        )}
      </motion.div>

      {/* Progress */}
      <div className="px-5">
        <div className="rounded-2xl bg-card border border-border/30 p-5">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[10px] text-muted-foreground font-light tracking-wider">التقدّم</p>
            <p className="text-[14px] text-foreground tabular-nums font-light">
              {completed} <span className="text-muted-foreground/60 text-[10px]">/ {TOTAL_JUZ}</span>
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Juz grid */}
      <div className="px-5 mt-5">
        <p className="text-[11px] text-muted-foreground mb-3 font-light">اختر جزءاً لقراءته</p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: TOTAL_JUZ }, (_, i) => i + 1).map((j) => {
            const claim = claimedMap.get(j);
            const isMine = !!getReaderToken(khatma.id, j);
            const taken = !!claim;
            return (
              <button
                key={j}
                onClick={() => {
                  if (isMine) return releaseJuz(j);
                  if (taken) return;
                  setPickJuz(j);
                }}
                disabled={taken && !isMine}
                className={`aspect-square rounded-xl border text-[13px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isMine
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : taken
                    ? 'bg-secondary/30 border-border/20 text-muted-foreground/50'
                    : 'bg-card border-border/30 text-foreground active:bg-secondary/40'
                }`}
              >
                <span className="tabular-nums font-light">{j}</span>
                {taken && (
                  <Check className="w-2.5 h-2.5" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-3 font-light leading-relaxed">
          الأجزاء المحجوزة لا يمكن لقارئ آخر اختيارها. يمكنك إلغاء جزء سجّلته أنت بالضغط عليه.
        </p>
      </div>

      {/* Recent claims */}
      {claims.length > 0 && (
        <div className="px-5 mt-6">
          <p className="text-[11px] text-muted-foreground mb-2 font-light">آخر القراءات</p>
          <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
            {[...claims].slice(-5).reverse().map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/10 last:border-b-0">
                <span className="text-[11px] text-muted-foreground font-light">
                  {c.reader_name || 'قارئ'}
                </span>
                <span className="text-[11px] text-foreground tabular-nums">الجزء {c.juz_number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creator-only controls */}
      {isCreator && (
        <div className="px-5 mt-5">
          <div className="rounded-2xl border border-border/30 bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[11px] text-muted-foreground font-light flex-1">
                {khatma.expires_at ? expiryLabel() : 'ختمة دائمة (بدون مدة)'}
              </p>
            </div>
            {isExpired && (
              <p className="text-[10px] text-muted-foreground/70 font-light">
                هذه الختمة منتهية ولا تظهر للآخرين
              </p>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full h-11 rounded-full border border-border/40 text-[12px] text-foreground flex items-center justify-center gap-2 active:bg-secondary/40 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              {deleting ? 'جارٍ الحذف...' : 'حذف الختمة'}
            </button>
          </div>
        </div>
      )}

      <div className="px-5 mt-6 text-center">
        <Link to="/" className="text-[11px] text-muted-foreground underline-offset-4 hover:underline">
          العودة إلى الرئيسية
        </Link>
      </div>

      {/* Pick juz modal */}
      <AnimatePresence>
        {pickJuz !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
            dir="rtl"
            onClick={() => !submitting && setPickJuz(null)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-card border border-border/30 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[14px] text-foreground">تسجيل قراءة الجزء {pickJuz}</p>
                <button
                  onClick={() => !submitting && setPickJuz(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/40"
                  disabled={submitting}
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <label className="text-[11px] text-muted-foreground block mb-2">
                اسمك <span className="text-muted-foreground/50">(اختياري)</span>
              </label>
              <input
                type="text"
                value={readerName}
                onChange={(e) => setReaderName(e.target.value)}
                disabled={submitting}
                maxLength={40}
                placeholder="مثال: أبو محمد"
                className="w-full h-11 px-3 rounded-xl bg-secondary/40 border border-border/30 text-[13px] text-foreground text-right placeholder:text-muted-foreground/40"
              />
              <p className="text-[10px] text-muted-foreground/60 mt-3 font-light leading-relaxed">
                بضغطك "تأكيد" تُسجَّل قراءتك للجزء {pickJuz}، ولا يُتاح لقارئ آخر اختياره.
              </p>
              <button
                onClick={claimJuz}
                disabled={submitting}
                className="mt-4 w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التسجيل...</>
                ) : (
                  <><Check className="w-4 h-4" /> تأكيد قراءة الجزء {pickJuz}</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KhatmaPage;
