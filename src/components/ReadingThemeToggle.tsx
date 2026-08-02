import { useQuranTheme, type QuranTheme } from '@/lib/quran-theme';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface Props {
  /** Legacy prop, kept for compatibility. */
  allowNight?: boolean;
  className?: string;
}

const ORDER: QuranTheme[] = ['default', 'muharram', 'rabee', 'ramadan'];

const ICONS: Record<QuranTheme, typeof Sun> = {
  default: Sun,
  muharram: Moon,
  rabee: Sparkles,
  ramadan: Moon,
};

const LABELS: Record<QuranTheme, string> = {
  default: 'افتراضي',
  muharram: 'محرم',
  rabee: 'ربيع',
  ramadan: 'رمضان',
};

/**
 * v2.12.47 — «سيبيا» removed. Default is the primary mode; the toggle
 * cycles through the seasonal moods (default → محرم → ربيع → رمضان).
 */
const ReadingThemeToggle = ({ allowNight, className = '' }: Props) => {
  const [theme, setTheme] = useQuranTheme();
  void allowNight;

  const Icon = ICONS[theme] ?? Sun;

  const next = () => {
    const i = ORDER.indexOf(theme);
    setTheme(ORDER[(i + 1) % ORDER.length]);
  };

  return (
    <button
      type="button"
      onClick={next}
      aria-label={`الوضع: ${LABELS[theme] ?? 'افتراضي'}`}
      title={`الوضع الحالي: ${LABELS[theme] ?? 'افتراضي'}`}
      className={`w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 transition-colors ${className}`}
    >
      <Icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
    </button>
  );
};

export default ReadingThemeToggle;
