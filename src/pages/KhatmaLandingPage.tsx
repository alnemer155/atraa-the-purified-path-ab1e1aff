import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, BookOpen, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import KhatmaCreateForm from '@/components/KhatmaCreateForm';
import ReadingThemeToggle from '@/components/ReadingThemeToggle';

interface Khatma {
  id: string;
  slug: string;
  title: string;
  mode: 'surah' | 'full_quran';
  surah_name: string | null;
  recitations_count: number;
  completed_juz_count: number;
}

const KhatmaLandingPage = () => {
  const [recent, setRecent] = useState<Khatma[]>([]);

  useEffect(() => { void load(); }, []);

  async function load() {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from('khatmas')
      .select('id, slug, title, mode, surah_name, recitations_count, completed_juz_count')
      .eq('is_published', true)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecent(data as Khatma[]);
  }

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      {/* Theme toggle (top-left) */}
      <div className="absolute top-3 left-3 z-10">
        <ReadingThemeToggle allowNight />
      </div>
      {/* Header */}
      <div className="px-6 pt-10 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
        >
          <BookOpen className="w-6 h-6 text-primary" strokeWidth={1.3} />
        </motion.div>
        <h1 className="text-[20px] text-foreground font-light mb-2">الختمات</h1>
        <p className="text-[11px] text-muted-foreground/80 font-light leading-relaxed max-w-sm mx-auto">
          أهدِ قراءة سورة أو ختمة قرآن كاملة لروح من تحب. شارك الرابط ليُسجّل الآخرون قراءاتهم.
        </p>
      </div>

      {/* Create form (embedded inline) */}
      <div className="px-5">
        <KhatmaCreateForm embedded onCreated={() => void load()} />
      </div>

      {/* Recent khatmas */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] text-foreground">آخر الختمات المنشورة</h2>
          <span className="text-[9px] text-muted-foreground/50 font-light tabular-nums">
            {recent.length}
          </span>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-card p-6 text-center">
            <p className="text-[11px] text-muted-foreground/70 font-light">لا توجد ختمات منشورة حالياً</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
            {recent.map((k) => {
              const isFull = k.mode === 'full_quran';
              const Icon = isFull ? BookOpen : BookMarked;
              const meta = isFull
                ? `قرآن كامل · ${k.completed_juz_count}/٣٠ جزء`
                : `سورة ${k.surah_name} · ${k.recitations_count} قراءة`;
              return (
                <Link
                  key={k.id}
                  to={`/${k.slug}`}
                  className="flex items-center gap-3 p-3.5 border-b border-border/10 last:border-b-0 active:bg-secondary/30 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[12px] text-foreground truncate">{k.title}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 tabular-nums">
                      {meta}
                    </p>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10 text-center">
        <a href="https://atraa.xyz" className="text-[10px] text-muted-foreground/60 underline-offset-4 hover:underline">
          عَتْرَة — atraa.xyz
        </a>
      </div>
    </div>
  );
};

export default KhatmaLandingPage;
