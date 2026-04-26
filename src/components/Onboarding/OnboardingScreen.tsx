import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Check, Lock, Calendar, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { setHijriAdjustment } from '@/lib/user';
import { getAccurateLocation } from '@/lib/geo';
import { toast } from 'sonner';
import { getSeasonalLogo } from '@/lib/seasonal-logo';

const welcomeLogo = getSeasonalLogo();

const ONBOARDING_KEY = 'atraa_onboarding_done_v1';

export function isOnboardingDone(): boolean {
  try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { return false; }
}
export function markOnboardingDone(): void {
  try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* ignore */ }
}

interface Props {
  onFinish: () => void;
}

type Step = 0 | 1 | 2 | 3;

const PREP_MESSAGES_AR = [
  'جاري التجهيز…',
  'تحميل أوقات الصلاة…',
  'إعداد التقويم الهجري…',
  'تخصيص واجهتك…',
  'لمسات أخيرة…',
];

const PREP_MESSAGES_EN = [
  'Preparing…',
  'Loading prayer times…',
  'Setting up Hijri calendar…',
  'Personalizing your interface…',
  'Final touches…',
];

const SAUDI_FALLBACK = { city: 'Dammam', coords: { lat: 26.3927, lng: 49.9777 } };

const OnboardingScreen = ({ onFinish }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const Chevron = isAr ? ChevronRight : ChevronLeft; // back arrow
  const ForwardChevron = isAr ? ChevronLeft : ChevronRight;

  const [step, setStep] = useState<Step>(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // Welcome screen — 2 seconds, then transition to first step
  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 2000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  // Step 1: Madhhab (only Shia selectable)
  const [madhhab, setMadhhab] = useState<'shia' | null>(null);

  // Step 2: Hijri adjustment
  const [hijriAdj, setHijriAdj] = useState(0);

  // Step 3: City / GPS
  const [gpsLoading, setGpsLoading] = useState(false);
  const [cityChoice, setCityChoice] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Step 4: prep
  const [prepIdx, setPrepIdx] = useState(0);
  const finishedRef = useRef(false);

  const goNext = () => setStep((s) => (Math.min(3, s + 1) as Step));
  const goBack = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const handleSkipDate = () => goNext();

  const handleGPS = async () => {
    if (gpsLoading) return;
    setGpsLoading(true);
    try {
      const pos = await getAccurateLocation(10000);
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      // Use generic "GPS" placeholder; the app's existing PrayerTimes will use coords directly.
      setCityChoice({ name: 'GPS', ...coords });
      localStorage.setItem('atraa_city', 'GPS');
      localStorage.setItem('atraa_city_coords', JSON.stringify(coords));
    } catch {
      toast.error(isAr ? 'تعذّر تحديد الموقع' : 'Could not get location');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleChooseCity = (name: string, coords: { lat: number; lng: number }) => {
    setCityChoice({ name, ...coords });
    localStorage.setItem('atraa_city', name);
    localStorage.setItem('atraa_city_coords', JSON.stringify(coords));
  };

  // Save preferences when leaving step 1 (Hijri)
  useEffect(() => {
    if (step >= 2) setHijriAdjustment(hijriAdj);
  }, [step, hijriAdj]);

  // Save madhhab once chosen
  useEffect(() => {
    if (madhhab) {
      try { localStorage.setItem('atraa_madhhab', madhhab); } catch { /* ignore */ }
    }
  }, [madhhab]);

  // Step 4 (prep): cycle messages each second, finish after 5s
  useEffect(() => {
    if (step !== 3) return;
    finishedRef.current = false;

    // If user hasn't picked a city, default to Dammam
    if (!cityChoice) {
      localStorage.setItem('atraa_city', SAUDI_FALLBACK.city);
      localStorage.setItem('atraa_city_coords', JSON.stringify(SAUDI_FALLBACK.coords));
    }

    const t1 = setInterval(() => {
      setPrepIdx((i) => (i + 1) % 5);
    }, 1000);
    const t2 = setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      markOnboardingDone();
      onFinish();
    }, 5000);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, [step, cityChoice, onFinish]);

  const progress = ((step + 1) / 4) * 100;

  const popularCities: Array<{ value: string; labelAr: string; labelEn: string; lat: number; lng: number }> = [
    // Saudi Arabia (default region)
    { value: 'Dammam', labelAr: 'الدمام', labelEn: 'Dammam', lat: 26.3927, lng: 49.9777 },
    { value: 'Riyadh', labelAr: 'الرياض', labelEn: 'Riyadh', lat: 24.7136, lng: 46.6753 },
    { value: 'Mecca', labelAr: 'مكة المكرمة', labelEn: 'Mecca', lat: 21.3891, lng: 39.8579 },
    { value: 'Medina', labelAr: 'المدينة المنورة', labelEn: 'Medina', lat: 24.5247, lng: 39.5692 },
    // Gulf capitals (GCC)
    { value: 'Kuwait', labelAr: 'الكويت', labelEn: 'Kuwait City', lat: 29.3759, lng: 47.9774 },
    { value: 'Manama', labelAr: 'المنامة', labelEn: 'Manama', lat: 26.2285, lng: 50.5860 },
    { value: 'Doha', labelAr: 'الدوحة', labelEn: 'Doha', lat: 25.2854, lng: 51.5310 },
    { value: 'Abu Dhabi', labelAr: 'أبوظبي', labelEn: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
    { value: 'Muscat', labelAr: 'مسقط', labelEn: 'Muscat', lat: 23.5859, lng: 58.4059 },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Welcome overlay — 2s */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.06)_0%,_transparent_60%)]" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              {/* Subtle gold ornament above the logo */}
              <motion.svg
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewBox="0 0 120 12"
                className="w-24 h-3 text-gold/60 mb-4"
                aria-hidden
              >
                <g fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round">
                  <path d="M0 6 H42" opacity="0.4" />
                  <path d="M78 6 H120" opacity="0.4" />
                  <circle cx="60" cy="6" r="3.4" opacity="0.7" />
                  <circle cx="60" cy="6" r="1.2" opacity="0.95" />
                  <path d="M48 6 q6 -5 12 0 q6 5 12 0" opacity="0.6" />
                </g>
              </motion.svg>
              <img
                src={welcomeLogo}
                alt="Atraa"
                className="h-12 w-auto object-contain mb-5"
                style={{ maxHeight: 48 }}
              />
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-[15px] text-foreground tracking-wide"
                style={{ fontWeight: 300 }}
              >
                {isAr ? 'أهلاً بك في عِتَرَةً' : 'Welcome to Atraa'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar with progress */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          {step > 0 && step < 3 ? (
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 transition-colors"
              aria-label="back"
            >
              <Chevron className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
          <p className="text-[10px] text-muted-foreground/60 font-light tabular-nums">
            {step + 1} / 4
          </p>
          <div className="w-9 h-9" />
        </div>
        <div className="h-[2px] w-full rounded-full bg-border/40 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">
          {/* STEP 1 — MADHHAB */}
          {step === 0 && (
            <motion.div
              key="madhhab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className={isAr ? 'text-right' : 'text-left'}
            >
              <h2 className="text-[20px] text-foreground font-medium tracking-tight mb-1">
                {isAr ? 'اختر مذهبك' : 'Choose your school'}
              </h2>
              <p className="text-[12px] text-muted-foreground/70 font-light mb-8">
                {isAr ? 'لتخصيص الأدعية وأوقات الصلاة بدقة' : 'To tailor supplications and prayer times'}
              </p>

              <div className="space-y-3">
                {/* Shia */}
                <button
                  onClick={() => setMadhhab('shia')}
                  className={`w-full p-5 rounded-2xl border transition-all text-start active:scale-[0.99] ${
                    madhhab === 'shia'
                      ? 'border-primary bg-primary/5'
                      : 'border-border/40 bg-card hover:border-border/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] text-foreground font-medium">
                        {isAr ? 'مسلم شيعي' : 'Shia Muslim'}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 font-light mt-0.5">
                        {isAr ? 'الجعفري الإثنا عشري' : 'Twelver Ja\u2018fari'}
                      </p>
                    </div>
                    {madhhab === 'shia' && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </button>

                {/* Sunni — disabled */}
                <button
                  disabled
                  className="w-full p-5 rounded-2xl border border-border/30 bg-secondary/20 text-start opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] text-muted-foreground font-medium">
                        {isAr ? 'مسلم سنّي' : 'Sunni Muslim'}
                      </p>
                      <p className="text-[11px] text-muted-foreground/50 font-light mt-0.5">
                        {isAr ? 'محتوى مخصّص قيد الإعداد' : 'Tailored content in development'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-muted-foreground/70 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5" strokeWidth={1.8} />
                      <span className="text-[9px] font-light">{isAr ? 'قريباً' : 'Soon'}</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-8">
                <button
                  onClick={goNext}
                  disabled={!madhhab}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAr ? 'متابعة' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — HIJRI ADJUST */}
          {step === 1 && (
            <motion.div
              key="hijri"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className={isAr ? 'text-right' : 'text-left'}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-[20px] text-foreground font-medium tracking-tight">
                  {isAr ? 'تعديل التاريخ الهجري' : 'Adjust Hijri date'}
                </h2>
              </div>
              <p className="text-[12px] text-muted-foreground/70 font-light mb-8">
                {isAr
                  ? 'صحّح فرق الأيام مع رؤية بلدك، أو تخطَّ هذه الخطوة.'
                  : 'Correct the day offset for your region, or skip.'}
              </p>

              <div className="bg-card border border-border/40 rounded-2xl p-6">
                <div className="text-center mb-5">
                  <p className="text-[10px] text-muted-foreground/60 font-light uppercase tracking-wide mb-1">
                    {isAr ? 'الإزاحة الحالية' : 'Current offset'}
                  </p>
                  <p className="text-[36px] text-foreground font-light tabular-nums leading-none">
                    {hijriAdj > 0 ? `+${hijriAdj}` : hijriAdj}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-light mt-1">
                    {isAr
                      ? Math.abs(hijriAdj) === 1 ? 'يوم' : 'أيام'
                      : Math.abs(hijriAdj) === 1 ? 'day' : 'days'}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {[-2, -1, 0, 1, 2].map((val) => {
                    const isSel = hijriAdj === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setHijriAdj(val)}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] tabular-nums transition-all active:scale-95 ${
                          isSel
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <button
                  onClick={goNext}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-medium active:scale-[0.98] transition-transform"
                >
                  {isAr ? 'حفظ ومتابعة' : 'Save & continue'}
                </button>
                <button
                  onClick={handleSkipDate}
                  className="w-full py-3 rounded-2xl text-muted-foreground/70 text-[12px] font-light active:bg-secondary/30 transition-colors"
                >
                  {isAr ? 'تخطي' : 'Skip'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — CITY / GPS */}
          {step === 2 && (
            <motion.div
              key="city"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className={isAr ? 'text-right' : 'text-left'}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-[20px] text-foreground font-medium tracking-tight">
                  {isAr ? 'حدّد موقعك' : 'Set your location'}
                </h2>
              </div>
              <p className="text-[12px] text-muted-foreground/70 font-light mb-6">
                {isAr ? 'لحساب أوقات الصلاة واتجاه القبلة' : 'For accurate prayer times and Qibla'}
              </p>

              {/* GPS button */}
              <button
                onClick={handleGPS}
                disabled={gpsLoading}
                className="w-full p-4 rounded-2xl border border-primary/30 bg-primary/5 flex items-center gap-3 active:scale-[0.99] transition-transform disabled:opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {gpsLoading ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <LocateFixed className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 text-start">
                  <p className="text-[13px] text-foreground font-medium">
                    {isAr ? 'استخدام GPS' : 'Use GPS'}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5">
                    {cityChoice?.name === 'GPS'
                      ? (isAr ? 'تم تحديد موقعك ✓' : 'Location set ✓')
                      : (isAr ? 'الأكثر دقة' : 'Most accurate')}
                  </p>
                </div>
                {cityChoice?.name === 'GPS' && (
                  <Check className="w-4 h-4 text-primary" strokeWidth={2} />
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border/40" />
                <p className="text-[10px] text-muted-foreground/50 font-light">
                  {isAr ? 'أو اختر مدينة' : 'or pick a city'}
                </p>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              {/* Popular cities grid */}
              <div className="grid grid-cols-2 gap-2">
                {popularCities.map((c) => {
                  const isSel = cityChoice?.name === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => handleChooseCity(c.value, { lat: c.lat, lng: c.lng })}
                      className={`p-3.5 rounded-xl border text-start transition-all active:scale-[0.97] ${
                        isSel
                          ? 'border-primary bg-primary/5'
                          : 'border-border/40 bg-card hover:border-border/70'
                      }`}
                    >
                      <p className="text-[13px] text-foreground font-medium">
                        {isAr ? c.labelAr : c.labelEn}
                      </p>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-muted-foreground/50 font-light text-center mt-4">
                {isAr ? 'يمكنك تغيير المدينة لاحقًا من الإعدادات' : 'You can change the city later in Settings'}
              </p>

              <div className="mt-6">
                <button
                  onClick={goNext}
                  disabled={!cityChoice}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAr ? 'متابعة' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — PREPARING */}
          {step === 3 && (
            <motion.div
              key="prep"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              {/* Animated illuminated ring */}
              <div className="relative w-28 h-28 mb-8">
                {/* Soft glowing aura */}
                <div className="absolute inset-[-20px] rounded-full bg-[radial-gradient(circle,_hsl(var(--gold)/0.18)_0%,_transparent_65%)] blur-md" />
                {/* Outer pulsating ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/20"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0, 0.55] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Rotating gold arc */}
                <motion.svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="hsl(var(--gold) / 0.7)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeDasharray="40 220"
                  />
                </motion.svg>
                {/* Inner ring */}
                <div className="absolute inset-3 rounded-full border border-border/30" />
                {/* Center pulsing dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-gold"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              <div className="h-6 overflow-hidden text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={prepIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="text-[14px] text-foreground"
                    style={{ fontWeight: 300 }}
                  >
                    {isAr ? PREP_MESSAGES_AR[prepIdx] : PREP_MESSAGES_EN[prepIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <p className="text-[10px] text-muted-foreground/50 font-light mt-2">
                {isAr ? 'لحظات قليلة…' : 'Just a moment…'}
              </p>

              {/* Subtle Bismillah footer */}
              <p
                className="quran-uthmani text-foreground/40 mt-10"
                style={{ fontSize: 13 }}
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingScreen;
