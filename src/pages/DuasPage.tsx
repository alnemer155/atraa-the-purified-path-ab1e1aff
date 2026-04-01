import { useState, useEffect, useMemo } from 'react';
import { parseDuasContent, type DuaItem } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { ChevronLeft, ChevronRight, Search, X, BookOpen, Landmark, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLastReading } from '@/lib/user';

const categories = [
  { key: 'dua', label: 'الأدعية', icon: BookOpen, color: 'from-primary/12 to-primary/4' },
  { key: 'ziyara', label: 'الزيارات', icon: Landmark, color: 'from-accent/15 to-accent/5' },
  { key: 'dhikr', label: 'الأذكار', icon: Heart, color: 'from-primary/8 to-transparent' },
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

  // ── Reading View ──
  if (selectedItem) {
    const currentIndex = filtered.findIndex(i => i.id === selectedItem.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < filtered.length - 1;

    return (
      <div className="animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
        {/* Top bar */}
        <div className="sticky top-[42px] z-30 bg-background/70 backdrop-blur-2xl px-4 py-3 border-b border-border/15">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedItem(null)} className="flex items-center gap-1.5 text-primary text-sm font-semibold group">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
              رجوع
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className="w-8 h-8 rounded-xl bg-secondary/50 text-foreground text-xs font-bold flex items-center justify-center hover:bg-secondary/70 transition-colors active:scale-95">
                أ−
              </button>
              <button onClick={() => setFontSize(s => Math.min(32, s + 2))}
                className="w-8 h-8 rounded-xl bg-secondary/50 text-foreground text-sm font-bold flex items-center justify-center hover:bg-secondary/70 transition-colors active:scale-95">
                أ+
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-5">
          <div className="mb-5">
            <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/8 px-2.5 py-1 rounded-lg mb-2">
              {categoryLabels[selectedItem.category]}
            </span>
            <h1 className="text-xl font-bold text-foreground leading-snug tracking-tight">{selectedItem.title}</h1>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">المصدر: حقيبة المؤمن</p>
          </div>
          <div
            className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/20 text-foreground whitespace-pre-wrap religious-text leading-[2.4]"
            style={{ fontSize: `${fontSize}px`, fontWeight: 400 }}
          >
            {selectedItem.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="sticky bottom-[76px] px-5 py-3 flex items-center justify-between bg-background/70 backdrop-blur-2xl border-t border-border/15">
          <button onClick={() => hasNext && handleSelectItem(filtered[currentIndex + 1])} disabled={!hasNext}
            className="flex items-center gap-1.5 text-sm text-primary font-semibold disabled:opacity-20 active:scale-95 transition-transform">
            التالي <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground/50 font-bold tabular-nums bg-secondary/30 px-3 py-1 rounded-full">
            {currentIndex + 1} / {filtered.length}
          </span>
          <button onClick={() => hasPrev && handleSelectItem(filtered[currentIndex - 1])} disabled={!hasPrev}
            className="flex items-center gap-1.5 text-sm text-primary font-semibold disabled:opacity-20 active:scale-95 transition-transform">
            <ChevronRight className="w-3.5 h-3.5" /> السابق
          </button>
        </div>
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Category cards */}
      <div className="flex gap-2 mb-4">
        {categories.map(cat => {
          const isActive = activeCategory === cat.key;
          const count = categoryCount(cat.key);
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setSearch(''); }}
              className={`flex-1 py-3 px-2 rounded-2xl text-center transition-all relative overflow-hidden active:scale-[0.97] ${
                isActive
                  ? 'islamic-gradient text-primary-foreground shadow-lg shadow-primary/15'
                  : `bg-gradient-to-b ${cat.color} border border-border/20 text-foreground hover:border-primary/25`
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-primary/60'}`} />
              </div>
              <span className="text-[12px] font-bold block">{cat.label}</span>
              <span className={`text-[9px] font-medium block mt-0.5 ${isActive ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                {count} عنصر
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2.5 bg-card/80 backdrop-blur-sm border border-border/25 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/15 focus-within:border-primary/30 transition-all">
          <Search className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المحتوى..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none font-medium"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-0.5 rounded-full hover:bg-secondary/60 transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground/40" />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-[11px] text-muted-foreground/50 font-medium mb-3">
          {filtered.length} نتيجة {search && `لـ "${search}"`}
        </p>
      )}

      {/* Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-2.5"
        >
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.25 }}
              onClick={() => handleSelectItem(item)}
              className="w-full text-right p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/20 hover:border-primary/25 hover:shadow-md transition-all shadow-sm group active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                    {item.content.slice(0, 100)}...
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-primary/6 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/12 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground/50">لا توجد نتائج</p>
              <p className="text-[11px] text-muted-foreground/30 mt-1">جرّب كلمة بحث مختلفة</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DuasPage;
