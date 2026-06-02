import QuranSection from '@/components/quran/QuranSection';
import { isQuranPaused, quranResumeAt } from '@/lib/quran-paused';
import { BookOpenCheck, Clock } from 'lucide-react';

/**
 * Standalone Quran page — accessed from the bottom navigation.
 * Renders the QPC V2 page-by-page Madinah Mushaf reader directly inline,
 * with no surah picker or extra header (the reader provides its own
 * sticky page-info bar).
 *
 * v2.10.50: temporary pause window (02 Jun 2026 → 02 Aug 2026). During this
 * window we render a calm Arabic notice instead of the reader.
 */
const QuranPage = () => {
  if (isQuranPaused()) {
    const resume = quranResumeAt.toLocaleDateString('ar', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    return (
      <div dir="rtl" className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5">
          <BookOpenCheck className="w-5 h-5 text-primary" strokeWidth={1.4} />
        </div>
        <h1 className="text-[18px] font-light text-foreground leading-snug max-w-sm">
          القرآن الكريم في فترة صيانة وتحسين
        </h1>
        <p className="text-[12px] text-muted-foreground/80 font-light leading-relaxed mt-3 max-w-sm">
          نعمل حالياً على تطوير قسم القرآن الكريم ليكون بأفضل صورة وأخفّ تجربة قراءة. سيعود تلقائياً للجميع دون أي إجراء منكم.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-3.5 h-9 rounded-full bg-secondary/40 border border-border/30 text-[11px] text-foreground/85">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" strokeWidth={1.6} />
          <span className="font-light">يعود في {resume}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <QuranSection />
    </div>
  );
};

export default QuranPage;
