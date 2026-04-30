import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, BookMarked, BookOpen, Share2, Plus, Check, Trash2, Clock, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  getCreatorToken,
  forgetCreator,
  getReaderToken,
  rememberJuzClaim,
  forgetJuzClaim,
  getMyJuzClaims,
  khatmaShareUrl,
} from '@/lib/khatma-creator';

interface Khatma {
  id: string;
  slug: string;
  title: string;
  mode: 'surah' | 'full_quran';
  surah_number: number | null;
  surah_name: string | null;
  recitations_count: number;
  completed_juz_count: number;
  created_at: string;
  expires_at: string | null;
}

interface JuzClaim {
  id: string;
  juz_number: number;
  reader_token: string;
  completed_at: string;
}

const KhatmaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [khatma, setKhatma] = useState<Khatma | null>(null);
  const [claims, setClaims] = useState<JuzClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [counted, setCounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [deleting, setDeleting] = useState(false);
  const [busyJuz, setBusyJuz] = useState<number | null>(null);

  const creatorToken = khatma ? getCreatorToken(khatma.id) : null;
  const isCreator = !!creatorToken;
  const isExpired = !!khatma?.expires_at && new Date(khatma.expires_at).getTime() <= now;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('khatmas')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();
    if (error) console.error(error);
    const k = (data as Khatma) ?? null;
    setKhatma(k);

    if (k && k.mode === 'full_quran') {
      const { data: cd } = await supabase
        .from('khatma_juz_claims')
        .select('id, juz_number, reader_token, completed_at')
        .eq('khatma_id', k.id)
        .order('juz_number', { ascending: true });
      setClaims((cd as JuzClaim[]) ?? []);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { void load(); }, [load]);

  async function addRecitation() {
    if (!khatma || counted) return;
    const next = khatma.recitations_count + 1;
    const { error } = await supabase
      .from('khatmas')
      .update({ recitations_count: next })
      .eq('id', khatma.id);
    if (error) {
      toast({ title: 'تعذّر التسجيل', variant: 'destructive' });
      return;
    }
    setKhatma({ ...khatma, recitations_count: next });
    setCounted(true);
    toast({ title: 'تُقبَّل منكم — تم تسجيل قراءتك' });
  }

  async function claimJuz(juz: number) {
    if (!khatma) return;
    setBusyJuz(juz);
    const readerToken = getReaderToken();
    const { data, error } = await supabase
      .from('khatma_juz_claims')
      .insert({ khatma_id: khatma.id, juz_number: juz, reader_token: readerToken })
      .select()
      .single();
    setBusyJuz(null);
    if (error) {
      toast({ title: 'هذا الجزء محجوز بالفعل', variant: 'destructive' });
      void load();
      return;
    }
    rememberJuzClaim(khatma.id, juz);
    setClaims(prev => [...prev, data as JuzClaim].sort((a, b) => a.juz_number - b.juz_number));
    setKhatma({ ...khatma, completed_juz_count: khatma.completed_juz_count + 1 });
    toast({ title: `تم تسجيل قراءتك للجزء ${juz}` });
  }

  async function releaseJuz(juz: number) {
    if (!khatma) return;
    setBusyJuz(juz);
    const readerToken = getReaderToken();
    const { error } = await supabase
      .from('khatma_juz_claims')
      .delete()
      .eq('khatma_id', khatma.id)
      .eq('juz_number', juz)
      .eq('reader_token', readerToken);
    setBusyJuz(null);
    if (error) {
      toast({ title: 'تعذّر الإلغاء', variant: 'destructive' });
      return;
    }
    forgetJuzClaim(khatma.id, juz);
    setClaims(prev => prev.filter(c => c.juz_number !== juz));
    setKhatma({ ...khatma, completed_juz_count: Math.max(0, khatma.completed_juz_count - 1) });
  }

  async function share() {
    if (!khatma) return;
    const url = khatmaShareUrl(khatma.slug);
    const text = khatma.mode === 'full_quran'
      ? `${khatma.title} — ختمة قرآن كاملة`
      : `${khatma.title} — قراءة سورة ${khatma.surah_name}`;
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

  const isFull = khatma.mode === 'full_quran';
  const myReader = getReaderToken();
  const myClaims = getMyJuzClaims(khatma.id);
  const claimedMap = new Map(claims.map(c => [c.juz_number, c]));

  return (
    <div className="min-h-screen bg-background pb-10" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 transition-colors"
            aria-label="رجوع"
          >
            <ChevronRight className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </Link>
          <p className="text-[13px] text-foreground">ختمة</p>
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
        className="px-6 pt-10 pb-6 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          {isFull
            ? <BookOpen className="w-6 h-6 text-primary" strokeWidth={1.3} />
            : <BookMarked className="w-6 h-6 text-primary" strokeWidth={1.3} />}
        </div>
        <p className="text-[11px] text-muted-foreground/70 mb-3 font-light tracking-wider">إهداء</p>
        <h1 className="text-[20px] text-foreground leading-relaxed font-light mb-6 px-2">
          {khatma.title}
        </h1>
        <div className="inline-flex items-baseline gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/30">
          {isFull ? (
            <>
              <span className="text-[10px] text-muted-foreground font-light">ختمة قرآن كاملة</span>
              <span className="text-[14px] text-foreground tabular-nums">{khatma.completed_juz_count}/30</span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-muted-foreground font-light">سورة</span>
              <span className="text-[14px] text-foreground">{khatma.surah_name}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Body — surah counter or juz grid */}
      {isFull ? (
        <div className="px-5 mt-2">
          <div className="rounded-2xl bg-card border border-border/30 p-5">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[11px] text-muted-foreground/80 font-light">الأجزاء الـ٣٠</p>
              <p className="text-[10px] text-muted-foreground/60 font-light tabular-nums">
                {khatma.completed_juz_count} مكتمل · {30 - khatma.completed_juz_count} متبقٍ
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden mb-5">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(khatma.completed_juz_count / 30) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                const claim = claimedMap.get(juz);
                const isClaimed = !!claim;
                const isMine = claim?.reader_token === myReader || myClaims.includes(juz);
                const busy = busyJuz === juz;

                let cls = 'border-border/30 bg-secondary/40 text-foreground active:bg-secondary/60';
                if (isClaimed && isMine) cls = 'bg-primary text-primary-foreground border-primary';
                else if (isClaimed) cls = 'bg-secondary/20 text-muted-foreground/50 border-border/20';

                return (
                  <button
                    key={juz}
                    type="button"
                    disabled={busy || (isClaimed && !isMine)}
                    onClick={() => isMine ? releaseJuz(juz) : claimJuz(juz)}
                    className={`aspect-square rounded-xl border text-[12px] tabular-nums flex flex-col items-center justify-center gap-0.5 transition-colors disabled:opacity-60 ${cls}`}
                  >
                    {busy ? (
                      <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{juz}</span>
                        {isClaimed && !isMine && <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />}
                        {isMine && <Check className="w-2.5 h-2.5" strokeWidth={1.5} />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground/60 mt-5 font-light leading-relaxed text-center">
              اضغط على رقم الجزء لحجزه. الأجزاء المحجوزة بالأخضر هي أجزاؤك. اضغط مجدداً لإلغاء الحجز.
            </p>

            {khatma.completed_juz_count === 30 && (
              <div className="mt-4 rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
                <p className="text-[12px] text-primary">تمّت الختمة بحمد الله — تُقبَّل منكم</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-5 mt-6">
          <div className="rounded-2xl bg-card border border-border/30 p-6 text-center">
            <p className="text-[10px] text-muted-foreground/70 font-light tracking-wider mb-2">عدد القراءات</p>
            <p className="text-[40px] text-foreground tabular-nums font-light leading-none mb-5">
              {khatma.recitations_count}
            </p>
            <button
              onClick={addRecitation}
              disabled={counted}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[13px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {counted ? (
                <><Check className="w-4 h-4" /> تم تسجيل قراءتك</>
              ) : (
                <><Plus className="w-4 h-4" /> سجّل قراءتي للسورة</>
              )}
            </button>
            <p className="text-[10px] text-muted-foreground/60 mt-4 font-light leading-relaxed">
              اضغط بعد قراءتك لسورة {khatma.surah_name} لإضافة قراءتك للختمة
            </p>
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
        <Link
          to="/"
          className="text-[11px] text-muted-foreground underline-offset-4 hover:underline"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default KhatmaPage;
