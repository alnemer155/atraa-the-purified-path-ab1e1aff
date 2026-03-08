import { useState, useEffect, useMemo } from 'react';
import { parseDuasContent, type DuaItem } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { BookOpen, Star, Heart, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryLabels: Record<string, { label: string; icon: typeof BookOpen }> = {
  dua: { label: 'الأدعية', icon: BookOpen },
  ziyara: { label: 'الزيارات', icon: Star },
  dhikr: { label: 'الأذكار', icon: Heart },
};

const DuasPage = () => {
  const [items, setItems] = useState<DuaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('dua');
  const [selectedItem, setSelectedItem] = useState<DuaItem | null>(null);

  useEffect(() => {
    const parsed = parseDuasContent(duasRaw);
    setItems(parsed);
  }, []);

  const filtered = useMemo(() => items.filter(i => i.category === activeCategory), [items, activeCategory]);

  if (selectedItem) {
    return (
      <div className="animate-fade-in">
        <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-xl px-4 py-3 border-b border-border">
          <button
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-2 text-primary text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            رجوع
          </button>
        </div>
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-foreground mb-4">{selectedItem.title}</h1>
          <div className="bg-card rounded-2xl p-5 shadow-card leading-8 text-foreground text-base whitespace-pre-wrap">
            {selectedItem.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground mb-4">الأدعية والزيارات والأذكار</h1>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        {Object.entries(categoryLabels).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === key
                ? 'islamic-gradient text-primary-foreground shadow-card'
                : 'bg-card border border-border text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedItem(item)}
            className="w-full text-right p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all shadow-card"
          >
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content.slice(0, 100)}...</p>
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">لا توجد عناصر</p>
        )}
      </div>
    </div>
  );
};

export default DuasPage;
