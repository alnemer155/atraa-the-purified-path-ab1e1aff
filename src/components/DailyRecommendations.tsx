import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseDuasContent } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { SUNNI_CONTENT } from '@/data/sunni-content';
import { useMadhhab } from '@/lib/madhhab';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DailyRecommendations = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const madhhab = useMadhhab();

  const recommendations = useMemo(() => {
    const items = madhhab === 'sunni' ? SUNNI_CONTENT : parseDuasContent(duasRaw);
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

    const duas = items.filter(i => i.category === 'dua');
    const ziyarat = items.filter(i => i.category === 'ziyara');
    const adhkar = items.filter(i => i.category === 'dhikr');

    // Sunni → no ziyarat row; show dua + dhikr only.
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

  return (
    <div>
      <h2 className={`text-[12px] text-foreground mb-2.5 ${isAr ? 'text-right' : 'text-left'}`}>
        {isAr ? 'مقترحات اليوم' : 'Daily picks'}
      </h2>
      <div className="space-y-1.5">
        {recommendations.map(({ label, tab, item }, i) => (
          <motion.button
            key={item!.id}
            initial={{ opacity: 0, x: isAr ? 6 : -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate('/library', { state: { tab, itemId: item!.id } })}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/20 active:scale-[0.98] transition-transform ${isAr ? 'text-right' : 'text-left'}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[8px] text-muted-foreground/40 tracking-wide font-light">{label}</p>
              <p className="text-[12px] text-foreground truncate mt-0.5">{item!.title}</p>
            </div>
            <ChevronLeft className={`w-3.5 h-3.5 text-muted-foreground/15 flex-shrink-0 ${isAr ? '' : 'rotate-180'}`} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DailyRecommendations;
