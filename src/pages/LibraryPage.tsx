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
    { key: 'duas', label: 'الأدعية والأذكار', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'tasbih', label: 'التسبيح', icon: <TasbihIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Tab selector */}
      <div className="sticky top-[49px] z-30 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-2 border-b border-border/50">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="library-tab"
                  className="absolute inset-0 rounded-xl islamic-gradient shadow-card"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative flex items-center gap-2 ${
                activeTab === tab.key ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}>
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'duas' ? <DuasPage /> : <TasbihPage />}
    </div>
  );
};

export default LibraryPage;
