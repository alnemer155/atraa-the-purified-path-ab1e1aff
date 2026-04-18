import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, Moon, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHijriAdjustment } from '@/lib/user';

interface HijriData {
  day: number;
  month: string;
  monthEn: string;
  monthNumber: number;
  year: number;
  daysInMonth: number;
  weekdayAr: string;
  gregorianDate: string;
}

// Major Ahlul Bayt (a.s.) occasions — month, day, label
interface Occasion {
  month: number;
  day: number;
  ar: string;
  en: string;
  type: 'birth' | 'martyrdom' | 'event' | 'fasting';
}

const OCCASIONS: Occasion[] = [
  // Muharram
  { month: 1, day: 1, ar: 'بداية السنة الهجرية', en: 'Hijri New Year', type: 'event' },
  { month: 1, day: 9, ar: 'تاسوعاء الحسين (ع)', en: 'Tasua of Imam Hussain (a.s.)', type: 'event' },
  { month: 1, day: 10, ar: 'عاشوراء — استشهاد الإمام الحسين (ع)', en: 'Ashura — Martyrdom of Imam Hussain (a.s.)', type: 'martyrdom' },
  { month: 1, day: 25, ar: 'استشهاد الإمام زين العابدين (ع)', en: 'Martyrdom of Imam Sajjad (a.s.)', type: 'martyrdom' },
  // Safar
  { month: 2, day: 7, ar: 'استشهاد الإمام الحسن (ع)', en: 'Martyrdom of Imam Hassan (a.s.)', type: 'martyrdom' },
  { month: 2, day: 20, ar: 'الأربعين الحسيني', en: 'Arbaeen of Imam Hussain (a.s.)', type: 'event' },
  { month: 2, day: 28, ar: 'وفاة النبي (ص) واستشهاد الإمام الحسن (ع)', en: 'Demise of the Prophet (s.) & Imam Hassan (a.s.)', type: 'martyrdom' },
  // Rabi al-Awwal
  { month: 3, day: 8, ar: 'بداية إمامة الإمام المهدي (عج)', en: 'Beginning of Imam Mahdi (a.s.) Imamate', type: 'event' },
  { month: 3, day: 17, ar: 'مولد النبي (ص) ومولد الإمام الصادق (ع)', en: 'Birth of the Prophet (s.) & Imam Sadiq (a.s.)', type: 'birth' },
  // Jumada al-Thani
  { month: 6, day: 3, ar: 'استشهاد السيدة الزهراء (ع)', en: 'Martyrdom of Sayyida Zahra (a.s.)', type: 'martyrdom' },
  { month: 6, day: 20, ar: 'مولد السيدة الزهراء (ع)', en: 'Birth of Sayyida Zahra (a.s.)', type: 'birth' },
  // Rajab
  { month: 7, day: 13, ar: 'مولد الإمام علي (ع)', en: 'Birth of Imam Ali (a.s.)', type: 'birth' },
  { month: 7, day: 27, ar: 'المبعث النبوي الشريف', en: 'Mab\'ath of the Prophet (s.)', type: 'event' },
  // Shaban
  { month: 8, day: 3, ar: 'مولد الإمام الحسين (ع)', en: 'Birth of Imam Hussain (a.s.)', type: 'birth' },
  { month: 8, day: 15, ar: 'مولد الإمام المهدي (عج)', en: 'Birth of Imam Mahdi (a.s.)', type: 'birth' },
  // Ramadan
  { month: 9, day: 1, ar: 'بداية شهر رمضان المبارك', en: 'Beginning of Ramadan', type: 'fasting' },
  { month: 9, day: 19, ar: 'ضربة الإمام علي (ع)', en: 'Striking of Imam Ali (a.s.)', type: 'martyrdom' },
  { month: 9, day: 21, ar: 'استشهاد الإمام علي (ع)', en: 'Martyrdom of Imam Ali (a.s.)', type: 'martyrdom' },
  { month: 9, day: 23, ar: 'ليلة القدر', en: 'Laylat al-Qadr', type: 'event' },
  // Shawwal
  { month: 10, day: 1, ar: 'عيد الفطر المبارك', en: 'Eid al-Fitr', type: 'event' },
  { month: 10, day: 25, ar: 'استشهاد الإمام الصادق (ع)', en: 'Martyrdom of Imam Sadiq (a.s.)', type: 'martyrdom' },
  // Dhu al-Qadah
  { month: 11, day: 11, ar: 'مولد الإمام الرضا (ع)', en: 'Birth of Imam Reza (a.s.)', type: 'birth' },
  { month: 11, day: 29, ar: 'استشهاد الإمام الجواد (ع)', en: 'Martyrdom of Imam Jawad (a.s.)', type: 'martyrdom' },
  // Dhu al-Hijjah
  { month: 12, day: 9, ar: 'يوم عرفة', en: 'Day of Arafah', type: 'event' },
  { month: 12, day: 10, ar: 'عيد الأضحى المبارك', en: 'Eid al-Adha', type: 'event' },
  { month: 12, day: 18, ar: 'عيد الغدير', en: 'Eid al-Ghadir', type: 'event' },
  { month: 12, day: 24, ar: 'يوم المباهلة', en: 'Day of Mubahala', type: 'event' },
];

const MONTH_NAMES_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];
const MONTH_NAMES_EN = [
  'Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II',
  'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah',
];

const HijriCountdown = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [hijri, setHijri] = useState<HijriData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHijri = (adj: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + adj);
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yyyy = targetDate.getFullYear();

    fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=26.4207&longitude=50.0888&method=4&timezonestring=Asia/Riyadh`)
      .then(res => res.json())
      .then(data => {
        const h = data?.data?.date?.hijri;
        if (h) {
          setHijri({
            day: parseInt(h.day),
            month: h.month.ar,
            monthEn: h.month.en,
            monthNumber: parseInt(h.month.number),
            year: parseInt(h.year),
            daysInMonth: h.month.days ? parseInt(h.month.days) : 30,
            weekdayAr: h.weekday?.ar || '',
            gregorianDate: data?.data?.date?.gregorian?.date || '',
          });
        }
      })
      .catch(() => { /* silent */ });
  };

  useEffect(() => {
    const adj = getHijriAdjustment();
    fetchHijri(adj);

    const handleCustomEvent = (e: Event) => {
      const ce = e as CustomEvent<number>;
      fetchHijri(ce.detail);
    };
    window.addEventListener('hijri-adjust-changed', handleCustomEvent);
    return () => window.removeEventListener('hijri-adjust-changed', handleCustomEvent);
  }, []);

  const daysRemaining = hijri ? Math.max(0, hijri.daysInMonth - hijri.day) : 0;
  const progress = hijri ? (hijri.day / hijri.daysInMonth) * 100 : 0;

  // Compute upcoming occasions in the current and next month
  const upcomingOccasions = hijri ? [
    ...OCCASIONS.filter(o => o.month === hijri.monthNumber && o.day >= hijri.day),
    ...OCCASIONS.filter(o => o.month === ((hijri.monthNumber % 12) + 1)),
  ].slice(0, 8) : [];

  const todaysOccasion = hijri
    ? OCCASIONS.find(o => o.month === hijri.monthNumber && o.day === hijri.day)
    : undefined;

  const ChevronArrow = isAr ? ChevronLeft : ChevronLeft; // both rotated visually below

  return (
    <>
      <button
        onClick={() => hijri && setShowDetails(true)}
        disabled={!hijri}
        className={`rounded-2xl bg-card border border-border/20 p-3.5 min-h-[100px] flex flex-col justify-between text-${isAr ? 'right' : 'left'} active:scale-[0.98] transition-transform relative overflow-hidden`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] text-muted-foreground/40 tracking-widest font-light uppercase">
            {isAr ? 'التقويم' : 'Calendar'}
          </span>
          {hijri && (
            <ChevronLeft
              className={`w-3 h-3 text-muted-foreground/30 ${isAr ? '' : 'rotate-180'}`}
            />
          )}
        </div>
        {hijri ? (
          <div className="w-full">
            <p className="text-[15px] text-foreground leading-snug">
              {hijri.day} {isAr ? hijri.month : MONTH_NAMES_EN[hijri.monthNumber - 1]}
            </p>
            <p className="text-[9px] text-muted-foreground/40 mt-0.5 font-light">
              {hijri.year} {isAr ? 'هـ' : 'AH'}
            </p>

            <div className="mt-2.5">
              <div className="h-[2px] rounded-full bg-secondary/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/15 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[7px] text-muted-foreground/30 mt-1 font-light">
                {daysRemaining > 0
                  ? (isAr ? `${daysRemaining} يوم متبقي` : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left`)
                  : (isAr ? 'آخر يوم' : 'Last day')}
              </p>
            </div>
            {todaysOccasion && (
              <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-md bg-secondary/30 animate-pulse" />
            <div className="h-2.5 w-14 rounded-md bg-secondary/20 animate-pulse" />
          </div>
        )}
      </button>

      {/* Details modal */}
      <AnimatePresence>
        {showDetails && hijri && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-md flex items-end sm:items-center justify-center"
            onClick={() => setShowDetails(false)}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-background/90 backdrop-blur-xl px-5 py-3 flex items-center justify-between border-b border-border/10">
                <div>
                  <p className="text-[10px] text-muted-foreground/50 font-light">{hijri.weekdayAr}</p>
                  <p className="text-[15px] text-foreground">
                    {hijri.day} {isAr ? hijri.month : MONTH_NAMES_EN[hijri.monthNumber - 1]} {hijri.year} {isAr ? 'هـ' : 'AH'}
                  </p>
                </div>
                <button onClick={() => setShowDetails(false)} className="w-8 h-8 rounded-xl bg-secondary/40 flex items-center justify-center active:scale-95">
                  <X className="w-4 h-4 text-foreground/70" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Today's occasion */}
                {todaysOccasion && (
                  <div className="rounded-2xl bg-gold/10 border border-gold/30 p-4">
                    <p className="text-[9px] text-gold/80 uppercase tracking-widest font-light mb-1.5">
                      {isAr ? 'مناسبة اليوم' : 'Today'}
                    </p>
                    <p className="text-[14px] text-foreground leading-relaxed">
                      {isAr ? todaysOccasion.ar : todaysOccasion.en}
                    </p>
                  </div>
                )}

                {/* Ramadan / Eid prediction */}
                {hijri.monthNumber === 8 && (
                  <div className="rounded-2xl bg-card border border-border/20 p-4 flex items-start gap-3">
                    <Moon className="w-5 h-5 text-foreground/60 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] text-foreground">
                        {isAr ? 'بداية متوقعة لشهر رمضان' : 'Expected start of Ramadan'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 font-light leading-relaxed">
                        {isAr
                          ? `بعد حوالي ${30 - hijri.day + 1} يوم — يخضع لرؤية الهلال`
                          : `In about ${30 - hijri.day + 1} days — subject to moon sighting`}
                      </p>
                    </div>
                  </div>
                )}
                {hijri.monthNumber === 9 && (
                  <div className="rounded-2xl bg-card border border-border/20 p-4 flex items-start gap-3">
                    <Star className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] text-foreground">
                        {isAr ? 'عيد الفطر المبارك' : 'Eid al-Fitr'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 font-light leading-relaxed">
                        {isAr
                          ? `بعد حوالي ${hijri.daysInMonth - hijri.day + 1} يوم — يخضع لرؤية الهلال`
                          : `In about ${hijri.daysInMonth - hijri.day + 1} days — subject to moon sighting`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upcoming occasions */}
                <div>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-light mb-2.5">
                    {isAr ? 'المناسبات القادمة' : 'Upcoming occasions'}
                  </p>
                  <div className="space-y-1.5">
                    {upcomingOccasions.length === 0 && (
                      <p className="text-[11px] text-muted-foreground/40 font-light text-center py-4">
                        {isAr ? 'لا توجد مناسبات قريبة' : 'No upcoming occasions'}
                      </p>
                    )}
                    {upcomingOccasions.map((o, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/15"
                      >
                        <div className="w-10 h-10 rounded-xl bg-secondary/40 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-[11px] text-foreground tabular-nums leading-none">{o.day}</span>
                          <span className="text-[7px] text-muted-foreground/50 font-light mt-0.5">
                            {isAr ? MONTH_NAMES_AR[o.month - 1].slice(0, 4) : MONTH_NAMES_EN[o.month - 1].slice(0, 4)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-foreground leading-snug">
                            {isAr ? o.ar : o.en}
                          </p>
                          <span className={`text-[8px] font-light tracking-wide ${
                            o.type === 'martyrdom' ? 'text-foreground/50'
                            : o.type === 'birth' ? 'text-gold'
                            : 'text-muted-foreground/50'
                          }`}>
                            {o.type === 'martyrdom' ? (isAr ? 'استشهاد' : 'Martyrdom')
                              : o.type === 'birth' ? (isAr ? 'مولد' : 'Birth')
                              : o.type === 'fasting' ? (isAr ? 'صيام' : 'Fasting')
                              : (isAr ? 'مناسبة' : 'Event')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[9px] text-muted-foreground/30 text-center font-light pt-2">
                  {isAr ? 'التواريخ تقريبية وقد تتغير برؤية الهلال' : 'Dates are approximate and subject to moon sighting'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HijriCountdown;
