import { useState, useMemo } from 'react';
import { MapPin, Search, LocateFixed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CityRecord {
  value: string;
  labelAr: string;
  labelEn: string;
  lat: number;
  lng: number;
  region: string;
}

const CITIES: CityRecord[] = [
  { value: 'Qatif', labelAr: 'القطيف', labelEn: 'Qatif', lat: 26.5196, lng: 50.0115, region: 'SA' },
  { value: 'Riyadh', labelAr: 'الرياض', labelEn: 'Riyadh', lat: 24.7136, lng: 46.6753, region: 'SA' },
  { value: 'Jeddah', labelAr: 'جدة', labelEn: 'Jeddah', lat: 21.4858, lng: 39.1925, region: 'SA' },
  { value: 'Dammam', labelAr: 'الدمام', labelEn: 'Dammam', lat: 26.3927, lng: 49.9777, region: 'SA' },
  { value: 'Mecca', labelAr: 'مكة المكرمة', labelEn: 'Mecca', lat: 21.3891, lng: 39.8579, region: 'SA' },
  { value: 'Medina', labelAr: 'المدينة المنورة', labelEn: 'Medina', lat: 24.5247, lng: 39.5692, region: 'SA' },
  { value: 'Khobar', labelAr: 'الخبر', labelEn: 'Khobar', lat: 26.2172, lng: 50.1971, region: 'SA' },
  { value: 'Ahsa', labelAr: 'الأحساء', labelEn: 'Al-Ahsa', lat: 25.3548, lng: 49.5870, region: 'SA' },
  { value: 'Tabuk', labelAr: 'تبوك', labelEn: 'Tabuk', lat: 28.3838, lng: 36.5550, region: 'SA' },
  { value: 'Abha', labelAr: 'أبها', labelEn: 'Abha', lat: 18.2164, lng: 42.5053, region: 'SA' },
  { value: 'Taif', labelAr: 'الطائف', labelEn: 'Taif', lat: 21.2854, lng: 40.4183, region: 'SA' },
  { value: 'Kuwait', labelAr: 'الكويت', labelEn: 'Kuwait City', lat: 29.3759, lng: 47.9774, region: 'GCC' },
  { value: 'Manama', labelAr: 'المنامة', labelEn: 'Manama', lat: 26.2285, lng: 50.5860, region: 'GCC' },
  { value: 'Doha', labelAr: 'الدوحة', labelEn: 'Doha', lat: 25.2854, lng: 51.5310, region: 'GCC' },
  { value: 'Dubai', labelAr: 'دبي', labelEn: 'Dubai', lat: 25.2048, lng: 55.2708, region: 'GCC' },
  { value: 'Abu Dhabi', labelAr: 'أبوظبي', labelEn: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, region: 'GCC' },
  { value: 'Muscat', labelAr: 'مسقط', labelEn: 'Muscat', lat: 23.5859, lng: 58.4059, region: 'GCC' },
  { value: 'Baghdad', labelAr: 'بغداد', labelEn: 'Baghdad', lat: 33.3152, lng: 44.3661, region: 'IQ' },
  { value: 'Karbala', labelAr: 'كربلاء', labelEn: 'Karbala', lat: 32.6160, lng: 44.0247, region: 'IQ' },
  { value: 'Najaf', labelAr: 'النجف', labelEn: 'Najaf', lat: 32.0000, lng: 44.3333, region: 'IQ' },
  { value: 'Basra', labelAr: 'البصرة', labelEn: 'Basra', lat: 30.5085, lng: 47.7804, region: 'IQ' },
  { value: 'Damascus', labelAr: 'دمشق', labelEn: 'Damascus', lat: 33.5138, lng: 36.2765, region: 'LV' },
  { value: 'Beirut', labelAr: 'بيروت', labelEn: 'Beirut', lat: 33.8938, lng: 35.5018, region: 'LV' },
  { value: 'Amman', labelAr: 'عمّان', labelEn: 'Amman', lat: 31.9454, lng: 35.9284, region: 'LV' },
  { value: 'Cairo', labelAr: 'القاهرة', labelEn: 'Cairo', lat: 30.0444, lng: 31.2357, region: 'AF' },
  { value: 'Tehran', labelAr: 'طهران', labelEn: 'Tehran', lat: 35.6892, lng: 51.3890, region: 'AS' },
  { value: 'Istanbul', labelAr: 'إسطنبول', labelEn: 'Istanbul', lat: 41.0082, lng: 28.9784, region: 'AS' },
  { value: 'London', labelAr: 'لندن', labelEn: 'London', lat: 51.5074, lng: -0.1278, region: 'EU' },
  { value: 'Paris', labelAr: 'باريس', labelEn: 'Paris', lat: 48.8566, lng: 2.3522, region: 'EU' },
  { value: 'New York', labelAr: 'نيويورك', labelEn: 'New York', lat: 40.7128, lng: -74.0060, region: 'AM' },
  { value: 'Toronto', labelAr: 'تورنتو', labelEn: 'Toronto', lat: 43.6532, lng: -79.3832, region: 'AM' },
  { value: 'Sydney', labelAr: 'سيدني', labelEn: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'OC' },
];

interface CityPickerProps {
  selectedCity: string;
  onCityChange: (city: string, coords: { lat: number; lng: number }) => void;
}

const CityPicker = ({ selectedCity, onCityChange }: CityPickerProps) => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const isAr = i18n.language === 'ar';

  const filtered = useMemo(() => {
    if (!search.trim()) return CITIES;
    const q = search.trim().toLowerCase();
    return CITIES.filter(
      c => c.labelAr.includes(search) ||
           c.labelEn.toLowerCase().includes(q) ||
           c.value.toLowerCase().includes(q)
    );
  }, [search]);

  const detectLocation = () => {
    if (!('geolocation' in navigator)) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find closest known city
        let closest = CITIES[0];
        let minDist = Infinity;
        for (const c of CITIES) {
          const d = Math.hypot(c.lat - latitude, c.lng - longitude);
          if (d < minDist) { minDist = d; closest = c; }
        }
        onCityChange(closest.value, { lat: closest.lat, lng: closest.lng });
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const current = CITIES.find(c => c.value === selectedCity);

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <MapPin className="w-[18px] h-[18px] text-primary" />
        <div className={`flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="text-[13px] font-semibold text-foreground">{t('settings.city')}</p>
          {current && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isAr ? current.labelAr : current.labelEn}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
        </div>
        <button
          onClick={detectLocation}
          disabled={detecting}
          className="px-3 py-2 rounded-xl bg-primary/10 text-primary flex items-center disabled:opacity-40"
          aria-label="detect"
        >
          <LocateFixed className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-[260px] overflow-y-auto hide-scrollbar">
        {filtered.map((c) => (
          <button
            key={c.value}
            onClick={() => onCityChange(c.value, { lat: c.lat, lng: c.lng })}
            className={`px-3 py-1.5 rounded-lg text-[11px] transition-all ${
              selectedCity === c.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-foreground border border-border/30'
            }`}
          >
            {isAr ? c.labelAr : c.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CityPicker;
