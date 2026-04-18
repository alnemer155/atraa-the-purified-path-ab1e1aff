import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import DuasPage from './DuasPage';
import TasbihPage from './TasbihPage';
import QiblaPage from './QiblaPage';

type Tab = 'duas' | 'tasbih' | 'qibla' | 'quran';

interface AyahOfDay {
  text: string;
  surah: string;
  ayah: number;
}

const AYAH_POOL: AyahOfDay[] = [
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', surah: 'الشرح', ayah: 6 },
  { text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', surah: 'الطلاق', ayah: 2 },
  { text: 'فَاذْكُرُونِي أَذْكُرْكُمْ', surah: 'البقرة', ayah: 152 },
  { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', ayah: 114 },
  { text: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', surah: 'البقرة', ayah: 153 },
  { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', surah: 'آل عمران', ayah: 173 },
  { text: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ', surah: 'الفرقان', ayah: 58 },
];

const QuranPlaceholder = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const ayah = AYAH_POOL[dayOfYear % AYAH_POOL.length];

  return (
    <div className="px-4 py-6 animate-fade-in">
      {/* Ayah of the day */}
      <div className="bg-card border border-border/15 rounded-3xl p-6 text-center mb-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="200" height="200" fill="url(#islamic-pattern)" />
          </svg>
        </div>
        <p className="text-[8px] text-muted-foreground/40 tracking-widest font-light mb-3 uppercase">
          {isAr ? 'آية اليوم' : 'Verse of the day'}
        </p>
        <p className="religious-text text-[18px] text-foreground leading-[2.2] mb-3">
          {ayah.text}
        </p>
        <p className="text-[10px] text-muted-foreground/50 font-light">
          {isAr ? `سورة ${ayah.surah} · الآية ${ayah.ayah}` : `Surah ${ayah.surah} · Ayah ${ayah.ayah}`}
        </p>
      </div>

      {/* Quran coming soon */}
      <div className="bg-card border border-border/15 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-secondary/40 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-foreground/50" />
        </div>
        <p className="text-[14px] text-foreground mb-1.5">
          {isAr ? 'القرآن الكريم' : 'The Holy Quran'}
        </p>
        <p className="text-[11px] text-muted-foreground/50 font-light leading-relaxed">
          {isAr
            ? 'قريباً — قراءة وتلاوة كاملة بترتيب المصحف الشريف'
            : 'Coming soon — Full Quran with original order'}
        </p>
      </div>
    </div>
  );
};

const LibraryPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const location = useLocation();
  const initialTab = (location.state as { tab?: Tab } | null)?.tab || 'duas';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const state = location.state as { tab?: Tab } | null;
    if (state?.tab) setActiveTab(state.tab);
  }, [location.state]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'duas', label: isAr ? 'الأدعية' : 'Duas' },
    { key: 'quran', label: isAr ? 'القرآن' : 'Quran' },
    { key: 'tasbih', label: isAr ? 'التسبيح' : 'Tasbih' },
    { key: 'qibla', label: isAr ? 'القبلة' : 'Qibla' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="sticky top-[41px] z-30 bg-background/80 backdrop-blur-3xl backdrop-saturate-200">
        <div className="px-4 pt-4 pb-3">
          <div className={`mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
            <h1 className="text-lg text-foreground leading-tight tracking-tight">
              {t('library.title')}
            </h1>
            <p className="text-[10px] text-muted-foreground/50 font-light mt-0.5">
              {isAr ? 'قرآن · أدعية · تسبيح · قبلة' : 'Quran · Duas · Tasbih · Qibla'}
            </p>
          </div>

          <div className="flex gap-1 p-1 bg-secondary/25 rounded-2xl">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex-1 py-2.5 rounded-xl text-[12px] transition-all"
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="library-tab"
                    className="absolute inset-0 rounded-xl bg-card border border-border/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative ${
                  activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground/50'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-border/15" />
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {activeTab === 'duas' && <DuasPage initialItemId={(location.state as { itemId?: string } | null)?.itemId} />}
        {activeTab === 'quran' && <QuranPlaceholder />}
        {activeTab === 'tasbih' && <TasbihPage />}
        {activeTab === 'qibla' && <QiblaPage />}
      </motion.div>
    </div>
  );
};

export default LibraryPage;
