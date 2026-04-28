import { useState, useEffect, useMemo } from 'react';
import { parseDuasContent, type DuaItem } from '@/lib/duas-parser';
import duasRaw from '@/data/duas-content.txt?raw';
import { SUNNI_CONTENT } from '@/data/sunni-content';
import { useMadhhab } from '@/lib/madhhab';
import { ChevronLeft, Search, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLastReading } from '@/lib/user';
import DuaReader from '@/components/DuaReader';
import SmartText from '@/components/SmartText';

const ALL_CATEGORIES = [
  { key: 'dua', label: 'الأدعية' },
  { key: 'ziyara', label: 'الزيارات' },
  { key: 'dhikr', label: 'الأذكار' },
];

interface DuasPageProps {
  initialItemId?: string;
}

const DuasPage = ({ initialItemId }: DuasPageProps = {}) => {
  const madhhab = useMadhhab();
  // Sunni users do not have a ziyara category — hide that tab entirely.
  const categories = madhhab === 'sunni'
    ? ALL_CATEGORIES.filter(c => c.key !== 'ziyara')
    : ALL_CATEGORIES;
  const [items, setItems] = useState<DuaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('dua');
  const [selectedItem, setSelectedItem] = useState<DuaItem | null>(null);
  const [search, setSearch] = useState('');
  const [fontSize, setFontSize] = useState(18);

  // Reset to a valid category if the active one is no longer available.
  useEffect(() => {
    if (!categories.some(c => c.key === activeCategory)) setActiveCategory('dua');
  }, [categories, activeCategory]);

  useEffect(() => {
    // Shia → use the full curated Shia library shipped with the app.
    // Sunni → use the curated Sunni starter set from trusted sources.
    const parsed = madhhab === 'sunni' ? SUNNI_CONTENT : parseDuasContent(duasRaw);
    setItems(parsed);
    if (initialItemId) {
      const found = parsed.find(p => p.id === initialItemId);
      if (found) {
        setActiveCategory(found.category);
        setSelectedItem(found);
      }
    }
  }, [initialItemId, madhhab]);

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
    return <DuaReader
      item={selectedItem}
      filtered={filtered}
      fontSize={fontSize}
      setFontSize={setFontSize}
      onClose={() => setSelectedItem(null)}
      onSelect={handleSelectItem}
    />;
  }

  return (
    <div className="px-4 py-5 animate-fade-in">
      {madhhab === 'sunni' && (
        <div className="mb-4 p-3.5 rounded-2xl bg-secondary/30 border border-border/20 flex items-start gap-2.5">
          <Info className="w-3.5 h-3.5 text-muted-foreground/70 mt-0.5 flex-shrink-0" strokeWidth={1.6} />
          <div className="flex-1 space-y-1.5">
            <p className="text-[11.5px] text-foreground/85 leading-relaxed" style={{ fontWeight: 400 }}>
              مجموعة مختصرة من المصادر السنية المعتمدة
            </p>
            <p className="text-[10.5px] text-muted-foreground/70 font-light leading-relaxed">
              <span className="text-foreground/75">المصادر الموثوقة:</span> صحيح البخاري · صحيح مسلم · حصن المسلم (سعيد بن علي القحطاني) · رياض الصالحين والأذكار (الإمام النووي) · سنن الترمذي · سنن أبي داود.
            </p>
            <p className="text-[10px] text-muted-foreground/65 font-light leading-relaxed">
              <span className="text-foreground/70">إخلاء مسؤولية:</span> هذا المحتوى للقراءة والتذكير الشخصي فقط، وليس فتوى. المرجع في الأحكام والمسائل التكليفية هو أهل العلم المعتمَدون في بلدك. مزيد من المحتوى يُضاف تباعاً بعد المراجعة.
            </p>
          </div>
        </div>
      )}

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
                  <SmartText as="p" className="text-[12px] text-foreground leading-snug" iconSize={13}>{item.title}</SmartText>
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
