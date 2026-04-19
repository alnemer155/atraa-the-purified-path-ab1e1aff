import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DuasPage from './DuasPage';
import TasbihPage from './TasbihPage';
import QiblaPage from './QiblaPage';

type Tab = 'duas' | 'tasbih' | 'qibla';

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
              {isAr ? 'أدعية · تسبيح · قبلة' : 'Duas · Tasbih · Qibla'}
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
        {activeTab === 'tasbih' && <TasbihPage />}
        {activeTab === 'qibla' && <QiblaPage />}
      </motion.div>
    </div>
  );
};

export default LibraryPage;
