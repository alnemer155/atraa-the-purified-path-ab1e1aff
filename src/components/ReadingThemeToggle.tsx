import { useQuranTheme, type QuranTheme } from '@/lib/quran-theme';
import { Sun, BookOpen, Moon, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  /** Whether to expose the night option (khatma page). Admin only gets sepia/default. */
  allowNight?: boolean;
  className?: string;
}

/**
 * Sepia is the canonical Atraa reading theme. The other modes
 * (default & night) are temporarily locked behind a "maintenance"
 * notice per spec; tapping them shows a toast instead of switching.
 *
 * The icon reflects the *currently active* theme (always sepia for now)
 * and a small lock dot signals that other modes are unavailable.
 */
const ReadingThemeToggle = ({ allowNight = false, className = '' }: Props) => {
  const [theme, setTheme] = useQuranTheme();

  // Force sepia on first paint if user is on a non-sepia (now-locked) mode.
  if (theme !== 'sepia') {
    setTheme('sepia');
  }

  const Icon = theme === 'default' ? Sun : BookOpen;

  const handleClick = () => {
    toast({ title: 'مُقفل مؤقتاً', description: 'الوضع الحالي: سيبيا' });
  };

  // `allowNight` kept in signature for compatibility; locked regardless.
  void allowNight;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="الوضع: سيبيا (الأوضاع الأخرى مقفولة)"
      title="الأوضاع الأخرى قيد الصيانة"
      className={`relative w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 transition-colors ${className}`}
    >
      <Icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
      <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-background border border-border/40 flex items-center justify-center">
        <Lock className="w-2 h-2 text-muted-foreground" strokeWidth={2} />
      </span>
    </button>
  );
};

export default ReadingThemeToggle;
