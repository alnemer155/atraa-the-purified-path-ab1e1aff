import { useState } from 'react';
import { motion } from 'framer-motion';
import DuasPage from './DuasPage';
import TasbihPage from './TasbihPage';
import QiblaPage from './QiblaPage';

type Tab = 'duas' | 'tasbih' | 'qibla';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('duas');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'duas', label: 'الأدعية' },
    { key: 'tasbih', label: 'التسبيح' },
    { key: 'qibla', label: 'القبلة' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-[42px] z-30 bg-background/60 backdrop-blur-2xl backdrop-saturate-150">
        <div className="px-4 pt-4 pb-3">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-lg text-foreground leading-tight tracking-tight">المكتبة</h1>
            <p className="text-[11px] text-muted-foreground font-light">أدعية · تسبيح · قبلة</p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1.5 p-1.5 bg-secondary/30 backdrop-blur-sm rounded-2xl border border-border/20">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex-1 py-3 rounded-xl text-sm transition-all"
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="library-tab"
                    className="absolute inset-0 rounded-xl bg-card shadow-card border border-border/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative flex items-center justify-center ${
                  activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  <span className="text-[12px]">{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-border/15" />
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {activeTab === 'duas' && <DuasPage />}
        {activeTab === 'tasbih' && <TasbihPage />}
        {activeTab === 'qibla' && <QiblaPage />}
      </motion.div>
    </div>
  );
};

export default LibraryPage;
