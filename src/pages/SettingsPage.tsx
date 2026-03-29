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
    <button onClick={onToggle} className="w-full flex items-center justify-between p-3.5">
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${enabled ? 'bg-primary justify-start' : 'bg-border justify-end'}`}>
        <div className="w-5 h-5 rounded-full bg-card shadow-sm" />
      </div>
    </button>
  );

  return (
    <div className="px-4 py-4 space-y-5 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground">الإعدادات</h1>

      {/* User profile card */}
      {user && (
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl islamic-gradient flex items-center justify-center shadow-card">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold text-foreground">
                {user.title && user.title !== 'none' ? `${user.title} ` : ''}{user.name}
              </p>
              {user.email && <p className="text-[11px] text-muted-foreground mt-0.5">{user.email}</p>}
              {!user.email && <p className="text-[11px] text-muted-foreground mt-0.5">حساب محلي</p>}
            </div>
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              تعديل
            </button>
          </div>
        </div>
      )}

      {/* Notifications section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">الإشعارات</p>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          <div className="flex items-center gap-3 p-4 pb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Bell className="w-[18px] h-[18px] text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">إدارة الإشعارات</p>
          </div>
          <NotifToggle label="إشعارات الأذان" subtitle="تنبيه عند دخول وقت الصلاة" enabled={adhanNotif} onToggle={() => toggleNotif('adhan', adhanNotif, setAdhanNotif)} />
          <NotifToggle label="تذكير الأذكار" subtitle="تذكير يومي بالأذكار" enabled={dhikrNotif} onToggle={() => toggleNotif('dhikr', dhikrNotif, setDhikrNotif)} />
          <NotifToggle label="الصلاة على النبي" subtitle="الصلاة على محمد وآل محمد" enabled={salawatNotif} onToggle={() => toggleNotif('salawat', salawatNotif, setSalawatNotif)} />
          <NotifToggle label="إشعارات المسابقة" subtitle="تنبيه قبل بدء الأسئلة اليومية" enabled={quizNotif} onToggle={() => toggleNotif('quiz', quizNotif, setQuizNotif)} />
          <NotifToggle label="دعاء اليوم" subtitle="تذكير يومي بقراءة دعاء مقترح" enabled={duaNotif} onToggle={() => toggleNotif('dua', duaNotif, setDuaNotif)} />
        </div>
      </div>

      {/* Weather & Date section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">الطقس والتاريخ</p>
        <CityPicker selectedCity={selectedCity} onCityChange={handleCityChange} />
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Calendar className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">تعديل التاريخ الهجري</p>
              <p className="text-[11px] text-muted-foreground">تصحيح فرق الأيام في التاريخ الهجري</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            {[-2, -1, 0, 1, 2].map(val => (
              <button
                key={val}
                onClick={() => handleHijriChange(val)}
                className={`w-12 h-10 rounded-xl text-sm font-medium transition-all ${
                  hijriAdj === val
                    ? 'islamic-gradient text-primary-foreground shadow-card'
                    : 'bg-secondary text-foreground hover:bg-primary/10'
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Share & Install */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">مشاركة وتحميل</p>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          <button onClick={handleShareApp} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                <Share2 className="w-[18px] h-[18px] text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">مشاركة التطبيق</p>
            </div>
            {shareCopied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={() => setShowInstallGuide(true)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                <Download className="w-[18px] h-[18px] text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">تحميل التطبيق</p>
            </div>
            <Smartphone className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* PWA Install Guide Modal */}
      <AnimatePresence>
        {showInstallGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-5"
            onClick={() => setShowInstallGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-5 shadow-elevated max-w-sm w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4 text-center">تحميل التطبيق</h2>
              
              {/* Android */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤖</span>
                  <h3 className="text-sm font-semibold text-foreground">أندرويد (Samsung, Huawei, وغيرها)</h3>
                </div>
                <ol className="space-y-2 text-xs text-muted-foreground leading-relaxed pr-4">
                  <li className="flex gap-2"><span className="text-primary font-bold">1.</span>افتح الموقع في متصفح Chrome</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">2.</span>اضغط على أيقونة القائمة ⋮ (ثلاث نقاط) في الأعلى</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">3.</span>اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">4.</span>اضغط "إضافة" وسيظهر التطبيق على شاشتك الرئيسية</li>
                </ol>
              </div>

              {/* iOS */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🍎</span>
                  <h3 className="text-sm font-semibold text-foreground">آيفون (iOS 26 / Safari)</h3>
                </div>
                <ol className="space-y-2 text-xs text-muted-foreground leading-relaxed pr-4">
                  <li className="flex gap-2"><span className="text-primary font-bold">1.</span>افتح الموقع في متصفح Safari</li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>اضغط على أيقونة المشاركة <span className="inline-block px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">⬆️</span> في شريط الأدوات السفلي</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>مرر للأسفل واضغط "إضافة إلى الشاشة الرئيسية" <span className="inline-block px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">➕</span></span>
                  </li>
                  <li className="flex gap-2"><span className="text-primary font-bold">4.</span>اضغط "إضافة" في الأعلى وسيظهر التطبيق كأيقونة مستقلة</li>
                </ol>
                <div className="mt-2 p-2.5 rounded-xl bg-accent/10">
                  <p className="text-[11px] text-accent-foreground leading-relaxed">💡 في iOS 26، التطبيقات المثبتة من Safari تعمل بشكل مستقل كتطبيق كامل مع دعم الإشعارات</p>
                </div>
              </div>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium"
              >
                حسناً
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">قانوني</p>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          <Link to="/policies" className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                <Shield className="w-[18px] h-[18px] text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">سياسة الخصوصية</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/policies" className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                <FileText className="w-[18px] h-[18px] text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">شروط الاستخدام</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">قريباً</p>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between p-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <Globe className="w-[18px] h-[18px] text-muted-foreground" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">English Language</p>
                <p className="text-[11px] text-muted-foreground">دعم اللغة الإنجليزية</p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full">قريباً</span>
          </div>
          <div className="flex items-center justify-between p-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <Moon className="w-[18px] h-[18px] text-muted-foreground" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">الوضع الداكن</p>
                <p className="text-[11px] text-muted-foreground">Dark Mode</p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full">قريباً</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gold-light rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground leading-relaxed">
          المطور لا يتحكم في أوقات الصلاة. البيانات مقدمة من واجهة Aladhan API. للملاحظات والتصحيحات يرجى التواصل عبر البريد الإلكتروني.
        </p>
      </div>

      {/* Developer info */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">حول التطبيق</p>
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl islamic-gradient flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">عبدالله بن جعفر</p>
              <p className="text-[11px] text-muted-foreground">المطوّر</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <a href="https://whatsapp.com/channel/0029VbCNwblJZg466AM5CC2R" target="_blank" rel="noopener" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">قناة واتساب</span>
              </div>
              <span className="text-[11px] text-muted-foreground">قــناة عِتْرَةً</span>
            </a>
            <a href="https://instagram.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">Instagram</span>
              </div>
              <span className="text-[11px] text-muted-foreground">@nr_aj5</span>
            </a>
            <a href="https://x.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">X (Twitter)</span>
              </div>
              <span className="text-[11px] text-muted-foreground">@nr_aj5</span>
            </a>
            <a href="mailto:a.jaafar.dev@gmail.com" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">البريد الإلكتروني</span>
              </div>
              <span className="text-[11px] text-muted-foreground">a.jaafar.dev@gmail.com</span>
            </a>
          </div>

          <p className="text-[10px] text-muted-foreground mt-3 px-1 leading-relaxed">البريد مخصص للاقتراحات والمشاكل التقنية والتصحيحات النصية فقط.</p>
        </div>
      </div>

      {/* Version */}
      <div className="text-center pb-6 pt-2">
        <p className="text-xs text-muted-foreground">عِتَرَةً</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">الإصدار v3.0 · بناء 100</p>
      </div>
    </div>
  );
};

export default SettingsPage;
