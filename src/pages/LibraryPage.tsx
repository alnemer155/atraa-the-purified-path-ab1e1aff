import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import DuasPage from './DuasPage';
import TasbihPage from './TasbihPage';

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

type Tab = 'duas' | 'tasbih';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('duas');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'duas', label: 'الأدعية والأذكار', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'tasbih', label: 'التسبيح', icon: <TasbihIcon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="sticky top-[42px] z-30 bg-background/80 backdrop-blur-2xl backdrop-saturate-150 px-4 pt-3 pb-2 border-b border-border/20">
        <div className="flex gap-1.5 p-1 bg-secondary/50 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="library-tab"
                  className="absolute inset-0 rounded-lg bg-card shadow-card border border-border/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative flex items-center gap-1.5 ${
                activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'duas' ? <DuasPage /> : <TasbihPage />}
    </div>
  );
};

export default LibraryPage;
