import { useQuranTheme, type QuranTheme } from '@/lib/quran-theme';
import { Sun, BookOpen, Moon } from 'lucide-react';

interface Props {
  /** Whether to expose the night option (khatma page). Admin only gets sepia/default. */
  allowNight?: boolean;
  className?: string;
}

/**
 * Compact icon-only theme cycler.
 * Cycles: default → sepia → (night?) → default
 */
const ReadingThemeToggle = ({ allowNight = false, className = '' }: Props) => {
  const [theme, setTheme] = useQuranTheme();

  const order: QuranTheme[] = allowNight
    ? ['default', 'sepia', 'night']
    : ['default', 'sepia'];

  const next = () => {
    const i = order.indexOf(theme);
    setTheme(order[(i + 1) % order.length]);
  };

  const Icon = theme === 'sepia' ? BookOpen : theme === 'night' ? Moon : Sun;
  const label =
    theme === 'sepia' ? 'الوضع: سيبيا' :
    theme === 'night' ? 'الوضع: ليلي' :
    'الوضع: افتراضي';

  return (
    <button
      type="button"
      onClick={next}
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 transition-colors ${className}`}
    >
      <Icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
    </button>
  );
};

export default ReadingThemeToggle;
