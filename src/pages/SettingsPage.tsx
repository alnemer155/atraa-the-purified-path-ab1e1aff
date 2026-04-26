import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Share2, Bell, BellOff, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getHijriAdjustment, setHijriAdjustment } from '@/lib/user';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notifications';
import CityPicker from '@/components/CityPicker';

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
      className={`px-4 py-4 pb-32 space-y-4 ${isAr ? 'text-right' : 'text-left'}`}
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

      {/* Notifications */}
      <motion.div variants={fadeUp} custom={2}>
        <p className="text-[11px] text-muted-foreground/70 px-1 mb-1.5 font-medium">{t('settings.notifications')}</p>
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
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-card">
          <Link to="/support" className="w-full flex items-center justify-between p-3.5 active:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-primary" />
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="text-[13px] text-foreground font-medium">{t('settings.support')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('settings.supportHint')}</p>
              </div>
            </div>
            <Chevron className="w-4 h-4 text-muted-foreground/40" />
          </Link>
        </div>
      </motion.div>


      {/* Legal */}
      <motion.div variants={fadeUp} custom={5}>
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
