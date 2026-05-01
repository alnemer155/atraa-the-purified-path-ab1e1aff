import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, BookOpen, ChevronLeft, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import KhatmaCreateForm from '@/components/KhatmaCreateForm';
import ReadingThemeToggle from '@/components/ReadingThemeToggle';

interface Khatma {
  id: string;
  slug: string;
  short_code: string | null;
  visibility: 'public' | 'private';
  title: string;
  mode: 'surah' | 'full_quran';
  surah_name: string | null;
  recitations_count: number;
  completed_juz_count: number;
}

type View = 'public' | 'mine_private';

const CREATOR_KEY = 'atraa.khatma.creators.v1';

const myCreatedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(CREATOR_KEY);
    if (!raw) return [];
    return Object.keys(JSON.parse(raw) as Record<string, string>);
  } catch { return []; }
};

const KhatmaLandingPage = () => {
  const [view, setView] = useState<View>('public');
  const [recent, setRecent] = useState<Khatma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(view); }, [view]);

  async function load(currentView: View) {
    setLoading(true);
    const nowIso = new Date().toISOString();

    if (currentView === 'public') {
      const { data } = await supabase
        .from('khatmas')
        .select('id, slug, short_code, visibility, title, mode, surah_name, recitations_count, completed_juz_count')
        .eq('is_published', true)
        .eq('visibility', 'public')
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
        .limit(10);
      setRecent((data as Khatma[]) ?? []);
    } else {
      const ids = myCreatedIds();
      if (ids.length === 0) {
        setRecent([]);
      } else {
        const { data } = await supabase
          .from('khatmas')
          .select('id, slug, short_code, visibility, title, mode, surah_name, recitations_count, completed_juz_count')
          .in('id', ids)
          .eq('visibility', 'private')
          .order('created_at', { ascending: false })
          .limit(50);
        setRecent((data as Khatma[]) ?? []);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background pb-12 relative" dir="rtl">
      {/* Top toolbar (theme + private toggle) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <ReadingThemeToggle allowNight />
        <button
          type="button"
          onClick={() => setView(v => v === 'public' ? 'mine_private' : 'public')}
          aria-label={view === 'public' ? 'عرض ختماتي الخاصة' : 'عرض الختمات العامة'}
          title={view === 'public' ? 'ختماتي الخاصة' : 'الختمات العامة'}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            view === 'mine_private' ? 'bg-primary text-primary-foreground' : 'active:bg-secondary/40'
          }`}
        >
          {view === 'public'
            ? <Lock className="w-4 h-4" strokeWidth={1.5} />
            : <Globe className="w-4 h-4" strokeWidth={1.5} />}
        </button>
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
      {view === 'public' && (
        <div className="px-5">
          <KhatmaCreateForm embedded onCreated={() => void load(view)} />
        </div>
      )}

      {/* Khatmas list */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] text-foreground">
            {view === 'public' ? 'آخر الختمات المنشورة' : 'ختماتي الخاصة'}
          </h2>
          <span className="text-[9px] text-muted-foreground/50 font-light tabular-nums">
            {recent.length}
          </span>
        </div>

        {loading ? (
          <p className="text-center text-[11px] text-muted-foreground/70 font-light py-6">
            جارٍ التحميل...
          </p>
        ) : recent.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-card p-6 text-center">
            <p className="text-[11px] text-muted-foreground/70 font-light">
              {view === 'public' ? 'لا توجد ختمات منشورة حالياً' : 'ليس لديك ختمات خاصة على هذا الجهاز'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
            {recent.map((k) => {
              const isFull = k.mode === 'full_quran';
              const Icon = isFull ? BookOpen : BookMarked;
              const meta = isFull
                ? `قرآن كامل · ${k.completed_juz_count}/٣٠ جزء`
                : `سورة ${k.surah_name} · ${k.recitations_count} قراءة`;
              const routeKey = k.visibility === 'private' && k.short_code ? k.short_code : k.slug;
              return (
                <Link
                  key={k.id}
                  to={`/${routeKey}`}
                  className="flex items-center gap-3 p-3.5 border-b border-border/10 last:border-b-0 active:bg-secondary/30 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[12px] text-foreground truncate">{k.title}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5 tabular-nums">
                      {meta}
                    </p>
                  </div>
                  {k.visibility === 'private' && (
                    <Lock className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" strokeWidth={1.6} />
                  )}
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
