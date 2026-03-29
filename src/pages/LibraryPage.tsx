import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Compass } from 'lucide-react';
import DuasPage from './DuasPage';
import TasbihPage from './TasbihPage';
import QiblaPage from './QiblaPage';

const TasbihIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="6" r="2.5" />
    <circle cx="12" cy="12" r="2.5" />
    <circle cx="12" cy="18" r="2.5" />
    <circle cx="6" cy="9" r="2.5" />
    <circle cx="18" cy="9" r="2.5" />
    <circle cx="6" cy="15" r="2.5" />
    <circle cx="18" cy="15" r="2.5" />
  </svg>
);

type Tab = 'duas' | 'tasbih' | 'qibla';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('duas');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'duas', label: 'الأدعية', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'tasbih', label: 'التسبيح', icon: <TasbihIcon className="w-3.5 h-3.5" /> },
    { key: 'qibla', label: 'القبلة', icon: <Compass className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-[42px] z-30 bg-background/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/20">
        <div className="px-4 pt-3 pb-2.5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl islamic-gradient flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">المكتبة</h1>
              <p className="text-[10px] text-muted-foreground">أدعية · تسبيح · قبلة</p>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-secondary/40 rounded-2xl">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="library-tab"
                    className="absolute inset-0 rounded-xl bg-card shadow-card border border-border/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative flex items-center justify-center gap-1 ${
                  activeTab === tab.key ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}>
                  {tab.icon}
                  <span className="text-[12px]">{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'duas' && <DuasPage />}
        {activeTab === 'tasbih' && <TasbihPage />}
        {activeTab === 'qibla' && <QiblaPage />}
      </motion.div>
    </div>
  );
};

export default LibraryPage;
