import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DuasPage from './DuasPage';
import TasbihPage from './TasbihPage';
import QiblaPage from './QiblaPage';
import MosquesPage from './MosquesPage';

type Tab = 'duas' | 'tasbih' | 'qibla' | 'mosques';

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
    { key: 'tasbih', label: isAr ? 'التسبيح' : 'Tasbih' },
    { key: 'qibla', label: isAr ? 'القبلة' : 'Qibla' },
    { key: 'mosques', label: isAr ? 'المساجد' : 'Mosques' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="sticky top-[41px] z-30 bg-background/85 backdrop-blur-3xl backdrop-saturate-200">
        <div className="px-5 pt-6 pb-3">
          {/* Title row */}
          <div className={`flex items-baseline justify-between mb-5 ${isAr ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="text-[9px] text-muted-foreground/50 font-light tracking-[0.32em] uppercase">
              ATRAA · LIBRARY
            </span>
            <h1 className="text-[24px] text-foreground leading-none tracking-tight font-light">
              {t('library.title')}
            </h1>
          </div>

          {/* Segmented tabs — soft pill highlight */}
          <div className="relative flex items-center gap-1 p-1 rounded-2xl bg-secondary/35 border border-border/20">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex-1 py-2 text-[12px] transition-colors"
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="library-tab-pill"
                    className="absolute inset-0 rounded-xl bg-card shadow-sm border border-border/25"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className={`relative z-10 ${
                  activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground/55'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="h-px mx-5 bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {activeTab === 'duas' && <DuasPage initialItemId={(location.state as { itemId?: string } | null)?.itemId} />}
        {activeTab === 'tasbih' && <TasbihPage />}
        {activeTab === 'qibla' && <QiblaPage />}
        {activeTab === 'mosques' && <MosquesPage />}
      </motion.div>
    </div>
  );
};

export default LibraryPage;
