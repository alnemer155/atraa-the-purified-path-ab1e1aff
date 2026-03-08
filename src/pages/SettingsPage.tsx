import { useState } from 'react';
import { Bell, Shield, FileText, Mail, ExternalLink, ChevronLeft, MapPin, Search, LocateFixed } from 'lucide-react';
import { Link } from 'react-router-dom';

const popularCities = [
  { value: 'Qatif', label: 'القطيف' },
  { value: 'Riyadh', label: 'الرياض' },
  { value: 'Jeddah', label: 'جدة' },
  { value: 'Dammam', label: 'الدمام' },
  { value: 'Mecca', label: 'مكة المكرمة' },
  { value: 'Medina', label: 'المدينة المنورة' },
  { value: 'Khobar', label: 'الخبر' },
  { value: 'Ahsa', label: 'الأحساء' },
  { value: 'Saihat', label: 'سيهات' },
  { value: 'Tarut', label: 'تاروت' },
];

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('atraa_weather_city') || 'Qatif');
  const [citySearch, setCitySearch] = useState('');
  const [detecting, setDetecting] = useState(false);

  const toggleNotifications = async () => {
    if (!notifications && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifications(true);
      }
    } else {
      setNotifications(!notifications);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('atraa_weather_city', city);
    // Dispatch storage event for same-tab listeners
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
          if (area) {
            handleCityChange(area);
          }
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

  const filteredCities = citySearch
    ? popularCities.filter(c => c.label.includes(citySearch) || c.value.toLowerCase().includes(citySearch.toLowerCase()))
    : popularCities;

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground mb-2">الإعدادات</h1>

      {/* Notifications */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <button onClick={toggleNotifications} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Bell className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">الإشعارات</p>
              <p className="text-xs text-muted-foreground">تنبيهات الأذان والصلوات</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${notifications ? 'bg-primary' : 'bg-border'}`}>
            <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${notifications ? '-translate-x-5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Weather City */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
            <MapPin className="w-[18px] h-[18px] text-primary" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">مدينة الطقس</p>
            <p className="text-xs text-muted-foreground">اختر مدينتك لعرض الطقس</p>
          </div>
        </div>

        {/* Search + Auto detect */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
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
            className="px-3 py-2 rounded-xl bg-primary/10 text-primary flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
          >
            <LocateFixed className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {filteredCities.map(city => (
            <button
              key={city.value}
              onClick={() => handleCityChange(city.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCity === city.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
        <Link to="/policies" className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Shield className="w-[18px] h-[18px] text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">سياسة الخصوصية</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <Link to="/policies" className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <FileText className="w-[18px] h-[18px] text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">شروط الاستخدام</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-gold-light rounded-2xl p-4">
        <p className="text-xs text-foreground leading-relaxed">
          ⚠️ المطور لا يتحكم في أوقات الصلاة. البيانات مقدمة من واجهة Aladhan API.
        </p>
      </div>

      {/* Developer info */}
      <div className="bg-card rounded-2xl shadow-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">المطوّر</h3>
        <p className="text-sm text-foreground mb-2">عبدالله بن جعفر</p>
        <div className="space-y-2">
          <a href="https://instagram.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-primary">
            <ExternalLink className="w-3.5 h-3.5" />
            @nr_aj5 — Instagram
          </a>
          <a href="https://x.com/nr_aj5" target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-primary">
            <ExternalLink className="w-3.5 h-3.5" />
            @nr_aj5 — X
          </a>
          <a href="mailto:a.jaafar.dev@gmail.com" className="flex items-center gap-2 text-xs text-primary">
            <Mail className="w-3.5 h-3.5" />
            a.jaafar.dev@gmail.com
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">البريد مخصص للاقتراحات والمشاكل التقنية والتصحيحات النصية فقط.</p>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        عِتْرَة — الإصدار 2.1 (بناء 35)
      </p>
    </div>
  );
};

export default SettingsPage;
