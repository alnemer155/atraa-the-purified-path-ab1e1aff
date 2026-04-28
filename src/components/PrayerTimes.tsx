import { useState, useEffect } from 'react';
import { ChevronDown, X, SlidersHorizontal, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useMadhhab } from '@/lib/madhhab';
import {
  SUNNI_METHODS,
  SHIA_METHOD,
  getStoredMethod,
  setStoredMethod,
  resolveMethod,
  CALC_METHOD_EVENT,
  type StoredMethod,
} from '@/lib/calculation-method';

interface TimingsData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
  [k: string]: string;
}

interface CityCoords {
  lat: number;
  lng: number;
}

function to12Hour(time24: string, lang: string): string {
  if (!time24) return '—';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

function toMinutes(time24: string): number {
  if (!time24) return 0;
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}

// On the home grid we surface only the three pillars users glance at most:
// Fajr, Dhuhr (Dhuhrayn), Maghrib (Isha'ayn). Asr/Sunrise/Isha live in the sheet.
const HOME_PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Maghrib'];
const ALL_PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function getCurrentAndNext(timings: TimingsData, keys: string[]): { current: string | null; next: string | null } {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const times = keys.map(k => ({ key: k, minutes: toMinutes(timings[k]?.split(' ')[0] || '0:0') }));

  let current: string | null = null;
  let next: string | null = null;

  for (let i = times.length - 1; i >= 0; i--) {
    if (nowMinutes >= times[i].minutes) {
      current = times[i].key;
      next = i + 1 < times.length ? times[i + 1].key : null;
      break;
    }
  }
  if (!current) next = times[0]?.key || null;
  return { current, next };
}

function getStoredCoords(): CityCoords {
  try {
    const raw = localStorage.getItem('atraa_city_coords');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { lat: 26.5196, lng: 50.0115 };
}

const PrayerTimes = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const madhhab = useMadhhab();
  const [timings, setTimings] = useState<TimingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<{ current: string | null; next: string | null }>({ current: null, next: null });
  const [coords, setCoords] = useState<CityCoords>(getStoredCoords);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [methodSheet, setMethodSheet] = useState(false);
  const [storedMethod, setStoredMethodState] = useState<StoredMethod>(getStoredMethod);

  useEffect(() => {
    const fetchTimings = (c: CityCoords) => {
      // Pick calculation method based on madhhab + user preference.
      // Shia → always 7 (Ja'fari, University of Tehran). Sunni → user choice / 'auto'.
      const method = resolveMethod(madhhab);
      const url = `https://api.aladhan.com/v1/timings?latitude=${c.lat}&longitude=${c.lng}&method=${method}&school=0`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const tt = data.data.timings as TimingsData;
          setTimings(tt);
          setIndicators(getCurrentAndNext(tt, ALL_PRAYER_KEYS));
          setLoading(false);
          // Schedule native iOS/Android adhan reminders (no-op on web).
          if (localStorage.getItem('atraa_notif_adhan') === 'true') {
            import('@/lib/notifications-ios').then(({ scheduleIosAdhanNotifications }) => {
              scheduleIosAdhanNotifications(tt, { lang: i18n.language === 'en' ? 'en' : 'ar' }).catch(() => {});
            }).catch(() => {});
          }
        })
        .catch(() => setLoading(false));
    };

    fetchTimings(coords);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'atraa_city_coords' && e.newValue) {
        try {
          const c = JSON.parse(e.newValue);
          setCoords(c);
          setLoading(true);
          fetchTimings(c);
        } catch { /* ignore */ }
      }
    };
    const handleMethodChange = () => {
      setStoredMethodState(getStoredMethod());
      setLoading(true);
      fetchTimings(coords);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(CALC_METHOD_EVENT, handleMethodChange);
    window.addEventListener('atraa:madhhab-changed', handleMethodChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CALC_METHOD_EVENT, handleMethodChange);
      window.removeEventListener('atraa:madhhab-changed', handleMethodChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [madhhab]);

  useEffect(() => {
    if (!timings) return;
    const interval = setInterval(() => {
      setIndicators(getCurrentAndNext(timings, ALL_PRAYER_KEYS));
    }, 60000);
    return () => clearInterval(interval);
  }, [timings]);

  const handlePickMethod = (id: StoredMethod) => {
    setStoredMethod(id);
    setStoredMethodState(id);
    setMethodSheet(false);
  };

  const activeMethodLabel = (() => {
    if (madhhab === 'shia') return isAr ? SHIA_METHOD.labelAr : SHIA_METHOD.labelEn;
    const m = SUNNI_METHODS.find(x => x.id === storedMethod) ?? SUNNI_METHODS[0];
    return isAr ? m.labelAr : m.labelEn;
  })();

  // Lock body scroll while the sheet is open
  useEffect(() => {
    if (!sheetOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [sheetOpen]);

  return (
    <>
      <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-card">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[13px] font-semibold text-foreground">{t('home.prayerTimes')}</h2>
          <div className="flex items-center gap-1">
            {madhhab === 'sunni' && (
              <button
                onClick={() => setMethodSheet(true)}
                className="flex items-center gap-1 p-1.5 rounded-lg text-muted-foreground/55 hover:text-foreground transition-colors"
                aria-label={isAr ? 'طريقة الحساب' : 'Calculation method'}
                title={activeMethodLabel}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-1 p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label={isAr ? 'عرض كل المواقيت' : 'Show all times'}
            >
              <span className="text-[10px] font-light">{isAr ? 'الكل' : 'All'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[72px] rounded-xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : timings ? (
          <div className="grid grid-cols-3 gap-1.5">
            {HOME_PRAYER_KEYS.map((key) => {
              const isCurrent = indicators.current === key;
              const isNext = indicators.next === key;
              return (
                <div
                  key={key}
                  className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isNext
                      ? 'bg-primary/8 border border-primary/15'
                      : 'bg-secondary/40'
                  }`}
                >
                  {(isCurrent || isNext) && (
                    <span className={`absolute -top-1.5 text-[8px] px-1.5 py-px rounded-full ${
                      isCurrent ? 'bg-accent text-accent-foreground' : 'bg-primary/15 text-primary'
                    }`}>
                      {isCurrent ? t('home.now') : t('home.next')}
                    </span>
                  )}
                  <span className={`text-[10px] font-medium ${isCurrent ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                    {t(`prayers.${key}`)}
                  </span>
                  <span className={`text-[12px] tabular-nums font-medium ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {to12Hour(timings[key]?.split(' ')[0] || '', i18n.language)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground text-center py-6">{t('home.loadingError')}</p>
        )}
      </div>

      {/* Full timings sheet */}
      <AnimatePresence>
        {sheetOpen && timings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-elevated max-h-[88vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="sticky top-0 bg-background/90 backdrop-blur-xl px-5 pt-4 pb-3 flex items-center justify-between border-b border-border/15">
                <h3 className="text-[15px] font-semibold text-foreground">
                  {isAr ? 'مواقيت اليوم كاملة' : 'Full daily timings'}
                </h3>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center active:scale-95"
                  aria-label="close"
                >
                  <X className="w-4 h-4 text-foreground/70" />
                </button>
              </div>

              <div className="px-5 py-5 space-y-5">
                {/* Daily prayers — Ja'fari calculation */}
                <Section title={isAr ? 'الصلوات اليومية' : 'Daily prayers'}>
                  <Row label={isAr ? 'الإمساك' : 'Imsak'} time={timings.Imsak} lang={i18n.language} hint={isAr ? 'قبيل الفجر' : 'Before Fajr'} />
                  <Row label={isAr ? 'الفجر' : 'Fajr'} time={timings.Fajr} lang={i18n.language} highlight={indicators.current === 'Fajr'} />
                  <Row label={isAr ? 'الشروق' : 'Sunrise'} time={timings.Sunrise} lang={i18n.language} hint={isAr ? 'نهاية وقت فضيلة الفجر' : 'End of Fajr preference'} />
                  <Row label={isAr ? 'الظهر' : 'Dhuhr'} time={timings.Dhuhr} lang={i18n.language} highlight={indicators.current === 'Dhuhr'} />
                  <Row label={isAr ? 'العصر' : 'Asr'} time={timings.Asr} lang={i18n.language} highlight={indicators.current === 'Asr'} />
                  <Row label={isAr ? 'المغرب' : 'Maghrib'} time={timings.Maghrib} lang={i18n.language} highlight={indicators.current === 'Maghrib'} />
                  <Row label={isAr ? 'العشاء' : 'Isha'} time={timings.Isha} lang={i18n.language} highlight={indicators.current === 'Isha'} />
                </Section>

                <p className="text-[9px] text-muted-foreground/40 text-center font-light pb-2">
                  {isAr ? `المصدر: AlAdhan API · ${activeMethodLabel}` : `Source: AlAdhan API · ${activeMethodLabel}`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45 font-light mb-2 px-1">{title}</p>
    <div className="rounded-2xl bg-card border border-border/15 divide-y divide-border/10 overflow-hidden">
      {children}
    </div>
  </div>
);

const Row = ({
  label,
  time,
  lang,
  hint,
  highlight,
  accent,
}: {
  label: string;
  time: string;
  lang: string;
  hint?: string;
  highlight?: boolean;
  accent?: boolean;
}) => (
  <div className={`flex items-center justify-between gap-3 px-3.5 py-3 ${highlight ? 'bg-primary/6' : ''}`}>
    <div className="flex-1 min-w-0">
      <p className={`text-[12px] font-medium ${highlight ? 'text-primary' : accent ? 'text-foreground' : 'text-foreground/85'}`}>
        {label}
      </p>
      {hint && <p className="text-[9px] text-muted-foreground/55 font-light mt-0.5 leading-tight">{hint}</p>}
    </div>
    <span className={`text-[12px] tabular-nums font-medium flex-shrink-0 ${highlight ? 'text-primary' : accent ? 'text-accent' : 'text-foreground'}`}>
      {to12Hour(time?.split(' ')[0] || '', lang)}
    </span>
  </div>
);

export default PrayerTimes;
