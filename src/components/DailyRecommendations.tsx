import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseDuasContent } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';

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
      <h2 className="text-sm font-semibold text-foreground mb-3">مقترحات اليوم</h2>
      <div className="space-y-2">
        {recommendations.map(({ label, item }) => (
          <button
            key={item!.id}
            onClick={() => navigate('/duas')}
            className="w-full text-right p-3.5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all shadow-card"
          >
            <p className="text-[11px] text-primary font-medium mb-1">{label}</p>
            <p className="text-sm font-semibold text-foreground">{item!.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
              {item!.content.slice(0, 80)}...
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DailyRecommendations;
