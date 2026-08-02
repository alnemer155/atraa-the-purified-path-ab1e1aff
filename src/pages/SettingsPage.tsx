import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Share2, Bell, BellOff, Sun, Coffee, Moon, Sparkles, Mail, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getHijriAdjustment, setHijriAdjustment } from '@/lib/user';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notifications';
import { useQuranTheme, type QuranTheme } from '@/lib/quran-theme';
import { supabase } from '@/integrations/supabase/client';
import CityPicker from '@/components/CityPicker';
import ExpoGoDialog, { EXPO_PREVIEW } from '@/components/ExpoGoDialog';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  const [adhanNotif, setAdhanNotif] = useState(() =>
    localStorage.getItem('atraa_notif_adhan') === 'true' && getNotificationPermission() === 'granted'
  );
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('atraa_city') || 'Dammam');
  const [hijriAdj, setHijriAdj] = useState(() => getHijriAdjustment());
  const [shareCopied, setShareCopied] = useState(false);
  const [expoOpen, setExpoOpen] = useState(false);

  // v2.11.00 — Notifications Center (email + per-type toggles, stored locally
  // until the Resend edge-function schedule is wired server-side).
  const NOTIF_TYPES = [
    { key: 'daily_athkar',   labelAr: 'الأذكار اليومية',           labelEn: 'Daily athkar' },
    { key: 'incomplete',     labelAr: 'تذكير بالدعاء أو الزيارة',   labelEn: 'Incomplete devotions' },
    { key: 'prayer_times',   labelAr: 'أوقات الصلاة',              labelEn: 'Prayer times' },
    { key: 'occasions',      labelAr: 'المناسبات الإسلامية',        labelEn: 'Islamic occasions' },
    { key: 'platform',       labelAr: 'تحديثات المنصة',            labelEn: 'Platform updates' },
  ] as const;

  const [notifEmail, setNotifEmail] = useState(() => localStorage.getItem('atraa_notif_email') ?? '');
  const [emailSaved, setEmailSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('atraa_notif_prefs_v1');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return Object.fromEntries(NOTIF_TYPES.map(n => [n.key, true]));
  });

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const saveEmail = async () => {
    const v = notifEmail.trim();
    if (!isValidEmail(v)) {
      toast.error(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }
    const previous = localStorage.getItem('atraa_notif_email') ?? '';
    localStorage.setItem('atraa_notif_email', v);
    setEmailSaved(true);
    toast.success(isAr ? 'تم حفظ البريد' : 'Email saved');
    setTimeout(() => setEmailSaved(false), 1800);

    // Send welcome + prayer-reminder confirmation once per email (v2.11.00).
    if (v !== previous) {
      const html = `
        <div dir="rtl" style="font-family:'Qomra Arabic',Tahoma,Arial,sans-serif;background:#faf7f2;padding:32px;color:#1a1a1a">
          <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #eee">
            <h1 style="font-size:22px;font-weight:500;margin:0 0 16px">أهلاً بك في منصة عِتْرَة</h1>
            <p style="line-height:1.9;font-size:15px;color:#3a3a3a;margin:0 0 12px">
              تم تفعيل الإشعارات على بريدك بنجاح. ستصلك التذكيرات التالية بإذن الله:
            </p>
            <ul style="line-height:2;font-size:15px;color:#3a3a3a;padding-inline-start:20px;margin:0 0 20px">
              <li>مواقيت الصلاة عند دخول كل وقت.</li>
              <li>الأذكار اليومية.</li>
              <li>المناسبات الإسلامية والحسينية.</li>
              <li>تذكير بإكمال الأدعية والزيارات.</li>
              <li>تحديثات المنصة والخدمات الجديدة.</li>
            </ul>
            <p style="font-size:13px;color:#7a7a7a;margin:24px 0 0">
              يمكنك تعديل أنواع الإشعارات أو إيقافها من الإعدادات في أي وقت.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="font-size:12px;color:#999;margin:0;text-align:center">
              منصة عِتْرَة الدينية · atraa.xyz
            </p>
          </div>
        </div>
      `;
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            to: v,
            type: 'welcome',
            subject: 'أهلاً بك في منصة عِتْرَة — تفعيل الإشعارات',
            html,
          },
        });
      } catch {
        // Silent — the email is a courtesy, not a blocker.
      }
    }
  };

  const toggleNotifPref = (key: string) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem('atraa_notif_prefs_v1', JSON.stringify(next));
  };

  // Reading mode (default / sepia / night) — applied app-wide.
  const [readingTheme, setReadingTheme] = useQuranTheme();


  const toggleAdhan = async () => {
    if (adhanNotif) {
      localStorage.setItem('atraa_notif_adhan', 'false');
      setAdhanNotif(false);
      return;
    }
    const granted = await requestNotificationPermission();
    if (granted) {
      localStorage.setItem('atraa_notif_adhan', 'true');
      setAdhanNotif(true);
    }
  };

  const handleCityChange = (city: string, coords: { lat: number; lng: number }) => {
    setSelectedCity(city);
    localStorage.setItem('atraa_city', city);
    localStorage.setItem('atraa_city_coords', JSON.stringify(coords));
    window.dispatchEvent(new StorageEvent('storage', { key: 'atraa_city_coords', newValue: JSON.stringify(coords) }));
  };

  const handleHijriChange = (val: number) => {
    setHijriAdj(val);
    setHijriAdjustment(val);
    window.dispatchEvent(new CustomEvent('hijri-adjust-changed', { detail: val }));
  };

  const changeLanguage = (lang: 'ar' | 'en') => {
    i18n.changeLanguage(lang);
  };

  const handleShareApp = async () => {
    const shareTextAr = `عِتْرَةً\n\nموقع وتطبيق ديني يقدّم الأدعية، الزيارات، أوقات الصلاة، والقبلة بشكل بسيط وموثوق.\n\nتجربة هادئة ومريحة للاستخدام اليومي، مع اعتماد على مصادر واضحة وإمكانية الرجوع إليها.\n\n🔗 https://atraa.xyz`;
    const shareTextEn = `Atraa\n\nA religious app and website offering supplications, ziyarat, prayer times, and Qibla in a simple, trustworthy way.\n\nA calm, comfortable daily experience, grounded in clear sources you can always trace back.\n\n🔗 https://atraa.xyz`;
    const shareText = isAr ? shareTextAr : shareTextEn;

    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: 'https://atraa.xyz' }); return; } catch { /* ignore */ }
    }
    await navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
    <div onClick={onClick} className={`w-11 h-[26px] rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer ${enabled ? 'bg-primary justify-end' : 'bg-border justify-start'}`}>
      <motion.div layout transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }} className="w-[22px] h-[22px] rounded-full bg-card shadow-sm" />
    </div>
  );

  return (
    <motion.div
      className={`px-4 py-4 pb-20 space-y-4 ${isAr ? 'text-right' : 'text-left'}`}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="px-1">
        <h1 className="text-[18px] text-foreground font-semibold">{t('settings.title')}</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">{t('settings.subtitle')}</p>
      </motion.div>

      {/* Language */}
      <motion.div variants={fadeUp} custom={1}>
        <p className="text-[11px] text-muted-foreground/70 px-1 mb-1.5 font-medium">{t('settings.language')}</p>
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-card">
          <div className="grid grid-cols-2 gap-2 p-2">
            <button
              onClick={() => changeLanguage('ar')}
              className={`py-2.5 rounded-xl text-[13px] transition-all ${i18n.language === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground'}`}
            >
              {t('settings.languageArabic')}
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`py-2.5 rounded-xl text-[13px] transition-all ${i18n.language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground'}`}
            >
              {t('settings.languageEnglish')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* App theme — sepia / muharram / rabee / ramadan (v2.11.00) */}
      <motion.div variants={fadeUp} custom={1}>
        <p className="text-[11px] text-muted-foreground/70 px-1 mb-1.5 font-medium">
          {isAr ? 'الوضع' : 'Theme'}
        </p>
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-card">
          <div className="grid grid-cols-3 gap-2 p-2">
            {([
              { id: 'default'  as const, labelAr: 'افتراضي', labelEn: 'Default',  Icon: Sun },
              
              { id: 'muharram' as const, labelAr: 'محرم',     labelEn: 'Muharram', Icon: Moon },
              { id: 'rabee'    as const, labelAr: 'ربيع',     labelEn: 'Rabee',    Icon: Sparkles },
              { id: 'ramadan'  as const, labelAr: 'رمضان',    labelEn: 'Ramadan',  Icon: Moon },
            ]).map((opt) => {
              const active = readingTheme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setReadingTheme(opt.id as QuranTheme)}
                  className={`py-2.5 rounded-xl text-[12px] flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.97] ${
                    active ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-foreground/80'
                  }`}
                  aria-pressed={active}
                >
                  <opt.Icon className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>{isAr ? opt.labelAr : opt.labelEn}</span>
                </button>
              );
            })}
          </div>
          <p className="px-3 pb-3 text-[10px] text-muted-foreground/65 font-light leading-relaxed">
            {isAr
              ? 'اختر السمة الموسمية المناسبة — تُطبَّق على التطبيق بالكامل وتُحفظ تلقائياً.'
              : 'Pick a seasonal mood — applies app-wide and is saved automatically.'}
          </p>
        </div>
      </motion.div>

      {/* v2.10.50 — madhhab toggle removed (platform is now strictly Shia). */}


      <motion.div variants={fadeUp} custom={2} className="space-y-2">
        <p className="text-[11px] text-muted-foreground/70 px-1 mb-1.5 font-medium">{t('settings.notifications')}</p>

        {/* System push toggle (adhan) */}
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-card">
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {adhanNotif ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground/50" />}
              <div className="min-w-0">
                <p className="text-[13px] text-foreground font-medium">{t('settings.adhanNotif')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('settings.adhanNotifHint')}</p>
              </div>
            </div>
            <Toggle enabled={adhanNotif} onClick={toggleAdhan} />
          </div>
        </div>

        {/* v2.11.00 — Email (required for scheduled Resend notifications) */}
        <div className="bg-card rounded-2xl border border-border/40 shadow-card p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-primary" />
            <p className="text-[12px] text-foreground font-medium">
              {isAr ? 'البريد الإلكتروني' : 'Email address'}
              <span className="text-destructive mr-1">*</span>
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
            {isAr
              ? 'إلزامي لاستلام إشعارات الأذكار والمناسبات وتحديثات المنصة.'
              : 'Required to receive athkar, occasion, and platform notifications.'}
          </p>
          <div className="flex gap-2 pt-1">
            <input
              type="email"
              value={notifEmail}
              onChange={(e) => setNotifEmail(e.target.value)}
              placeholder="name@example.com"
              dir="ltr"
              className="flex-1 h-10 px-3 rounded-xl bg-secondary/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
            />
            <button
              onClick={saveEmail}
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-medium active:scale-95 transition-transform flex items-center gap-1"
            >
              {emailSaved ? <Check className="w-3.5 h-3.5" /> : null}
              {isAr ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>

        {/* v2.11.00 — Notifications Center (per-type toggles) */}
        <div className="bg-card rounded-2xl border border-border/40 shadow-card overflow-hidden">
          <div className="px-3.5 pt-3 pb-2">
            <p className="text-[12px] text-foreground font-medium">
              {isAr ? 'مركز الإشعارات' : 'Notifications center'}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              {isAr ? 'اختر أنواع الإشعارات التي تريد استلامها.' : 'Pick which notification types you want to receive.'}
            </p>
          </div>
          <div className="divide-y divide-border/30">
            {NOTIF_TYPES.map((n) => (
              <div key={n.key} className="flex items-center justify-between px-3.5 py-2.5">
                <p className="text-[12.5px] text-foreground">{isAr ? n.labelAr : n.labelEn}</p>
                <Toggle enabled={!!notifPrefs[n.key]} onClick={() => toggleNotifPref(n.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* History link (placeholder — populated by edge function once wired) */}
        <div className="bg-card rounded-2xl border border-border/40 shadow-card">
          <Link to="/settings/notifications-log" className="flex items-center justify-between p-3.5 active:bg-secondary/30 transition-colors">
            <div className={isAr ? 'text-right' : 'text-left'}>
              <p className="text-[13px] text-foreground font-medium">{isAr ? 'سجل الإشعارات' : 'Notifications log'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{isAr ? 'الإشعارات السابقة المُرسَلة إلى بريدك.' : 'Previously sent notifications.'}</p>
            </div>
            <Chevron className="w-4 h-4 text-muted-foreground/40" />
          </Link>
        </div>
      </motion.div>

      {/* City & Hijri */}
      <motion.div variants={fadeUp} custom={3} className="space-y-2">
        <CityPicker selectedCity={selectedCity} onCityChange={handleCityChange} />

        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] text-foreground font-semibold">{t('settings.hijriAdjust')}</p>
            <span className="text-[10px] text-muted-foreground/60 tabular-nums font-light px-2 py-0.5 rounded-md bg-secondary/40">
              {hijriAdj > 0 ? `+${hijriAdj}` : hijriAdj} {isAr ? (Math.abs(hijriAdj) === 1 ? 'يوم' : 'أيام') : (Math.abs(hijriAdj) === 1 ? 'day' : 'days')}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 mb-4">{t('settings.hijriAdjustHint')}</p>

          {/* Stepper-style adjuster */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handleHijriChange(Math.max(-2, hijriAdj - 1))}
              disabled={hijriAdj <= -2}
              className="w-11 h-11 rounded-xl bg-secondary/50 border border-border/30 flex items-center justify-center text-foreground active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-transform"
              aria-label="decrease"
            >
              <span className="text-lg leading-none font-light">−</span>
            </button>

            {/* Tick scale */}
            <div className="flex-1 flex items-center justify-between px-2">
              {[-2, -1, 0, 1, 2].map(val => {
                const isSel = hijriAdj === val;
                const isZero = val === 0;
                return (
                  <button
                    key={val}
                    onClick={() => handleHijriChange(val)}
                    className="flex flex-col items-center gap-1.5 group"
                    aria-label={`${val > 0 ? '+' : ''}${val}`}
                  >
                    <span
                      className={`block rounded-full transition-all ${
                        isSel ? 'bg-primary w-2.5 h-2.5' : isZero ? 'bg-foreground/40 w-1.5 h-1.5' : 'bg-border w-1 h-1 group-active:bg-foreground/30'
                      }`}
                    />
                    <span className={`text-[9px] tabular-nums font-light transition-colors ${isSel ? 'text-primary font-medium' : 'text-muted-foreground/40'}`}>
                      {val > 0 ? `+${val}` : val}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleHijriChange(Math.min(2, hijriAdj + 1))}
              disabled={hijriAdj >= 2}
              className="w-11 h-11 rounded-xl bg-secondary/50 border border-border/30 flex items-center justify-center text-foreground active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-transform"
              aria-label="increase"
            >
              <span className="text-lg leading-none font-light">+</span>
            </button>
          </div>

          {hijriAdj !== 0 && (
            <button
              onClick={() => handleHijriChange(0)}
              className="mt-3 w-full py-2 rounded-lg text-[10px] text-muted-foreground/70 hover:text-foreground active:bg-secondary/40 transition-colors"
            >
              {isAr ? 'إعادة للافتراضي' : 'Reset to default'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Share + Support */}
      <motion.div variants={fadeUp} custom={4} className="space-y-1.5">
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-card">
          <button onClick={handleShareApp} className="w-full flex items-center justify-between p-3.5 active:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-primary" />
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="text-[13px] text-foreground font-medium">{t('settings.share')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('settings.shareHint')}</p>
              </div>
            </div>
            {shareCopied ? <Check className="w-4 h-4 text-primary" /> : <Chevron className="w-4 h-4 text-muted-foreground/40" />}
          </button>
        </div>
        {/* v2.11.16 — «دعم عترة» section fully removed. */}

      </motion.div>


      {/* v2.13.30 — Expo Go preview launcher */}
      <motion.div variants={fadeUp} custom={5}>
        <p className="text-[11px] text-muted-foreground/70 px-1 mb-1.5 font-medium">
          {isAr ? 'التطوير والتجربة' : 'Development & Preview'}
        </p>
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-card">
          <button onClick={() => setExpoOpen(true)} className="w-full flex items-center justify-between p-3.5 active:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-primary" strokeWidth={1.6} />
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="text-[13px] text-foreground font-medium">{isAr ? 'تطبيق Expo Go' : 'Expo Go App'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isAr ? `تشغيل النسخة التجريبية · ${EXPO_PREVIEW.version}` : `Launch preview · ${EXPO_PREVIEW.version}`}
                </p>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-muted-foreground/40" />
          </button>
        </div>
      </motion.div>

      <ExpoGoDialog open={expoOpen} onClose={() => setExpoOpen(false)} />



      {/* Legal */}
      <motion.div variants={fadeUp} custom={6}>
        <p className="text-[11px] text-muted-foreground/70 px-1 mb-1.5 font-medium">{t('settings.legal')}</p>
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden divide-y divide-border/30 shadow-card">
          {[
            { to: '/privacy', label: t('settings.privacy') },
            { to: '/terms', label: t('settings.terms') },
            { to: '/disclaimer', label: t('settings.disclaimer') },
            { to: '/data', label: t('settings.data') },
            { to: '/about', label: t('settings.about') },
          ].map(item => (
            <Link key={item.to} to={item.to} className="flex items-center justify-between p-3.5 active:bg-secondary/30 transition-colors">
              <p className="text-[13px] text-foreground">{item.label}</p>
              <Chevron className="w-4 h-4 text-muted-foreground/40" />
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
