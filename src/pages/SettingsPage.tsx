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
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('atraa_city') || 'Qatif');
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
    const shareText = isAr
      ? 'عِتَرَةً منصة إسلامية شيعية. اكتشفها: https://atraa.xyz'
      : 'Atraa — an Islamic Shia platform. Discover it: https://atraa.xyz';
    
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch { /* ignore */ }
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

        <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-card">
          <div className="mb-3">
            <p className="text-[13px] text-foreground font-semibold">{t('settings.hijriAdjust')}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('settings.hijriAdjustHint')}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[-2, -1, 0, 1, 2].map(val => (
              <button
                key={val}
                onClick={() => handleHijriChange(val)}
                className={`rounded-lg text-[13px] transition-all ${
                  hijriAdj === val
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-foreground border border-border/30'
                }`}
                style={{ width: 50, height: 40 }}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Share */}
      <motion.div variants={fadeUp} custom={4}>
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
