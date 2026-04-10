import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseDuasContent } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyRecommendations = () => {
  const navigate = useNavigate();

  const recommendations = useMemo(() => {
    const items = parseDuasContent(duasRaw);
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

    const duas = items.filter(i => i.category === 'dua');
    const ziyarat = items.filter(i => i.category === 'ziyara');
    const adhkar = items.filter(i => i.category === 'dhikr');

    return [
      { label: 'دعاء اليوم', item: duas[dayOfYear % Math.max(duas.length, 1)] },
      { label: 'زيارة اليوم', item: ziyarat[dayOfYear % Math.max(ziyarat.length, 1)] },
      { label: 'ذكر اليوم', item: adhkar[dayOfYear % Math.max(adhkar.length, 1)] },
    ].filter(r => r.item);
  }, []);

  if (recommendations.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3.5">
        <h2 className="text-sm text-foreground">مقترحات اليوم</h2>
      </div>
      <div className="space-y-2.5">
        {recommendations.map(({ label, item }, i) => (
          <motion.button
            key={item!.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate('/library')}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-border/20 hover:border-primary/30 transition-all text-right active:scale-[0.98] group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-primary tracking-wide">{label}</p>
              <p className="text-[13px] text-foreground truncate mt-0.5">{item!.title}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/20 flex-shrink-0 group-hover:text-primary/50 transition-all" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DailyRecommendations;
