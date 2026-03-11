import { useState } from 'react';
import { Bell, Shield, FileText, Mail, ExternalLink, ChevronLeft, Info, User, Code2, Calendar, Globe, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, getHijriAdjustment, setHijriAdjustment } from '@/lib/user';
import CityPicker from '@/components/CityPicker';

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = getUser();
  
  // Notification states
  const [adhanNotif, setAdhanNotif] = useState(() => localStorage.getItem('atraa_notif_adhan') === 'true');
  const [dhikrNotif, setDhikrNotif] = useState(() => localStorage.getItem('atraa_notif_dhikr') === 'true');
  const [salawatNotif, setSalawatNotif] = useState(() => localStorage.getItem('atraa_notif_salawat') === 'true');
  
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('atraa_weather_city') || 'Qatif');
  const [citySearch, setCitySearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [hijriAdj, setHijriAdj] = useState(() => getHijriAdjustment());

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

  const detectLocation = () => {
    if (!('geolocation' in navigator)) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://wttr.in/${pos.coords.latitude},${pos.coords.longitude}?format=j1`);
          const data = await res.json();
          const area = data?.nearest_area?.[0]?.areaName?.[0]?.value;
          if (area) handleCityChange(area);
        } catch {}
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchSubmit = () => {
    if (citySearch.trim()) {
      handleCityChange(citySearch.trim());
      setCitySearch('');
    }
  };

  const handleHijriChange = (val: number) => {
    setHijriAdj(val);
    setHijriAdjustment(val);
    // Dispatch custom event so HijriCountdown in same tab can react
    window.dispatchEvent(new CustomEvent('hijri-adjust-changed', { detail: val }));
  };

  const filteredCities = citySearch
    ? popularCities.filter(c => c.label.includes(citySearch) || c.value.toLowerCase().includes(citySearch.toLowerCase()))
    : popularCities;

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
          <NotifToggle label="تذكير الصلوات" subtitle="الصلاة على محمد وآل محمد" enabled={salawatNotif} onToggle={() => toggleNotif('salawat', salawatNotif, setSalawatNotif)} />
        </div>
      </div>

      {/* Weather & Date section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground px-1">الطقس والتاريخ</p>

        {/* Weather City */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <MapPin className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">مدينة الطقس</p>
              <p className="text-[11px] text-muted-foreground">اختر مدينتك لعرض حالة الطقس</p>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="ابحث عن مدينة..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <button
              onClick={detectLocation}
              disabled={detecting}
              className="px-3 py-2.5 rounded-xl bg-primary/10 text-primary flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 transition-opacity"
            >
              <LocateFixed className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <p className="text-[11px] text-muted-foreground">
              المدينة الحالية: <span className="text-foreground font-medium">{popularCities.find(c => c.value === selectedCity)?.label || selectedCity}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredCities.map(city => (
              <button
                key={city.value}
                onClick={() => handleCityChange(city.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedCity === city.value
                    ? 'islamic-gradient text-primary-foreground shadow-card'
                    : 'bg-secondary text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hijri adjustment */}
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
        <p className="text-xs text-muted-foreground">عِتْرَة</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">الإصدار 2.1 · بناء 35</p>
      </div>
    </div>
  );
};

export default SettingsPage;
