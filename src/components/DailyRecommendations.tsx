import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseDuasContent } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { ChevronLeft, Sparkles } from 'lucide-react';

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
      { label: 'دعاء اليوم', item: duas[dayOfYear % Math.max(duas.length, 1)], emoji: '🤲🏻' },
      { label: 'زيارة اليوم', item: ziyarat[dayOfYear % Math.max(ziyarat.length, 1)], emoji: '🕋' },
      { label: 'ذكر اليوم', item: adhkar[dayOfYear % Math.max(adhkar.length, 1)], emoji: '📿' },
    ].filter(r => r.item);
  }, []);

  if (recommendations.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="text-[13px] font-bold text-foreground">مقترحات اليوم</h2>
      </div>
      <div className="space-y-2">
        {recommendations.map(({ label, item, emoji }) => (
          <button
            key={item!.id}
            onClick={() => navigate('/library')}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl glass-card hover:border-primary/30 transition-all text-right active:scale-[0.98] group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/6 flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-105 transition-transform">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-primary font-bold mb-0.5 tracking-wide">{label}</p>
              <p className="text-[13px] font-semibold text-foreground truncate">{item!.title}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/25 flex-shrink-0 group-hover:text-primary/50 group-hover:-translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default DailyRecommendations;
