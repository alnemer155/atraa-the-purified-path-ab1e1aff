import { useState, useEffect } from 'react';
import { Bell, Shield, FileText, Mail, ExternalLink, ChevronLeft, Info, User, Code2, Calendar, Globe, Moon, Sun, MessageCircle, Share2, Download, Copy, Check, Smartphone, LogOut, MailCheck, Send, Heart, Volume2, BookOpen, Trophy, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, getHijriAdjustment, setHijriAdjustment } from '@/lib/user';
import CityPicker from '@/components/CityPicker';
import ContactForm from '@/components/ContactForm';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = getUser();
  
  const [adhanNotif, setAdhanNotif] = useState(() => localStorage.getItem('atraa_notif_adhan') === 'true');
  const [dhikrNotif, setDhikrNotif] = useState(() => localStorage.getItem('atraa_notif_dhikr') === 'true');
  const [salawatNotif, setSalawatNotif] = useState(() => localStorage.getItem('atraa_notif_salawat') === 'true');
  const [quizNotif, setQuizNotif] = useState(() => localStorage.getItem('atraa_notif_quiz') === 'true');
  const [duaNotif, setDuaNotif] = useState(() => localStorage.getItem('atraa_notif_dua') === 'true');
  
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('atraa_weather_city') || 'Qatif');
  const [hijriAdj, setHijriAdj] = useState(() => getHijriAdjustment());
  const [shareCopied, setShareCopied] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [emailNotif, setEmailNotif] = useState(false);
  const [emailNotifLoading, setEmailNotifLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('atraa_theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    const loadEmailPref = async () => {
      const userEmail = user?.email;
      if (!userEmail) return;
      const { data } = await supabase
        .from('email_notification_prefs')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();
      if (data) setEmailNotif(true);
    };
    loadEmailPref();
  }, []);

  const toggleEmailNotif = async () => {
    const userEmail = user?.email;
    if (!userEmail) {
      toast.error('يرجى تسجيل الدخول أولاً للحصول على إشعارات البريد');
      return;
    }
    setEmailNotifLoading(true);
    try {
      if (emailNotif) {
        await supabase.from('email_notification_prefs').delete().eq('email', userEmail);
        setEmailNotif(false);
        toast.success('تم إلغاء إشعارات البريد');
      } else {
        const deviceId = localStorage.getItem('atraa_device_id') || crypto.randomUUID();
        await supabase.from('email_notification_prefs').upsert({
          email: userEmail,
          device_id: deviceId,
          adhan: adhanNotif,
          dhikr: dhikrNotif,
          salawat: salawatNotif,
          quiz: quizNotif,
          dua: duaNotif,
        }, { onConflict: 'email' });
        setEmailNotif(true);
        toast.success('تم تفعيل إشعارات البريد الإلكتروني');
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setEmailNotifLoading(false);
  };

  const toggleNotifWithEmail = async (type: string, current: boolean, setter: (v: boolean) => void) => {
    const next = !current;
    setter(next);
    localStorage.setItem(`atraa_notif_${type}`, String(next));
    if (next && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    if (emailNotif && user?.email) {
      await supabase.from('email_notification_prefs').update({ [type]: next, updated_at: new Date().toISOString() }).eq('email', user.email);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('atraa_weather_city', city);
    window.dispatchEvent(new StorageEvent('storage', { key: 'atraa_weather_city', newValue: city }));
  };

  const handleHijriChange = (val: number) => {
    setHijriAdj(val);
    setHijriAdjustment(val);
    window.dispatchEvent(new CustomEvent('hijri-adjust-changed', { detail: val }));
  };

  const handleShareApp = async () => {
    const shareText = 'عِتَرَةً منصة إسلامية شيعية تهدف إلى تقديم المحتوى الديني بصورة حديثة ومنظمة، تجمع بين الفائدة وسهولة الاستخدام.\n\nاكتشفه وجرب الآن: https://atraa.xyz';
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch {}
    }
    await navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('atraa_user');
    toast.success('تم تسجيل الخروج');
    navigate('/register');
  };

  const NotifToggle = ({ label, subtitle, icon: Icon, enabled, onToggle }: { label: string; subtitle: string; icon: any; enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-3.5 active:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="w-[18px] h-[18px] text-primary/70 flex-shrink-0" />
        <div className="text-right flex-1 min-w-0">
          <p className="text-[13px] text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-light">{subtitle}</p>
        </div>
      </div>
      <div className={`w-11 h-[26px] rounded-full transition-all duration-300 flex items-center px-0.5 flex-shrink-0 mr-2 ${enabled ? 'bg-primary justify-start' : 'bg-border/60 justify-end'}`}>
        <motion.div layout transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }} className="w-[22px] h-[22px] rounded-full bg-card shadow-sm" />
      </div>
    </button>
  );

  /* ── Row link ── */
  const RowLink = ({ icon: Icon, label, subtitle, onClick, trailing }: { icon: any; label: string; subtitle?: string; onClick?: () => void; trailing?: React.ReactNode }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-[18px] h-[18px] text-primary/70 flex-shrink-0" />
        <div className="text-right">
          <p className="text-[13px] text-foreground">{label}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-light">{subtitle}</p>}
        </div>
      </div>
      {trailing || <ChevronLeft className="w-4 h-4 text-muted-foreground/20" />}
    </button>
  );

  return (
    <motion.div
      className="px-4 py-5 pb-32 space-y-5"
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="px-1">
        <h1 className="text-lg text-foreground">الإعدادات</h1>
        <p className="text-[10px] text-muted-foreground font-light">تخصيص التجربة وإدارة الحساب</p>
      </motion.div>

      {/* User card */}
      {user && (
        <motion.div variants={fadeUp} custom={1}>
          <div className="bg-card rounded-2xl border border-border/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full islamic-gradient flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 text-right min-w-0">
                <p className="text-sm text-foreground truncate">
                  {user.title && user.title !== 'none' ? `${user.title} ` : ''}{user.name}
                </p>
                <p className="text-[11px] text-muted-foreground font-light mt-0.5">{user.email || 'حساب محلي'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/register')}
                  className="px-3.5 py-2 rounded-xl bg-primary/8 text-xs text-primary">
                  تعديل
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-9 h-9 rounded-xl bg-destructive/8 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Section */}
      <motion.div variants={fadeUp} custom={2}>
        <p className="text-[11px] text-muted-foreground px-1 mb-2">الإشعارات</p>
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden divide-y divide-border/15">
          <NotifToggle icon={Volume2} label="إشعارات الأذان" subtitle="تنبيه عند دخول وقت الصلاة" enabled={adhanNotif} onToggle={() => toggleNotifWithEmail('adhan', adhanNotif, setAdhanNotif)} />
          <NotifToggle icon={BookOpen} label="تذكير الأذكار" subtitle="أذكار الصباح والمساء" enabled={dhikrNotif} onToggle={() => toggleNotifWithEmail('dhikr', dhikrNotif, setDhikrNotif)} />
          <NotifToggle icon={Heart} label="الصلاة على النبي" subtitle="اللهم صلّ على محمد وآله" enabled={salawatNotif} onToggle={() => toggleNotifWithEmail('salawat', salawatNotif, setSalawatNotif)} />
          <NotifToggle icon={Trophy} label="إشعارات المسابقة" subtitle="تنبيه قبل بدء الأسئلة" enabled={quizNotif} onToggle={() => toggleNotifWithEmail('quiz', quizNotif, setQuizNotif)} />
          <NotifToggle icon={Star} label="دعاء اليوم" subtitle="تذكير يومي بدعاء مقترح" enabled={duaNotif} onToggle={() => toggleNotifWithEmail('dua', duaNotif, setDuaNotif)} />
        </div>
      </motion.div>

      {/* Email Notifications */}
      <motion.div variants={fadeUp} custom={3}>
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
          <button
            onClick={toggleEmailNotif}
            disabled={emailNotifLoading}
            className="w-full flex items-center justify-between p-3.5 active:bg-secondary/20 transition-colors disabled:opacity-50">
            <div className="flex items-center gap-3">
              <MailCheck className="w-[18px] h-[18px] text-primary/70" />
              <div className="text-right">
                <p className="text-[13px] text-foreground">
                  {emailNotif ? 'إشعارات البريد مفعّلة' : 'تفعيل إشعارات البريد'}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-light">
                  {user?.email || 'يرجى تسجيل الدخول أولاً'}
                </p>
              </div>
            </div>
            <div className={`w-11 h-[26px] rounded-full transition-all duration-300 flex items-center px-0.5 ${emailNotif ? 'bg-primary justify-start' : 'bg-border/60 justify-end'}`}>
              <motion.div layout transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }} className="w-[22px] h-[22px] rounded-full bg-card shadow-sm" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Location & Date */}
      <motion.div variants={fadeUp} custom={4}>
        <p className="text-[11px] text-muted-foreground px-1 mb-2">الطقس والتاريخ</p>
        <div className="space-y-3">
          <CityPicker selectedCity={selectedCity} onCityChange={handleCityChange} />
          <div className="bg-card rounded-2xl border border-border/30 p-4">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-[18px] h-[18px] text-primary/70" />
              <div className="text-right">
                <p className="text-[13px] text-foreground">تعديل التاريخ الهجري</p>
                <p className="text-[10px] text-muted-foreground/60 font-light">تصحيح فرق الأيام</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[-2, -1, 0, 1, 2].map(val => (
                <button
                  key={val}
                  onClick={() => handleHijriChange(val)}
                  className={`rounded-xl text-sm transition-all ${
                    hijriAdj === val
                      ? 'islamic-gradient text-primary-foreground'
                      : 'bg-secondary/50 text-foreground border border-border/30'
                  }`}
                  style={{ width: 52, height: 44 }}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share & Install */}
      <motion.div variants={fadeUp} custom={5}>
        <p className="text-[11px] text-muted-foreground px-1 mb-2">مشاركة وتحميل</p>
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden divide-y divide-border/15">
          <RowLink icon={Share2} label="مشاركة التطبيق" subtitle="شارك عِتَرَةً مع أصدقائك" onClick={handleShareApp}
            trailing={shareCopied ? <Check className="w-4 h-4 text-primary" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground/20" />} />
          <RowLink icon={Download} label="تحميل التطبيق" subtitle="إضافة إلى الشاشة الرئيسية" onClick={() => setShowInstallGuide(true)} />
        </div>
      </motion.div>

      {/* PWA Install Guide */}
      <AnimatePresence>
        {showInstallGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-md px-5"
            onClick={() => setShowInstallGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto border border-border/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <Smartphone className="w-6 h-6 text-primary mx-auto mb-3" />
                <h2 className="text-base text-foreground">تحميل التطبيق</h2>
                <p className="text-[11px] text-muted-foreground font-light mt-1">أضف التطبيق لشاشتك الرئيسية</p>
              </div>
              
              {[
                {
                  title: 'أندرويد',
                  steps: ['افتح الموقع في Chrome', 'اضغط القائمة ثم "إضافة إلى الشاشة الرئيسية"', 'اضغط "إضافة" وسيظهر كتطبيق']
                },
                {
                  title: 'آيفون (Safari)',
                  steps: ['افتح الموقع في Safari', 'اضغط زر المشاركة ثم "إضافة إلى الشاشة الرئيسية"', 'اضغط "إضافة" وسيعمل كتطبيق مستقل']
                }
              ].map((platform) => (
                <div key={platform.title} className="mb-5">
                  <h3 className="text-sm text-foreground mb-3">{platform.title}</h3>
                  <div className="space-y-2 pr-1">
                    {platform.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[10px] text-primary mt-0.5 flex-shrink-0">{i + 1}</span>
                        <p className="text-[12px] text-muted-foreground leading-relaxed font-light">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-3 rounded-2xl bg-secondary/60 text-foreground text-sm">
                حسناً
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support */}
      <motion.div variants={fadeUp} custom={5.5}>
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
          <Link to="/support" className="flex items-center justify-between p-3.5 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <Heart className="w-[18px] h-[18px] text-primary/70" />
              <div className="text-right">
                <p className="text-[13px] text-foreground">داعم الموقع</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-light">ادعم مشروع عِتَرَةً</p>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/20" />
          </Link>
        </div>
      </motion.div>

      {/* Legal */}
      <motion.div variants={fadeUp} custom={6}>
        <p className="text-[11px] text-muted-foreground px-1 mb-2">قانوني</p>
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden divide-y divide-border/15">
          <Link to="/policies" className="flex items-center justify-between p-3.5 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-[18px] h-[18px] text-primary/70" />
              <p className="text-[13px] text-foreground">سياسة الخصوصية</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/20" />
          </Link>
          <Link to="/policies" className="flex items-center justify-between p-3.5 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-[18px] h-[18px] text-primary/70" />
              <p className="text-[13px] text-foreground">شروط الاستخدام</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/20" />
          </Link>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp} custom={7}>
        <div className="bg-card rounded-2xl border border-border/30 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
              المطور لا يتحكم في أوقات الصلاة. البيانات مقدمة من واجهة Aladhan API. للملاحظات والتصحيحات يرجى التواصل عبر البريد.
            </p>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={fadeUp} custom={8}>
        <p className="text-[11px] text-muted-foreground px-1 mb-2">حول التطبيق</p>
        <div className="bg-card rounded-2xl border border-border/30 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full islamic-gradient flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-foreground">عبدالله بن جعفر</p>
              <p className="text-[10px] text-muted-foreground font-light">المطوّر</p>
            </div>
          </div>

          <div className="space-y-0.5">
            {/* Contact Form Button */}
            <button
              onClick={() => setShowContactForm(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-primary/70" />
                <span className="text-xs text-foreground">التواصل السريع</span>
              </div>
              <span className="text-[10px] text-muted-foreground">شكوى · استفسار · طلب</span>
            </button>

            {[
              { href: 'https://abj-dev.xyz', icon: Globe, label: 'موقع المطوّر', value: 'Platform Dev' },
              { href: 'https://whatsapp.com/channel/0029VbCNwblJZg466AM5CC2R', icon: MessageCircle, label: 'قناة واتساب', value: 'قــناة عِتْرَةً' },
              { href: 'https://instagram.com/nr_aj5', icon: ExternalLink, label: 'Instagram', value: '@nr_aj5' },
              { href: 'mailto:a.jaafar.dev@gmail.com', icon: Mail, label: 'البريد الإلكتروني', value: 'a.jaafar.dev@gmail.com' },
            ].map(({ href, icon: Icon, label, value }) => (
              <a key={href} href={href} target="_blank" rel="noopener"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-primary/70" />
                  <span className="text-xs text-foreground">{label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-light">{value}</span>
              </a>
            ))}
          </div>

          <p className="text-[9px] text-muted-foreground/50 mt-3 px-1 font-light">البريد مخصص للاقتراحات والمشاكل التقنية فقط.</p>
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div variants={fadeUp} custom={9}>
        <p className="text-[11px] text-muted-foreground px-1 mb-2">المظهر</p>
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
          <button onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3.5 active:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-[18px] h-[18px] text-primary/70" /> : <Sun className="w-[18px] h-[18px] text-primary/70" />}
              <div className="text-right">
                <p className="text-[13px] text-foreground">{isDark ? 'الوضع الليلي' : 'الوضع النهاري'}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-light">اضغط للتبديل</p>
              </div>
            </div>
            <div className={`w-11 h-[26px] rounded-full transition-all duration-300 flex items-center px-0.5 ${isDark ? 'bg-primary justify-start' : 'bg-border/60 justify-end'}`}>
              <motion.div layout transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }} className="w-[22px] h-[22px] rounded-full bg-card shadow-sm" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Version */}
      <motion.div variants={fadeUp} custom={10} className="text-center pb-8 pt-2">
        <p className="text-[11px] text-foreground mb-0.5">عِتَرَةً</p>
        <p className="text-[9px] text-muted-foreground/40 font-light tabular-nums">v5.0 · بناء 300</p>
      </motion.div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
