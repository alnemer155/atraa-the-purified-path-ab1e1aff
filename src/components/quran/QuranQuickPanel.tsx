/**
 * Unified quick-access sheet for the Quran reader. A single bottom sheet
 * with four tabs:
 *   1. Surahs   — full 114-surah index, jump on tap.
 *   2. Jump     — page / juz / hizb numeric jump.
 *   3. Marks    — colored ayah marks (managed in quran-bookmarks).
 *   4. Display  — orientation + reading theme (default / sepia / night).
 *
 * Designed for one-handed mobile use: tab switch is a single tap, every
 * row has a >40px touch target, and the sheet drags down to dismiss.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, BookOpen, Hash, Bookmark, Palette,
  Sun, Moon, Coffee, RectangleHorizontal, RectangleVertical, Trash2,
} from 'lucide-react';
import {
  toArabicNumerals,
} from '@/lib/quran-page';
import {
  stripArabicDiacritics,
  JUZ_STARTS,
  HIZB_STARTS,
} from '@/lib/quran-meta';
import {
  getAllAyahColors,
  clearAyahColor,
  AYAH_COLOR_TOKENS,
  type AyahColor,
} from '@/lib/quran-bookmarks';
import type { QuranTheme } from '@/lib/quran-theme';

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

type Orientation = 'vertical' | 'horizontal';
type Tab = 'surahs' | 'jump' | 'marks' | 'display';

interface Props {
  open: boolean;
  onClose: () => void;
  surahsByNumber: Map<number, SurahMeta>;
  /** Map for resolving surah → starting page. */
  surahStartPages: Record<number, number>;
  currentPage: number;
  onJumpToPage: (page: number) => void;
  onJumpToSurah: (surahNumber: number) => void;
  /** Ayah jump = navigate to the page containing the ayah, then highlight. */
  onJumpToAyah?: (surah: number, ayah: number) => void;

  orientation: Orientation;
  onOrientationChange: (o: Orientation) => void;

  theme: QuranTheme;
  onThemeChange: (t: QuranTheme) => void;
}

const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: 'surahs',  label: 'السور',   icon: BookOpen },
  { id: 'jump',    label: 'انتقال',  icon: Hash },
  { id: 'marks',   label: 'العلامات', icon: Bookmark },
  { id: 'display', label: 'العرض',   icon: Palette },
];

const QuranQuickPanel = ({
  open,
  onClose,
  surahsByNumber,
  surahStartPages,
  currentPage,
  onJumpToPage,
  onJumpToSurah,
  orientation,
  onOrientationChange,
  theme,
  onThemeChange,
}: Props) => {
  const [tab, setTab] = useState<Tab>('surahs');
  const [search, setSearch] = useState('');
  const [pageInput, setPageInput] = useState('');
  const [colorMapVersion, setColorMapVersion] = useState(0);

  const surahs = useMemo(() => Array.from(surahsByNumber.values()), [surahsByNumber]);

  const filteredSurahs = useMemo(() => {
    const q = search.trim();
    if (!q) return surahs;
    const normQ = stripArabicDiacritics(q).toLowerCase();
    return surahs.filter(s => {
      const ar = stripArabicDiacritics(s.name).toLowerCase();
      const en = s.englishName.toLowerCase();
      return ar.includes(normQ) || en.includes(normQ) || String(s.number) === q;
    });
  }, [surahs, search]);

  const colorMarks = useMemo(() => {
    // colorMapVersion is in deps to force refresh after deletions
    void colorMapVersion;
    const map = getAllAyahColors();
    return Object.entries(map).map(([k, color]) => {
      const [surah, ayah] = k.split(':').map(Number);
      return { surah, ayah, color: color as AyahColor };
    }).sort((a, b) => a.surah !== b.surah ? a.surah - b.surah : a.ayah - b.ayah);
  }, [colorMapVersion]);

  const handlePageJump = () => {
    const n = parseInt(pageInput, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 604) {
      onJumpToPage(n);
      onClose();
      setPageInput('');
    }
  };

  const close = () => { setSearch(''); setPageInput(''); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={close}
          dir="rtl"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => { if (info.offset.y > 110) close(); }}
            className="w-full max-w-md bg-card rounded-t-3xl border-t border-border/30 shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-border/60" />
            </div>

            {/* Tabs */}
            <div className="px-3 pt-2 pb-3 border-b border-border/15">
              <div className="grid grid-cols-4 gap-1 bg-secondary/40 rounded-2xl p-1">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                      tab === t.id ? 'text-primary-foreground' : 'text-foreground/60'
                    }`}
                    aria-label={t.label}
                  >
                    {tab === t.id && (
                      <motion.div
                        layoutId="quick-tab-pill"
                        className="absolute inset-0 bg-primary rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <t.icon className="w-3.5 h-3.5 relative" strokeWidth={1.7} />
                    <span className="text-[9.5px] font-light relative">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {tab === 'surahs' && (
                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.6} />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="ابحث عن سورة…"
                      className="w-full h-10 pr-9 pl-3 rounded-2xl bg-secondary/40 border border-border/20 text-[12px] text-foreground outline-none focus:border-primary/40"
                    />
                  </div>
                  <div className="space-y-0.5">
                    {filteredSurahs.length === 0 ? (
                      <p className="text-center text-[11px] text-muted-foreground/60 font-light py-8">
                        لا توجد نتائج
                      </p>
                    ) : filteredSurahs.map(s => {
                      const startPage = surahStartPages[s.number];
                      const cleanName = s.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '');
                      return (
                        <button
                          key={s.number}
                          onClick={() => { onJumpToSurah(s.number); close(); }}
                          className="w-full px-3 py-2.5 flex items-center gap-3 rounded-xl active:bg-secondary/50 transition-colors"
                        >
                          <span className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center text-[10px] text-gold tabular-nums shrink-0">
                            {toArabicNumerals(s.number)}
                          </span>
                          <span className="text-[14px] text-foreground flex-1 text-right" style={{ fontWeight: 400 }}>
                            {cleanName}
                          </span>
                          <span className="text-[9.5px] text-muted-foreground/65 font-light tabular-nums whitespace-nowrap">
                            {s.revelationType === 'Medinan' ? 'مدنية' : 'مكية'} · {toArabicNumerals(s.numberOfAyahs)}
                          </span>
                          {startPage && (
                            <span className="text-[9px] text-muted-foreground/55 font-light tabular-nums whitespace-nowrap">
                              ص {toArabicNumerals(startPage)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === 'jump' && (
                <div className="p-4 space-y-5">
                  <div>
                    <p className="text-[11px] text-muted-foreground/70 font-light mb-2">
                      الصفحة (١ – ٦٠٤) · أنت في {toArabicNumerals(currentPage)}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        max={604}
                        value={pageInput}
                        onChange={e => setPageInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handlePageJump()}
                        placeholder={String(currentPage)}
                        className="flex-1 h-11 rounded-2xl bg-secondary/40 border border-border/20 text-center text-[14px] text-foreground tabular-nums outline-none focus:border-primary/40"
                      />
                      <button
                        onClick={handlePageJump}
                        disabled={!pageInput}
                        className="px-5 h-11 rounded-2xl bg-primary text-primary-foreground text-[12px] active:scale-95 disabled:opacity-40"
                      >
                        انتقال
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground/70 font-light mb-2">الأجزاء (٣٠)</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {JUZ_STARTS.map(j => (
                        <button
                          key={j.juz}
                          onClick={() => { onJumpToSurah(j.surah); close(); }}
                          className="h-10 rounded-xl bg-secondary/40 active:scale-95 active:bg-secondary/60 transition-all flex flex-col items-center justify-center"
                          aria-label={j.nameAr}
                        >
                          <span className="text-[11px] text-foreground/85 tabular-nums leading-none">
                            {toArabicNumerals(j.juz)}
                          </span>
                          <span className="text-[7px] text-muted-foreground/55 font-light leading-none mt-0.5">جزء</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground/70 font-light mb-2">الأحزاب (٦٠)</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {HIZB_STARTS.map(h => (
                        <button
                          key={h.hizb}
                          onClick={() => { onJumpToSurah(h.surah); close(); }}
                          className="h-9 rounded-lg bg-secondary/40 active:scale-95 active:bg-secondary/60 transition-all text-[10.5px] text-foreground/80 tabular-nums"
                        >
                          {toArabicNumerals(h.hizb)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'marks' && (
                <div className="p-3">
                  {colorMarks.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <Bookmark className="w-7 h-7 text-foreground/25 mx-auto mb-3" strokeWidth={1.4} />
                      <p className="text-[12px] text-foreground/75 font-medium mb-1">لا توجد علامات</p>
                      <p className="text-[10.5px] text-muted-foreground/65 font-light leading-relaxed">
                        اضغط على رقم الآية أثناء القراءة لإضافة علامة ملوّنة.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {colorMarks.map(m => {
                        const meta = surahsByNumber.get(m.surah);
                        const tokens = AYAH_COLOR_TOKENS[m.color];
                        const cleanName = meta?.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '') ?? '';
                        return (
                          <div
                            key={`${m.surah}:${m.ayah}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl active:bg-secondary/40 transition-colors"
                          >
                            <button
                              onClick={() => { onJumpToSurah(m.surah); close(); }}
                              className="flex-1 flex items-center gap-3 text-right active:scale-[0.98] transition-transform"
                            >
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[9.5px] tabular-nums shrink-0"
                                style={{
                                  background: `hsl(${tokens.bg})`,
                                  color: `hsl(${tokens.text})`,
                                  boxShadow: `0 0 0 1.5px hsl(${tokens.ring} / 0.6)`,
                                }}
                              >
                                {toArabicNumerals(m.ayah)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="surah-name-display text-[13px] text-foreground truncate">
                                  {cleanName}
                                </p>
                                <p className="text-[9.5px] text-muted-foreground/65 font-light tabular-nums">
                                  الآية {toArabicNumerals(m.ayah)}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                clearAyahColor(m.surah, m.ayah);
                                setColorMapVersion(v => v + 1);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center active:bg-destructive/15 active:scale-90 transition-all"
                              aria-label="حذف العلامة"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground/55" strokeWidth={1.6} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === 'display' && (
                <div className="p-4 space-y-5">
                  <div>
                    <p className="text-[11px] text-muted-foreground/70 font-light mb-2">اتجاه التصفّح</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOrientationChange('horizontal')}
                        className={`h-12 rounded-2xl text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-colors ${
                          orientation === 'horizontal' ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/75'
                        }`}
                      >
                        <RectangleHorizontal className="w-3.5 h-3.5" strokeWidth={1.6} />
                        <span>أفقي (مصحف)</span>
                      </button>
                      <button
                        onClick={() => onOrientationChange('vertical')}
                        className={`h-12 rounded-2xl text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-colors ${
                          orientation === 'vertical' ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/75'
                        }`}
                      >
                        <RectangleVertical className="w-3.5 h-3.5" strokeWidth={1.6} />
                        <span>عمودي</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground/70 font-light mb-2">وضع القراءة</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'default' as const, label: 'افتراضي', icon: Sun },
                        { id: 'sepia'   as const, label: 'سيبيا',   icon: Coffee },
                        { id: 'night'   as const, label: 'ليلي',    icon: Moon },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => onThemeChange(opt.id)}
                          className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-colors ${
                            theme === opt.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/75'
                          }`}
                        >
                          <opt.icon className="w-4 h-4" strokeWidth={1.6} />
                          <span className="text-[10.5px]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground/55 font-light leading-relaxed mt-2">
                      وضع السيبيا يُقلّل إجهاد العين أثناء القراءة الطويلة، والوضع الليلي مناسب للإضاءة المنخفضة جداً.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer close */}
            <div className="px-3 pt-2 pb-3 border-t border-border/15 flex justify-center">
              <button
                onClick={close}
                className="h-10 px-6 rounded-2xl bg-secondary/40 active:scale-95 flex items-center gap-2 text-[12px] text-foreground/75"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>إغلاق</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuranQuickPanel;
