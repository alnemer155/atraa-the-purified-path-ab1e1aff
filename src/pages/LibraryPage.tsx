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
      <div className="sticky top-[41px] z-30 bg-background/85 backdrop-blur-3xl backdrop-saturate-200">
        <div className="px-5 pt-5 pb-3">
          {/* Title row — single line, refined hairline */}
          <div className={`flex items-baseline justify-between mb-4 ${isAr ? 'flex-row' : 'flex-row-reverse'}`}>
            <span className="text-[9px] text-muted-foreground/40 font-light tracking-[0.18em] uppercase tabular-nums">
              {isAr ? '٠٣ أقسام' : '03 sections'}
            </span>
            <h1 className="text-[22px] text-foreground leading-none tracking-tight font-light">
              {t('library.title')}
            </h1>
          </div>

          {/* Underlined segmented tabs */}
          <div className="relative flex items-center justify-between border-b border-border/15">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex-1 py-3 text-[12px] transition-colors"
              >
                <span className={`relative z-10 ${
                  activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground/45'
                }`}>
                  {tab.label}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="library-tab-underline"
                    className="absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] w-8 bg-foreground rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
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
