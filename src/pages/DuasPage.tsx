import { useState, useEffect, useMemo } from 'react';
import { parseDuasContent, type DuaItem } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLastReading } from '@/lib/user';

const categories = [
  { key: 'dua', label: 'الأدعية' },
  { key: 'ziyara', label: 'الزيارات' },
  { key: 'dhikr', label: 'الأذكار' },
];

const categoryLabels: Record<string, string> = { dua: 'الأدعية', ziyara: 'الزيارات', dhikr: 'الأذكار' };

const DuasPage = () => {
  const [items, setItems] = useState<DuaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('dua');
  const [selectedItem, setSelectedItem] = useState<DuaItem | null>(null);
  const [search, setSearch] = useState('');
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => { setItems(parseDuasContent(duasRaw)); }, []);

  const filtered = useMemo(() => {
    let result = items.filter(i => i.category === activeCategory);
    if (search.trim()) {
      const q = search.trim();
      result = result.filter(i => i.title.includes(q) || i.content.includes(q));
    }
    return result;
  }, [items, activeCategory, search]);

  const categoryCount = (cat: string) => items.filter(i => i.category === cat).length;

  const handleSelectItem = (item: DuaItem) => {
    setSelectedItem(item);
    saveLastReading({ id: item.id, title: item.title, category: item.category, timestamp: Date.now() });
  };

  if (selectedItem) {
    const currentIndex = filtered.findIndex(i => i.id === selectedItem.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < filtered.length - 1;

    return (
      <div className="animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
        <div className="sticky top-[42px] z-30 bg-background/80 backdrop-blur-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedItem(null)} className="flex items-center gap-1 text-primary text-[13px]">
              <ChevronRight className="w-4 h-4" />
              رجوع
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className="w-8 h-8 rounded-xl bg-secondary/30 text-foreground text-[11px] flex items-center justify-center active:scale-95 transition-transform">
                أ−
              </button>
              <button onClick={() => setFontSize(s => Math.min(32, s + 2))}
                className="w-8 h-8 rounded-xl bg-secondary/30 text-foreground text-[13px] flex items-center justify-center active:scale-95 transition-transform">
                أ+
              </button>
            </div>
          </div>
          <div className="h-px bg-border/10 mt-3 -mx-4" />
        </div>

        <div className="flex-1 px-5 py-5">
          <div className="mb-5">
            <span className="text-[9px] text-primary/60 tracking-wider font-light">
              {categoryLabels[selectedItem.category]}
            </span>
            <h1 className="text-xl text-foreground leading-snug tracking-tight mt-1">{selectedItem.title}</h1>
            <p className="text-[9px] text-muted-foreground/40 mt-1.5 font-light">المصدر: حقيبة المؤمن</p>
          </div>
          <div
            className="bg-card rounded-3xl p-6 border border-border/15 text-foreground whitespace-pre-wrap religious-text leading-[2.4]"
            style={{ fontSize: `${fontSize}px`, fontWeight: 400 }}
          >
            {selectedItem.content}
          </div>
        </div>

        <div className="sticky bottom-[76px] px-5 py-3 flex items-center justify-between bg-background/80 backdrop-blur-3xl">
          <button onClick={() => hasNext && handleSelectItem(filtered[currentIndex + 1])} disabled={!hasNext}
            className="flex items-center gap-1 text-[12px] text-primary disabled:opacity-20 active:scale-95 transition-transform">
            التالي <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] text-muted-foreground/40 tabular-nums">
            {currentIndex + 1} / {filtered.length}
          </span>
          <button onClick={() => hasPrev && handleSelectItem(filtered[currentIndex - 1])} disabled={!hasPrev}
            className="flex items-center gap-1 text-[12px] text-primary disabled:opacity-20 active:scale-95 transition-transform">
            <ChevronRight className="w-3.5 h-3.5" /> السابق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 animate-fade-in">
      <div className="flex gap-1.5 mb-4">
        {categories.map(cat => {
          const isActive = activeCategory === cat.key;
          const count = categoryCount(cat.key);
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setSearch(''); }}
              className={`flex-1 py-3 px-2 rounded-2xl text-center transition-all active:scale-[0.97] ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'bg-card border border-border/20 text-foreground'
              }`}
            >
              <span className="text-[11px] block">{cat.label}</span>
              <span className={`text-[8px] font-light block mt-0.5 ${isActive ? 'text-background/50' : 'text-muted-foreground/40'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-4">
        <div className="flex items-center gap-2.5 bg-card border border-border/20 rounded-2xl px-4 py-2.5 focus-within:border-primary/20 transition-colors">
          <Search className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث..."
            className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/30 outline-none font-light"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-0.5">
              <X className="w-3 h-3 text-muted-foreground/30" />
            </button>
          )}
        </div>
      </div>

      {search && (
        <p className="text-[10px] text-muted-foreground/40 font-light mb-3">
          {filtered.length} نتيجة
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="space-y-1.5"
        >
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.25), duration: 0.2 }}
              onClick={() => handleSelectItem(item)}
              className="w-full text-right p-3.5 rounded-2xl bg-card border border-border/15 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground leading-snug">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground/40 mt-1 line-clamp-1 leading-relaxed font-light">
                    {item.content.slice(0, 80)}...
                  </p>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/15 flex-shrink-0 mt-0.5" />
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[13px] text-muted-foreground/40">لا توجد نتائج</p>
              <p className="text-[10px] text-muted-foreground/25 mt-1 font-light">جرّب كلمة بحث مختلفة</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DuasPage;
