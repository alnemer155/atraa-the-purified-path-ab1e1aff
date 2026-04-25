import QuranSection from '@/components/quran/QuranSection';

/**
 * Standalone Quran page — accessed from the bottom navigation.
 * Renders the QPC V2 page-by-page Madinah Mushaf reader directly inline,
 * with no surah picker or extra header (the reader provides its own
 * sticky page-info bar).
 */
const QuranPage = () => {
  return (
    <div className="animate-fade-in">
      <QuranSection />
    </div>
  );
};

export default QuranPage;
