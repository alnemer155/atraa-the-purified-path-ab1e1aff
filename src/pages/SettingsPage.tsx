import { useState } from 'react';
import { Bell, Shield, FileText, Mail, ExternalLink, ChevronLeft, Info, User, Code2, Calendar, Globe, Moon, MessageCircle, Share2, Download, Copy, Check, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, getHijriAdjustment, setHijriAdjustment } from '@/lib/user';
import CityPicker from '@/components/CityPicker';
import { motion, AnimatePresence } from 'framer-motion';

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

  const toggleNotif = (type: string, current: boolean, setter: (v: boolean) => void) => {
    const next = !current;
    setter(next);
    localStorage.setItem(`atraa_notif_${type}`, String(next));
    if (next && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
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

  const NotifToggle = ({ label, subtitle, enabled, onToggle }: { label: string; subtitle: string; enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-3.5 active:bg-secondary/30 transition-colors">
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className={`w-10 h-[22px] rounded-full transition-all duration-200 flex items-center px-0.5 ${enabled ? 'bg-primary justify-start' : 'bg-border/80 justify-end'}`}>
        <motion.div layout className="w-[18px] h-[18px] rounded-full bg-card shadow-sm" />
      </div>
    </button>
  );

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <h1 className="text-lg font-bold text-foreground">الإعدادات</h1>

      {/* User card */}
      {user && (
        <div className="bg-card rounded-2xl shadow-card border border-border/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl islamic-gradient flex items-center justify-center shadow-card">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 text-right min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.title && user.title !== 'none' ? `${user.title} ` : ''}{user.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{user.email || 'حساب محلي'}</p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1.5 rounded-lg bg-secondary/60 text-xs font-medium text-foreground hover:bg-primary/8 hover:text-primary transition-colors"
            >
              تعديل
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground px-1">الإشعارات</p>
        <div className="bg-card rounded-2xl shadow-card border border-border/30 overflow-hidden divide-y divide-border/30">
          <div className="flex items-center gap-3 p-4 pb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">إدارة الإشعارات</p>
          </div>
          <NotifToggle label="إشعارات الأذان" subtitle="تنبيه عند دخول وقت الصلاة" enabled={adhanNotif} onToggle={() => toggleNotif('adhan', adhanNotif, setAdhanNotif)} />
          <NotifToggle label="تذكير الأذكار" subtitle="تذكير يومي بالأذكار" enabled={dhikrNotif} onToggle={() => toggleNotif('dhikr', dhikrNotif, setDhikrNotif)} />
          <NotifToggle label="الصلاة على النبي" subtitle="الصلاة على محمد وآل محمد" enabled={salawatNotif} onToggle={() => toggleNotif('salawat', salawatNotif, setSalawatNotif)} />
          <NotifToggle label="إشعارات المسابقة" subtitle="تنبيه قبل بدء الأسئلة" enabled={quizNotif} onToggle={() => toggleNotif('quiz', quizNotif, setQuizNotif)} />
          <NotifToggle label="دعاء اليوم" subtitle="تذكير يومي بقراءة دعاء مقترح" enabled={duaNotif} onToggle={() => toggleNotif('dua', duaNotif, setDuaNotif)} />
        </div>
      </div>

      {/* Location & Date */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground px-1">الطقس والتاريخ</p>
        <CityPicker selectedCity={selectedCity} onCityChange={handleCityChange} />
        <div className="bg-card rounded-2xl shadow-card border border-border/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">تعديل التاريخ الهجري</p>
              <p className="text-[10px] text-muted-foreground">تصحيح فرق الأيام</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[-2, -1, 0, 1, 2].map(val => (
              <button
                key={val}
                onClick={() => handleHijriChange(val)}
                className={`w-11 h-9 rounded-lg text-sm font-medium transition-all ${
                  hijriAdj === val
                    ? 'islamic-gradient text-primary-foreground shadow-card'
                    : 'bg-secondary/50 text-foreground hover:bg-primary/8'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Share & Install */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground px-1">مشاركة وتحميل</p>
        <div className="bg-card rounded-2xl shadow-card border border-border/30 overflow-hidden divide-y divide-border/30">
          <button onClick={handleShareApp} className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/30 transition-colors active:bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">مشاركة التطبيق</p>
            </div>
            {shareCopied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground/40" />}
          </button>
          <button onClick={() => setShowInstallGuide(true)} className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/30 transition-colors active:bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">تحميل التطبيق</p>
            </div>
            <Smartphone className="w-3.5 h-3.5 text-muted-foreground/40" />
          </button>
        </div>
      </div>

      {/* PWA Install Guide */}
      <AnimatePresence>
        {showInstallGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm px-5"
            onClick={() => setShowInstallGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl p-5 shadow-elevated max-w-sm w-full max-h-[80vh] overflow-y-auto border border-border/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-bold text-foreground mb-4 text-center">تحميل التطبيق</h2>
              
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base">🤖</span>
                  <h3 className="text-sm font-semibold text-foreground">أندرويد</h3>
                </div>
                <ol className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed pr-4">
                  <li className="flex gap-2"><span className="text-primary font-bold">1.</span>افتح الموقع في Chrome</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">2.</span>اضغط ⋮ ثم "إضافة إلى الشاشة الرئيسية"</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">3.</span>اضغط "إضافة" وسيظهر كتطبيق</li>
                </ol>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-base">🍎</span>
                  <h3 className="text-sm font-semibold text-foreground">آيفون (Safari)</h3>
                </div>
                <ol className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed pr-4">
                  <li className="flex gap-2"><span className="text-primary font-bold">1.</span>افتح الموقع في Safari</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">2.</span>اضغط ⬆️ ثم "إضافة إلى الشاشة الرئيسية"</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">3.</span>اضغط "إضافة" وسيعمل كتطبيق مستقل</li>
                </ol>
              </div>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-2.5 rounded-xl bg-secondary/60 text-foreground text-sm font-medium"
              >
                حسناً
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground px-1">قانوني</p>
        <div className="bg-card rounded-2xl shadow-card border border-border/30 overflow-hidden divide-y divide-border/30">
          <Link to="/policies" className="flex items-center justify-between p-3.5 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">سياسة الخصوصية</p>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30" />
          </Link>
          <Link to="/policies" className="flex items-center justify-between p-3.5 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">شروط الاستخدام</p>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/30" />
          </Link>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground px-1">قريباً</p>
        <div className="bg-card rounded-2xl shadow-card border border-border/30 overflow-hidden divide-y divide-border/30">
          <div className="flex items-center justify-between p-3.5 opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">English Language</p>
                <p className="text-[10px] text-muted-foreground">دعم اللغة الإنجليزية</p>
              </div>
            </div>
            <span className="text-[9px] font-semibold text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-full">قريباً</span>
          </div>
          <div className="flex items-center justify-between p-3.5 opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center">
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">الوضع الداكن</p>
                <p className="text-[10px] text-muted-foreground">Dark Mode</p>
              </div>
            </div>
            <span className="text-[9px] font-semibold text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-full">قريباً</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gold-light/50 rounded-2xl p-3.5 flex items-start gap-2.5 border border-border/20">
        <Info className="w-3.5 h-3.5 text-accent-foreground flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-foreground leading-relaxed">
          المطور لا يتحكم في أوقات الصلاة. البيانات مقدمة من واجهة Aladhan API. للملاحظات والتصحيحات يرجى التواصل عبر البريد.
        </p>
      </div>

      {/* About */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground px-1">حول التطبيق</p>
        <div className="bg-card rounded-2xl shadow-card border border-border/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl islamic-gradient flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">عبدالله بن جعفر</p>
              <p className="text-[10px] text-muted-foreground">المطوّر</p>
            </div>
          </div>

          <div className="space-y-1">
            <a href="https://whatsapp.com/channel/0029VbCNwblJZg466AM5CC2R" target="_blank" rel="noopener" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">قناة واتساب</span>
              </div>
              <span className="text-[10px] text-muted-foreground">قــناة عِتْرَةً</span>
            </a>
            <a href="https://instagram.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">Instagram</span>
              </div>
              <span className="text-[10px] text-muted-foreground">@nr_aj5</span>
            </a>
            <a href="https://x.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">X (Twitter)</span>
              </div>
              <span className="text-[10px] text-muted-foreground">@nr_aj5</span>
            </a>
            <a href="mailto:a.jaafar.dev@gmail.com" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">البريد الإلكتروني</span>
              </div>
              <span className="text-[10px] text-muted-foreground">a.jaafar.dev@gmail.com</span>
            </a>
          </div>

          <p className="text-[9px] text-muted-foreground/60 mt-2 px-1">البريد مخصص للاقتراحات والمشاكل التقنية فقط.</p>
        </div>
      </div>

      {/* Version */}
      <div className="text-center pb-6 pt-1">
        <p className="text-[11px] text-muted-foreground">عِتَرَةً</p>
        <p className="text-[9px] text-muted-foreground/50 mt-0.5">v3.0 · بناء 100</p>
      </div>
    </div>
  );
};

export default SettingsPage;
