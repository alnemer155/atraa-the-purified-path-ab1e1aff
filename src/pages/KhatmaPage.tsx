import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, BookMarked, Share2, Plus, Check, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCreatorToken, forgetCreator } from '@/lib/khatma-creator';

interface Khatma {
  id: string;
  slug: string;
  title: string;
  surah_number: number;
  surah_name: string;
  recitations_count: number;
  created_at: string;
  expires_at: string | null;
}

const KhatmaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [khatma, setKhatma] = useState<Khatma | null>(null);
  const [loading, setLoading] = useState(true);
  const [counted, setCounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [deleting, setDeleting] = useState(false);

  const creatorToken = khatma ? getCreatorToken(khatma.id) : null;
  const isCreator = !!creatorToken;
  const isExpired = !!khatma?.expires_at && new Date(khatma.expires_at).getTime() <= now;

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
      .select('*')
      .eq('slug', slug!)
      .eq('is_published', true)
      .maybeSingle();
    if (error) console.error(error);
    setKhatma((data as Khatma) ?? null);
    setLoading(false);
  }

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

  async function share() {
    const url = window.location.href;
    const text = `${khatma?.title} — قراءة سورة ${khatma?.surah_name}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ختمة', text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'تم نسخ الرابط' });
      }
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary/15 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!khatma) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" dir="rtl">
        <p className="text-[14px] text-foreground mb-2">الختمة غير موجودة</p>
        <p className="text-[11px] text-muted-foreground mb-6">قد تكون قد حُذفت أو الرابط غير صحيح</p>
        <Link to="/" className="text-[12px] text-primary underline-offset-4 underline">العودة للرئيسية</Link>
      </div>
    );
  }

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
          <BookMarked className="w-6 h-6 text-primary" strokeWidth={1.3} />
        </div>
        <p className="text-[11px] text-muted-foreground/70 mb-3 font-light tracking-wider">إهداء</p>
        <h1 className="text-[20px] text-foreground leading-relaxed font-light mb-6 px-2">
          {khatma.title}
        </h1>
        <div className="inline-flex items-baseline gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/30">
          <span className="text-[10px] text-muted-foreground font-light">سورة</span>
          <span className="text-[14px] text-foreground">{khatma.surah_name}</span>
        </div>
      </motion.div>

      {/* Counter */}
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
