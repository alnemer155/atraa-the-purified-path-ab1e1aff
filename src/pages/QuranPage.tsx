import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QuranSection from '@/components/quran/QuranSection';

/**
 * Standalone Quran page — accessed from the bottom navigation.
 * Wraps QuranSection with a Heritage-styled illuminated header.
 */
const QuranPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="animate-fade-in">
      {/* Illuminated Heritage header */}
      <div className="sticky top-[41px] z-30 bg-background/80 backdrop-blur-3xl backdrop-saturate-200">
        <div className="px-4 pt-4 pb-3 relative">
          {/* Subtle Heritage pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="quran-header-pattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M16 2 L30 16 L16 30 L2 16 Z" fill="none" stroke="currentColor" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="400" height="80" fill="url(#quran-header-pattern)" />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative ${isAr ? 'text-right' : 'text-left'}`}
          >
            <h1 className="text-lg text-foreground leading-tight tracking-tight">
              {isAr ? 'القرآن الكريم' : 'The Holy Quran'}
            </h1>
            <p className="text-[10px] text-muted-foreground/55 font-light mt-0.5 tracking-wide">
              {isAr
                ? '١١٤ سورة · بالرسم العثماني'
                : '114 surahs · Uthmani script'}
            </p>
          </motion.div>
        </div>
        <div className="h-px bg-border/15" />
      </div>

      <QuranSection />
    </div>
  );
};

export default QuranPage;
