import { useState, useEffect } from 'react';
import { Bell, Shield, FileText, Mail, ExternalLink, ChevronLeft, Info, User, Code2, Calendar, Globe, Moon, Sun, MessageCircle, Share2, Download, Copy, Check, Smartphone, LogOut, MailCheck, Send, Sparkles, Heart } from 'lucide-react';
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

/* ─── Glass Card ─── */
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40 shadow-card ${className}`}>
    {children}
  </div>
);

/* ─── Section Header ─── */
const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-2 px-1 mb-2.5">
    <div className="w-6 h-6 rounded-lg islamic-gradient flex items-center justify-center">
      <Icon className="w-3 h-3 text-primary-foreground" />
    </div>
    <p className="text-[11px] font-bold text-muted-foreground tracking-wide">{label}</p>
  </div>
);

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

  const NotifToggle = ({ label, subtitle, emoji, enabled, onToggle }: { label: string; subtitle: string; emoji: string; enabled: boolean; onToggle: () => void }) => (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onToggle} className="w-full flex items-center justify-between p-3.5 active:bg-secondary/20 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-base flex-shrink-0">{emoji}</span>
        <div className="text-right flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className={`w-11 h-[26px] rounded-full transition-all duration-300 flex items-center px-0.5 flex-shrink-0 mr-2 ${enabled ? 'bg-primary justify-start' : 'bg-border/60 justify-end'}`}>
        <motion.div layout transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }} className="w-[22px] h-[22px] rounded-full bg-card shadow-sm" />
      </div>
    </motion.button>
  );

  return (
    <motion.div
      className="px-4 py-5 pb-32 space-y-5"
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-black text-foreground">الإعدادات</h1>
          <p className="text-[10px] text-muted-foreground">تخصيص التجربة وإدارة الحساب</p>
        </div>
      </motion.div>

      {/* User card */}
      {user && (
        <motion.div variants={fadeUp} custom={1}>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
                <span className="text-2xl">{user.title === 'سيد' ? '🧕🏻' : '👤'}</span>
              </div>
              <div className="flex-1 text-right min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {user.title && user.title !== 'none' ? `${user.title} ` : ''}{user.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{user.email || 'حساب محلي'}</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/register')}
                  className="px-3.5 py-2 rounded-xl bg-primary/8 text-xs font-semibold text-primary hover:bg-primary/15 transition-all">
                  تعديل
                </motion.button>
                <motion.button whileTap={{ scale: 0.85 }}
                  onClick={handleSignOut}
                  className="w-9 h-9 rounded-xl bg-destructive/8 hover:bg-destructive/15 flex items-center justify-center transition-all">
                  <LogOut className="w-4 h-4 text-destructive" />
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Notifications Section */}
      <motion.div variants={fadeUp} custom={2}>
        <SectionHeader icon={Bell} label="الإشعارات" />
        <GlassCard className="overflow-hidden divide-y divide-border/15">
          <NotifToggle emoji="🕌" label="إشعارات الأذان" subtitle="تنبيه عند دخول وقت الصلاة" enabled={adhanNotif} onToggle={() => toggleNotifWithEmail('adhan', adhanNotif, setAdhanNotif)} />
          <NotifToggle emoji="📿" label="تذكير الأذكار" subtitle="أذكار الصباح والمساء" enabled={dhikrNotif} onToggle={() => toggleNotifWithEmail('dhikr', dhikrNotif, setDhikrNotif)} />
          <NotifToggle emoji="🤲🏻" label="الصلاة على النبي" subtitle="اللهم صلّ على محمد وآله" enabled={salawatNotif} onToggle={() => toggleNotifWithEmail('salawat', salawatNotif, setSalawatNotif)} />
          <NotifToggle emoji="🏆" label="إشعارات المسابقة" subtitle="تنبيه قبل بدء الأسئلة" enabled={quizNotif} onToggle={() => toggleNotifWithEmail('quiz', quizNotif, setQuizNotif)} />
          <NotifToggle emoji="🌙" label="دعاء اليوم" subtitle="تذكير يومي بدعاء مقترح" enabled={duaNotif} onToggle={() => toggleNotifWithEmail('dua', duaNotif, setDuaNotif)} />
        </GlassCard>
      </motion.div>

      {/* Email Notifications */}
      <motion.div variants={fadeUp} custom={3}>
        <GlassCard className="overflow-hidden">
          <motion.button whileTap={{ scale: 0.98 }}
            onClick={toggleEmailNotif}
            disabled={emailNotifLoading}
            className="w-full flex items-center justify-between p-4 active:bg-secondary/20 transition-colors disabled:opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <MailCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-foreground">
                  {emailNotif ? 'إشعارات البريد مفعّلة' : 'تفعيل إشعارات البريد'}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {user?.email || 'يرجى تسجيل الدخول أولاً'}
                </p>
              </div>
            </div>
            <div className={`w-11 h-[26px] rounded-full transition-all duration-300 flex items-center px-0.5 ${emailNotif ? 'bg-primary justify-start' : 'bg-border/60 justify-end'}`}>
              <motion.div layout transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }} className="w-[22px] h-[22px] rounded-full bg-card shadow-sm" />
            </div>
          </motion.button>
        </GlassCard>
      </motion.div>

      {/* Location & Date */}
      <motion.div variants={fadeUp} custom={4}>
        <SectionHeader icon={Calendar} label="الطقس والتاريخ" />
        <div className="space-y-3">
          <CityPicker selectedCity={selectedCity} onCityChange={handleCityChange} />
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-foreground">تعديل التاريخ الهجري</p>
                <p className="text-[10px] text-muted-foreground/70">تصحيح فرق الأيام</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[-2, -1, 0, 1, 2].map(val => (
                <motion.button whileTap={{ scale: 0.9 }}
                  key={val}
                  onClick={() => handleHijriChange(val)}
                  className={`w-13 h-11 rounded-xl text-sm font-semibold transition-all ${
                    hijriAdj === val
                      ? 'islamic-gradient text-primary-foreground shadow-elevated'
                      : 'bg-secondary/50 text-foreground hover:bg-primary/8 border border-border/30'
                  }`}
                  style={{ width: 52, height: 44 }}
                >
                  {val > 0 ? `+${val}` : val}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Share & Install */}
      <motion.div variants={fadeUp} custom={5}>
        <SectionHeader icon={Share2} label="مشاركة وتحميل" />
        <GlassCard className="overflow-hidden divide-y divide-border/15">
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleShareApp} className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <Share2 className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-foreground">مشاركة التطبيق</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">شارك عِتَرَةً مع أصدقائك</p>
              </div>
            </div>
            {shareCopied ? <Check className="w-4 h-4 text-primary" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground/30" />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowInstallGuide(true)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <Download className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-foreground">تحميل التطبيق</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">إضافة إلى الشاشة الرئيسية</p>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/30" />
          </motion.button>
        </GlassCard>
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
              className="bg-card rounded-3xl p-6 shadow-elevated max-w-sm w-full max-h-[80vh] overflow-y-auto border border-border/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl islamic-gradient flex items-center justify-center mx-auto mb-3 shadow-elevated">
                  <Smartphone className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-base font-black text-foreground">تحميل التطبيق</h2>
                <p className="text-[11px] text-muted-foreground mt-1">أضف التطبيق لشاشتك الرئيسية</p>
              </div>
              
              {[
                {
                  emoji: '🤖', title: 'أندرويد',
                  steps: ['افتح الموقع في Chrome', 'اضغط ⋮ ثم "إضافة إلى الشاشة الرئيسية"', 'اضغط "إضافة" وسيظهر كتطبيق']
                },
                {
                  emoji: '🍎', title: 'آيفون (Safari)',
                  steps: ['افتح الموقع في Safari', 'اضغط ⬆️ ثم "إضافة إلى الشاشة الرئيسية"', 'اضغط "إضافة" وسيعمل كتطبيق مستقل']
                }
              ].map((platform) => (
                <div key={platform.title} className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{platform.emoji}</span>
                    <h3 className="text-sm font-bold text-foreground">{platform.title}</h3>
                  </div>
                  <div className="space-y-2 pr-1">
                    {platform.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-lg islamic-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-black text-primary-foreground">{i + 1}</span>
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-3 rounded-2xl bg-secondary/60 text-foreground text-sm font-semibold">
                حسناً
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal */}
      <motion.div variants={fadeUp} custom={6}>
        <SectionHeader icon={Shield} label="قانوني" />
        <GlassCard className="overflow-hidden divide-y divide-border/15">
          <Link to="/policies" className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-primary" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">سياسة الخصوصية</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/30" />
          </Link>
          <Link to="/policies" className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-primary" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">شروط الاستخدام</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground/30" />
          </Link>
        </GlassCard>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp} custom={7}>
        <GlassCard className="p-4 !bg-accent/5 !border-accent/15">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-[11px] text-foreground leading-relaxed">
              المطور لا يتحكم في أوقات الصلاة. البيانات مقدمة من واجهة Aladhan API. للملاحظات والتصحيحات يرجى التواصل عبر البريد.
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* About */}
      <motion.div variants={fadeUp} custom={8}>
        <SectionHeader icon={Code2} label="حول التطبيق" />
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl islamic-gradient flex items-center justify-center shadow-elevated">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">عبدالله بن جعفر</p>
              <p className="text-[10px] text-muted-foreground">المطوّر</p>
            </div>
          </div>

          <div className="space-y-0.5">
            {/* Contact Form Button */}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => setShowContactForm(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">التواصل السريع</span>
              </div>
              <span className="text-[10px] text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-lg">شكوى · استفسار · طلب</span>
            </motion.button>

            {[
              { href: 'https://ajaafar.dev', icon: Globe, label: 'موقع المطوّر', value: 'ajaafar.dev' },
              { href: 'https://whatsapp.com/channel/0029VbCNwblJZg466AM5CC2R', icon: MessageCircle, label: 'قناة واتساب', value: 'قــناة عِتْرَةً' },
              { href: 'https://instagram.com/nr_aj5', icon: ExternalLink, label: 'Instagram', value: '@nr_aj5' },
              { href: 'mailto:a.jaafar.dev@gmail.com', icon: Mail, label: 'البريد الإلكتروني', value: 'a.jaafar.dev@gmail.com' },
            ].map(({ href, icon: Icon, label, value }) => (
              <a key={href} href={href} target="_blank" rel="noopener"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{value}</span>
              </a>
            ))}
          </div>

          <p className="text-[9px] text-muted-foreground/50 mt-3 px-1">البريد مخصص للاقتراحات والمشاكل التقنية فقط.</p>
        </GlassCard>
      </motion.div>

      {/* Languages */}
      <motion.div variants={fadeUp} custom={9}>
        <SectionHeader icon={Globe} label="اللغات" />
        <GlassCard className="overflow-hidden divide-y divide-border/15">
          {[
            { code: 'ع', name: 'العربية', label: 'اللغة الأساسية', active: true },
            { code: 'EN', name: 'English (British)', label: 'الإنجليزية البريطانية', active: true },
          ].map(lang => (
            <div key={lang.code} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl islamic-gradient flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{lang.code}</span>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-foreground">{lang.name}</p>
                  <p className="text-[10px] text-muted-foreground/70">{lang.label}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-primary bg-primary/8 px-2.5 py-1 rounded-full">مفعّل</span>
            </div>
          ))}
          {[
            { code: 'FR', name: 'Français', label: 'الفرنسية' },
            { code: 'فا', name: 'فارسی', label: 'الفارسية' },
            { code: 'DE', name: 'Deutsch', label: 'الألمانية' },
          ].map(lang => (
            <div key={lang.code} className="flex items-center justify-between p-4 opacity-35">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">{lang.code}</span>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-medium text-foreground">{lang.name}</p>
                  <p className="text-[10px] text-muted-foreground">{lang.label}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-accent-foreground bg-accent/15 px-2.5 py-1 rounded-full">قريباً</span>
            </div>
          ))}
        </GlassCard>
      </motion.div>

      {/* Version */}
      <motion.div variants={fadeUp} custom={10} className="text-center pb-8 pt-2">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Heart className="w-3 h-3 text-primary" />
          <p className="text-[11px] font-semibold text-foreground">عِتَرَةً</p>
        </div>
        <p className="text-[9px] text-muted-foreground/40 font-mono tabular-nums">v3.3 · بناء 160</p>
      </motion.div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
