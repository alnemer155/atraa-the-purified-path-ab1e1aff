import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseDuasContent } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { SUNNI_CONTENT } from '@/data/sunni-content';
import { useMadhhab } from '@/lib/madhhab';
import { ChevronLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const STORAGE_KEY = 'atraa_daily_done';

const loadDone = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { day: string; ids: Record<string, boolean> };
    if (parsed.day !== todayKey()) return {};
    return parsed.ids ?? {};
  } catch { return {}; }
};

const saveDone = (ids: Record<string, boolean>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: todayKey(), ids }));
  } catch { /* ignore */ }
};

const DailyRecommendations = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const madhhab = useMadhhab();
  const [done, setDone] = useState<Record<string, boolean>>(() => loadDone());

  useEffect(() => { saveDone(done); }, [done]);

  const recommendations = useMemo(() => {
    const items = madhhab === 'sunni' ? SUNNI_CONTENT : parseDuasContent(duasRaw);
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

    const duas = items.filter(i => i.category === 'dua');
    const ziyarat = items.filter(i => i.category === 'ziyara');
    const adhkar = items.filter(i => i.category === 'dhikr');

    const rows = madhhab === 'sunni'
      ? [
          { label: isAr ? 'دعاء اليوم' : 'Dua of the day', tab: 'duas', item: duas[dayOfYear % Math.max(duas.length, 1)] },
          { label: isAr ? 'ذكر اليوم' : 'Dhikr of the day', tab: 'duas', item: adhkar[dayOfYear % Math.max(adhkar.length, 1)] },
        ]
      : [
          { label: isAr ? 'دعاء اليوم' : 'Dua of the day', tab: 'duas', item: duas[dayOfYear % Math.max(duas.length, 1)] },
          { label: isAr ? 'زيارة اليوم' : 'Ziyara of the day', tab: 'duas', item: ziyarat[dayOfYear % Math.max(ziyarat.length, 1)] },
          { label: isAr ? 'ذكر اليوم' : 'Dhikr of the day', tab: 'duas', item: adhkar[dayOfYear % Math.max(adhkar.length, 1)] },
        ];
    return rows.filter(r => r.item);
  }, [isAr, madhhab]);

  if (recommendations.length === 0) return null;

  const toggleDone = (id: string) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <h2 className={`text-[12px] text-foreground mb-2.5 ${isAr ? 'text-right' : 'text-left'}`}>
        {isAr ? 'مقترحات اليوم' : 'Daily picks'}
      </h2>
      <div className="space-y-1.5">
        {recommendations.map(({ label, tab, item }, i) => {
          const id = item!.id;
          const isDone = !!done[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: isAr ? 6 : -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`w-full flex items-center gap-2 p-3 rounded-2xl bg-card border border-border/20 transition-opacity ${isDone ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => toggleDone(id)}
                aria-label={isDone ? (isAr ? 'إلغاء الإتمام' : 'Mark undone') : (isAr ? 'تأشير كمنجزة' : 'Mark done')}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors active:scale-95 ${
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/40 text-muted-foreground/60 border border-border/30'
                }`}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button
                onClick={() => navigate('/library', { state: { tab, itemId: id } })}
                className={`flex-1 flex items-center gap-2 min-w-0 ${isAr ? 'text-right' : 'text-left'} active:opacity-80`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] text-muted-foreground/40 tracking-wide font-light">{label}</p>
                  <p className={`text-[12px] truncate mt-0.5 ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item!.title}</p>
                </div>
                <ChevronLeft className={`w-3.5 h-3.5 text-muted-foreground/15 flex-shrink-0 ${isAr ? '' : 'rotate-180'}`} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyRecommendations;
