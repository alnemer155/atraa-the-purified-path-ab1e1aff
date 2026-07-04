import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BookMarked, Plus, ChevronLeft, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import KhatmaCreateForm from './KhatmaCreateForm';

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
}

const KhatmaSection = () => {
  const [recent, setRecent] = useState<Khatma[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    void loadRecent();
  }, []);

  async function loadRecent() {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from('khatmas')
      .select('*')
      .eq('is_published', true)
      .eq('visibility', 'public')
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecent(data as Khatma[]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-gold" />
          <h2 className="text-[13px] font-bold text-foreground">الختمات</h2>
        </div>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums">
          {recent.length} منشورة
        </span>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 p-4 active:bg-foreground/[0.03] transition-colors text-right"
        >
          <div className="w-10 h-10 rounded-2xl bg-gold/10 hairline-gold border-[0.5px] flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 text-gold" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground font-bold">إنشاء ختمة جديدة</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              سورة واحدة أو ختمة قرآن كاملة (٣٠ جزء)
            </p>
          </div>
          <BookMarked className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
        </button>

        {recent.length > 0 && (
          <div className="border-t-[0.5px] hairline">
            {recent.map((k) => {
              const isFull = k.mode === 'full_quran';
              const Icon = isFull ? BookOpen : BookMarked;
              const pct = isFull ? Math.round((k.completed_juz_count / 30) * 100) : null;
              const meta = isFull
                ? `الجزء ${k.completed_juz_count}/٣٠`
                : `سورة ${k.surah_name} · ${k.recitations_count} قراءة`;
              return (
                <Link
                  key={k.id}
                  to={`/khatma/${k.slug}`}
                  className="flex items-center gap-3 p-4 border-t-[0.5px] hairline first:border-t-0 active:bg-foreground/[0.03] transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0 text-right space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[12px] text-foreground font-bold truncate">{k.title}</p>
                      {pct !== null && (
                        <span className="text-[10px] text-gold font-bold tabular-nums flex-shrink-0">{pct}٪</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 tabular-nums">{meta}</p>
                    {pct !== null && (
                      <div className="h-[3px] w-full bg-foreground/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full relative transition-all"
                          style={{ width: `${pct}%` }}
                        >
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-background border-[1.5px] border-gold" />
                        </div>
                      </div>
                    )}
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <KhatmaCreateForm
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); void loadRecent(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default KhatmaSection;
