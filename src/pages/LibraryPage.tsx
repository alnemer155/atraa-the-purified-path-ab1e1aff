import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, Hand } from 'lucide-react';
import DuasPage from './DuasPage';
import TasbihPage from './TasbihPage';
import QiblaPage from './QiblaPage';

type Tab = 'duas' | 'tasbih' | 'qibla';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('duas');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'duas', label: 'الأدعية', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'tasbih', label: 'التسبيح', icon: <Hand className="w-4 h-4" /> },
    { key: 'qibla', label: 'القبلة', icon: <Compass className="w-4 h-4" /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-[42px] z-30 bg-background/60 backdrop-blur-2xl backdrop-saturate-150">
        <div className="px-4 pt-4 pb-3">
          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl islamic-gradient flex items-center justify-center shadow-lg shadow-primary/15">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight tracking-tight">المكتبة</h1>
              <p className="text-[11px] text-muted-foreground font-medium">أدعية · تسبيح · قبلة</p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1.5 p-1.5 bg-secondary/30 backdrop-blur-sm rounded-2xl border border-border/20">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="library-tab"
                    className="absolute inset-0 rounded-xl bg-card shadow-card border border-border/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative flex items-center justify-center gap-1.5 ${
                  activeTab === tab.key ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}>
                  {tab.icon}
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
