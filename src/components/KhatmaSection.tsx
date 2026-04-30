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
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecent(data as Khatma[]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[12px] text-foreground text-right">الختمات</h2>
        <span className="text-[8px] text-muted-foreground/40 font-light tabular-nums">
          {recent.length} منشورة
        </span>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 p-3.5 active:bg-secondary/40 transition-colors text-right"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground">إنشاء ختمة جديدة</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-light">
              سورة واحدة أو ختمة قرآن كاملة (٣٠ جزء)
            </p>
          </div>
          <BookMarked className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
        </button>

        {recent.length > 0 && (
          <div className="border-t border-border/20">
            {recent.map((k) => {
              const isFull = k.mode === 'full_quran';
              const Icon = isFull ? BookOpen : BookMarked;
              const meta = isFull
                ? `قرآن كامل · ${k.completed_juz_count}/٣٠ جزء`
                : `سورة ${k.surah_name} · ${k.recitations_count} قراءة`;
              return (
                <Link
                  key={k.id}
                  to={`/khatma/${k.slug}`}
                  className="flex items-center gap-3 p-3 border-b border-border/10 last:border-b-0 active:bg-secondary/30 transition-colors"
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
