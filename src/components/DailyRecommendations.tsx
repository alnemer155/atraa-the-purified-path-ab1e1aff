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
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">مقترحات اليوم</h2>
      </div>
      <div className="space-y-2">
        {recommendations.map(({ label, item, emoji }) => (
          <button
            key={item!.id}
            onClick={() => navigate('/library')}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all shadow-card text-right active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/6 flex items-center justify-center flex-shrink-0 text-lg">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-primary font-semibold mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-foreground truncate">{item!.title}</p>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default DailyRecommendations;
