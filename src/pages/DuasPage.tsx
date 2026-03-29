import { useState, useEffect, useMemo } from 'react';
import { parseDuasContent, type DuaItem } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLastReading } from '@/lib/user';

const categoryLabels: Record<string, string> = {
  dua: 'الأدعية',
  ziyara: 'الزيارات',
  dhikr: 'الأذكار',
};

const categoryCount = (items: DuaItem[], cat: string) => items.filter(i => i.category === cat).length;

const DuasPage = () => {
  const [items, setItems] = useState<DuaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('dua');
  const [selectedItem, setSelectedItem] = useState<DuaItem | null>(null);
  const [search, setSearch] = useState('');
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    const parsed = parseDuasContent(duasRaw);
    setItems(parsed);
  }, []);

  const filtered = useMemo(() => {
    let result = items.filter(i => i.category === activeCategory);
    if (search.trim()) {
      const q = search.trim();
      result = result.filter(i => i.title.includes(q) || i.content.includes(q));
    }
    return result;
  }, [items, activeCategory, search]);

  const handleSelectItem = (item: DuaItem) => {
    setSelectedItem(item);
    saveLastReading({
      id: item.id,
      title: item.title,
      category: item.category,
      timestamp: Date.now(),
    });
  };

  if (selectedItem) {
    const currentIndex = filtered.findIndex(i => i.id === selectedItem.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < filtered.length - 1;

    return (
      <div className="animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
        <div className="sticky top-[42px] z-30 bg-background/80 backdrop-blur-2xl px-4 py-2.5 border-b border-border/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedItem(null)}
              className="flex items-center gap-1 text-primary text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              رجوع
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className="w-7 h-7 rounded-lg bg-secondary/60 text-foreground text-xs font-bold flex items-center justify-center"
              >
                أ-
              </button>
              <button
                onClick={() => setFontSize(s => Math.min(32, s + 2))}
                className="w-7 h-7 rounded-lg bg-secondary/60 text-foreground text-sm font-bold flex items-center justify-center"
              >
                أ+
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4">
          <h1 className="text-lg font-bold text-foreground mb-0.5">{selectedItem.title}</h1>
          <p className="text-[11px] text-primary font-medium mb-1">{categoryLabels[selectedItem.category]}</p>
          <p className="text-[10px] text-muted-foreground mb-4">المصدر من تطبيق حقيبة المؤمن</p>
          <div
            className="bg-card rounded-2xl p-5 shadow-card border border-border/30 text-foreground whitespace-pre-wrap religious-text"
            style={{ fontSize: `${fontSize}px`, fontWeight: 400 }}
          >
            {selectedItem.content}
          </div>
        </div>

        <div className="sticky bottom-[76px] px-4 py-2.5 flex items-center justify-between bg-background/80 backdrop-blur-2xl border-t border-border/20">
          <button
            onClick={() => hasNext && handleSelectItem(filtered[currentIndex + 1])}
            disabled={!hasNext}
            className="flex items-center gap-1 text-sm text-primary font-medium disabled:opacity-25"
          >
            التالي
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground font-medium">{currentIndex + 1} / {filtered.length}</span>
          <button
            onClick={() => hasPrev && handleSelectItem(filtered[currentIndex - 1])}
            disabled={!hasPrev}
            className="flex items-center gap-1 text-sm text-primary font-medium disabled:opacity-25"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            السابق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 animate-fade-in">
      <h1 className="text-lg font-bold text-foreground mb-3">الأدعية والزيارات والأذكار</h1>

      <div className="flex gap-1.5 mb-3">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setActiveCategory(key); setSearch(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
              activeCategory === key
                ? 'islamic-gradient text-primary-foreground shadow-card'
                : 'bg-card border border-border/40 text-foreground'
            }`}
          >
            {label}
            <span className={`block text-[9px] mt-0.5 ${activeCategory === key ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
              {categoryCount(items, key)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-card border border-border/30 rounded-xl px-3 py-2.5 mb-3 shadow-card">
        <Search className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في المحتوى..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-2"
        >
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              onClick={() => handleSelectItem(item)}
              className="w-full text-right p-3.5 rounded-2xl bg-card border border-border/30 hover:border-primary/25 transition-all shadow-card group active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {item.content.slice(0, 120)}...
                  </p>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">لا توجد نتائج</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DuasPage;
