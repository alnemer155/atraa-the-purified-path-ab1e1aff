import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, ChevronRight, Check, Calendar, MapPin, LocateFixed, Loader2, Globe,
  Bell, Mail, Smartphone, Sparkles, Lock,
} from 'lucide-react';
import { setHijriAdjustment } from '@/lib/user';
import { getBestAccuracyLocation } from '@/lib/geo';
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

interface Props { onFinish: () => void; }

// 3 setup steps + 1 prep screen
type Step = 0 | 1 | 2 | 3;
const TOTAL = 3; // user-facing step count

const SAUDI_FALLBACK = { city: 'Dammam', coords: { lat: 26.3927, lng: 49.9777 } };

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

type NotifChannel = 'app' | 'email';
type Plan = 'free' | 'paid';

const OnboardingScreen = ({ onFinish }: Props) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const Chevron = isAr ? ChevronRight : ChevronLeft;

  const [step, setStep] = useState<Step>(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 2000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  // Step 1 — City / GPS
  const [gpsLoading, setGpsLoading] = useState(false);
  const [cityChoice, setCityChoice] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Step 2 — Hijri adjust
  const [hijriAdj, setHijriAdj] = useState(0);

  // Step 3 — Notifications + Plan
  const [notifChannel, setNotifChannel] = useState<NotifChannel>('app');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<Plan>('free');

  // Prep screen
  const [prepIdx, setPrepIdx] = useState(0);
  const finishedRef = useRef(false);

  const goNext = () => setStep((s) => Math.min(3, s + 1) as Step);
  const goBack = () => setStep((s) => Math.max(0, s - 1) as Step);

  const handleGPS = async () => {
    if (gpsLoading) return;
    setGpsLoading(true);
    try {
      const pos = await getBestAccuracyLocation({ windowMs: 6000, acceptAccuracyM: 30, fallbackTimeoutMs: 10000 });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
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

  // Persist Hijri adjustment as soon as user leaves step 1
  useEffect(() => {
    if (step >= 2) setHijriAdjustment(hijriAdj);
  }, [step, hijriAdj]);

  // Always Shia — set once on mount
  useEffect(() => {
    try { localStorage.setItem('atraa_madhhab', 'shia'); } catch { /* ignore */ }
  }, []);

  // Persist notif + plan when leaving step 3
  const persistFinalAndFinish = () => {
    try {
      localStorage.setItem('atraa_notif_channel', notifChannel);
      if (notifChannel === 'email' && email.trim()) {
        localStorage.setItem('atraa_notif_email', email.trim());
      }
      localStorage.setItem('atraa_plan', plan);
    } catch { /* ignore */ }
    if (!cityChoice) {
      localStorage.setItem('atraa_city', SAUDI_FALLBACK.city);
      localStorage.setItem('atraa_city_coords', JSON.stringify(SAUDI_FALLBACK.coords));
    }
    setStep(3);
  };

  // Prep screen cycle
  useEffect(() => {
    if (step !== 3) return;
    finishedRef.current = false;
    const t1 = setInterval(() => setPrepIdx((i) => (i + 1) % 5), 1000);
    const t2 = setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      markOnboardingDone();
      onFinish();
    }, 5000);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, [step, onFinish]);

  const progress = ((Math.min(step, 2) + 1) / TOTAL) * 100;

  const popularCities = [
    { value: 'Dammam', labelAr: 'الدمام', labelEn: 'Dammam', lat: 26.3927, lng: 49.9777 },
    { value: 'Riyadh', labelAr: 'الرياض', labelEn: 'Riyadh', lat: 24.7136, lng: 46.6753 },
    { value: 'Mecca', labelAr: 'مكة المكرمة', labelEn: 'Mecca', lat: 21.3891, lng: 39.8579 },
    { value: 'Medina', labelAr: 'المدينة المنورة', labelEn: 'Medina', lat: 24.5247, lng: 39.5692 },
    { value: 'Kuwait', labelAr: 'الكويت', labelEn: 'Kuwait City', lat: 29.3759, lng: 47.9774 },
    { value: 'Manama', labelAr: 'المنامة', labelEn: 'Manama', lat: 26.2285, lng: 50.5860 },
    { value: 'Doha', labelAr: 'الدوحة', labelEn: 'Doha', lat: 25.2854, lng: 51.5310 },
    { value: 'Abu Dhabi', labelAr: 'أبوظبي', labelEn: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
    { value: 'Muscat', labelAr: 'مسقط', labelEn: 'Muscat', lat: 23.5859, lng: 58.4059 },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Welcome overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div key="welcome" initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.06)_0%,_transparent_60%)]" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center"
            >
              <img src={welcomeLogo} alt="Atraa" className="h-12 w-auto object-contain mb-5" style={{ maxHeight: 48 }} />
              <p className="text-[15px] text-foreground tracking-wide" style={{ fontWeight: 300 }}>
                {isAr ? 'أهلاً بك في عِتَرَةً' : 'Welcome to Atraa'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          {step > 0 && step < 3 ? (
            <button onClick={goBack} className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40">
              <Chevron className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          ) : <div className="w-9 h-9" />}
          <p className="text-[10px] text-muted-foreground/60 font-light tabular-nums">
            {Math.min(step, 2) + 1} / {TOTAL}
          </p>
          {step < 3 ? (
            <button
              onClick={() => {
                const next = isAr ? 'en' : 'ar';
                void i18n.changeLanguage(next);
                try { localStorage.setItem('i18nextLng', next); } catch { /* ignore */ }
              }}
              className="h-9 px-2.5 min-w-9 rounded-full flex items-center justify-center gap-1 active:bg-secondary/40"
            >
              <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[10px] text-muted-foreground font-light uppercase tracking-wide">
                {isAr ? 'EN' : 'ع'}
              </span>
            </button>
          ) : <div className="w-9 h-9" />}
        </div>
        <div className="h-[2px] w-full rounded-full bg-border/40 overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" initial={false}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">
          {/* STEP 1 — CITY */}
          {step === 0 && (
            <motion.div key="city" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }} className={isAr ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-[20px] text-foreground font-medium tracking-tight">
                  {isAr ? 'حدّد موقعك' : 'Set your location'}
                </h2>
              </div>
              <p className="text-[12px] text-muted-foreground/70 font-light mb-6">
                {isAr ? 'لحساب أوقات الصلاة واتجاه القبلة' : 'For accurate prayer times and Qibla'}
              </p>

              <button onClick={handleGPS} disabled={gpsLoading}
                className="w-full p-4 rounded-2xl border border-primary/30 bg-primary/5 flex items-center gap-3 active:scale-[0.99] disabled:opacity-60">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {gpsLoading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <LocateFixed className="w-4 h-4 text-primary" strokeWidth={1.5} />}
                </div>
                <div className="flex-1 text-start">
                  <p className="text-[13px] text-foreground font-medium">{isAr ? 'استخدام GPS' : 'Use GPS'}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-light mt-0.5">
                    {cityChoice?.name === 'GPS' ? (isAr ? 'تم تحديد موقعك ✓' : 'Location set ✓') : (isAr ? 'الأكثر دقة' : 'Most accurate')}
                  </p>
                </div>
                {cityChoice?.name === 'GPS' && <Check className="w-4 h-4 text-primary" strokeWidth={2} />}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border/40" />
                <p className="text-[10px] text-muted-foreground/50 font-light">{isAr ? 'أو اختر مدينة' : 'or pick a city'}</p>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {popularCities.map((c) => {
                  const isSel = cityChoice?.name === c.value;
                  return (
                    <button key={c.value} onClick={() => handleChooseCity(c.value, { lat: c.lat, lng: c.lng })}
                      className={`p-3.5 rounded-xl border text-start transition-all active:scale-[0.97] ${
                        isSel ? 'border-primary bg-primary/5' : 'border-border/40 bg-card hover:border-border/70'
                      }`}>
                      <p className="text-[13px] text-foreground font-medium">{isAr ? c.labelAr : c.labelEn}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <button onClick={goNext} disabled={!cityChoice}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-medium active:scale-[0.98] disabled:opacity-40">
                  {isAr ? 'متابعة' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — HIJRI */}
          {step === 1 && (
            <motion.div key="hijri" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }} className={isAr ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-[20px] text-foreground font-medium tracking-tight">
                  {isAr ? 'تعديل التاريخ الهجري' : 'Adjust Hijri date'}
                </h2>
              </div>
              <p className="text-[12px] text-muted-foreground/70 font-light mb-8">
                {isAr ? 'صحّح فرق الأيام مع رؤية بلدك، أو تخطَّ هذه الخطوة.' : 'Correct the day offset for your region, or skip.'}
              </p>

              <div className="bg-card border border-border/40 rounded-2xl p-6">
                <div className="text-center mb-5">
                  <p className="text-[10px] text-muted-foreground/60 font-light uppercase tracking-wide mb-1">
                    {isAr ? 'الإزاحة الحالية' : 'Current offset'}
                  </p>
                  <p className="text-[36px] text-foreground font-light tabular-nums leading-none">
                    {hijriAdj > 0 ? `+${hijriAdj}` : hijriAdj}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {[-2, -1, 0, 1, 2].map((val) => {
                    const isSel = hijriAdj === val;
                    return (
                      <button key={val} onClick={() => setHijriAdj(val)}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] tabular-nums transition-all active:scale-95 ${
                          isSel ? 'bg-primary text-primary-foreground font-medium' : 'bg-secondary/40 text-muted-foreground'
                        }`}>
                        {val > 0 ? `+${val}` : val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <button onClick={goNext}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-medium active:scale-[0.98]">
                  {isAr ? 'حفظ ومتابعة' : 'Save & continue'}
                </button>
                <button onClick={goNext}
                  className="w-full py-3 rounded-2xl text-muted-foreground/70 text-[12px] font-light active:bg-secondary/30">
                  {isAr ? 'تخطي' : 'Skip'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — NOTIFICATIONS + SUBSCRIPTION */}
          {step === 2 && (
            <motion.div key="notif" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }} className={isAr ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <h2 className="text-[20px] text-foreground font-medium tracking-tight">
                  {isAr ? 'الإشعارات والاشتراك' : 'Notifications & plan'}
                </h2>
              </div>
              <p className="text-[12px] text-muted-foreground/70 font-light mb-6">
                {isAr ? 'اختر كيف تستلم تذكيرات الصلاة والأذكار، وحدّد خطتك.' : 'Choose how you receive reminders and your plan.'}
              </p>

              {/* Notification channel */}
              <p className="text-[11px] text-muted-foreground/70 font-light mb-2">
                {isAr ? 'استلام الإشعارات عبر:' : 'Receive notifications via:'}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {([['app', isAr ? 'التطبيق' : 'App', Smartphone], ['email', isAr ? 'البريد' : 'Email', Mail]] as [NotifChannel, string, typeof Bell][]).map(([k, l, Icon]) => {
                  const sel = notifChannel === k;
                  return (
                    <button key={k} onClick={() => setNotifChannel(k)}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all active:scale-[0.97] ${
                        sel ? 'border-primary bg-primary/5' : 'border-border/40 bg-card'
                      }`}>
                      <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                      <span className="text-[12px] text-foreground">{l}</span>
                      {sel && <Check className="w-3.5 h-3.5 text-primary ms-auto" strokeWidth={2} />}
                    </button>
                  );
                })}
              </div>

              {notifChannel === 'email' && (
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAr ? 'your@email.com' : 'your@email.com'}
                  dir="ltr"
                  className="w-full mb-5 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border/30 outline-none focus:border-primary/40 text-[12px] text-foreground placeholder:text-muted-foreground/40"
                />
              )}

              {/* Plan */}
              <p className="text-[11px] text-muted-foreground/70 font-light mb-2 mt-2">
                {isAr ? 'الاشتراك:' : 'Plan:'}
              </p>
              <div className="space-y-2">
                {/* Free */}
                <button onClick={() => setPlan('free')}
                  className={`w-full p-4 rounded-2xl border text-start transition-all ${
                    plan === 'free' ? 'border-primary bg-primary/5' : 'border-border/40 bg-card'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                      <p className="text-[13px] text-foreground font-medium">{isAr ? 'مجاني' : 'Free'}</p>
                    </div>
                    {plan === 'free' && <Check className="w-4 h-4 text-primary" strokeWidth={2} />}
                  </div>
                  <ul className="text-[10.5px] text-muted-foreground/85 font-light space-y-1 leading-relaxed">
                    <li>• {isAr ? 'أوقات الصلاة واتجاه القبلة' : 'Prayer times and Qibla'}</li>
                    <li>• {isAr ? 'الأدعية والزيارات والأذكار' : 'Supplications, ziyarat and adhkar'}</li>
                    <li>• {isAr ? 'الختمات و أثر' : 'Khatmas and Athar'}</li>
                    <li>• {isAr ? 'منبر — قصائد وصوتيات' : 'Minbar — qasaid & audio'}</li>
                  </ul>
                </button>

                {/* Paid — coming soon, locked, no price shown */}
                <button onClick={() => setPlan('paid')} disabled
                  className={`w-full p-4 rounded-2xl border text-start opacity-70 cursor-not-allowed ${
                    plan === 'paid' ? 'border-primary bg-primary/5' : 'border-border/40 bg-card'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-[13px] text-foreground font-medium">{isAr ? 'مدفوع' : 'Premium'}</p>
                      <span className="text-[9px] text-muted-foreground/70 px-1.5 py-0.5 rounded-full bg-secondary/40">
                        {isAr ? 'قريباً' : 'Soon'}
                      </span>
                    </div>
                  </div>
                  <ul className="text-[10.5px] text-muted-foreground/85 font-light space-y-1 leading-relaxed">
                    <li>• {isAr ? 'كل مميزات المجاني' : 'Everything in Free'}</li>
                    <li>• {isAr ? 'أثر الذكاء — مساعد ديني خاص' : 'Athar AI — private religious assistant'}</li>
                    <li>• {isAr ? 'إشعارات ذكية مخصّصة' : 'Smart personalized reminders'}</li>
                    <li>• {isAr ? 'تنزيل القصائد والكتب للاستماع دون اتصال' : 'Offline qasaid & content'}</li>
                    <li>• {isAr ? 'دعم متقدّم وأولوية الميزات' : 'Priority support & early access'}</li>
                  </ul>
                </button>
              </div>

              <div className="mt-6">
                <button onClick={persistFinalAndFinish}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[14px] font-medium active:scale-[0.98]">
                  {isAr ? 'إنهاء' : 'Finish'}
                </button>
              </div>
            </motion.div>
          )}

          {/* PREP */}
          {step === 3 && (
            <motion.div key="prep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="relative w-28 h-28 mb-8">
                <div className="absolute inset-[-20px] rounded-full bg-[radial-gradient(circle,_hsl(var(--gold)/0.18)_0%,_transparent_65%)] blur-md" />
                <motion.div className="absolute inset-0 rounded-full border border-primary/20"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0, 0.55] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100"
                  animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--gold) / 0.7)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="40 220" />
                </motion.svg>
                <div className="absolute inset-3 rounded-full border border-border/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div className="w-2.5 h-2.5 rounded-full bg-gold"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
              </div>

              <div className="h-6 overflow-hidden text-center">
                <AnimatePresence mode="wait">
                  <motion.p key={prepIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }} className="text-[14px] text-foreground" style={{ fontWeight: 300 }}>
                    {isAr ? PREP_MESSAGES_AR[prepIdx] : PREP_MESSAGES_EN[prepIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="text-[10px] text-muted-foreground/50 font-light mt-2">
                {isAr ? 'لحظات قليلة…' : 'Just a moment…'}
              </p>
              <p className="quran-uthmani text-foreground/40 mt-10" style={{ fontSize: 13 }}>
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
