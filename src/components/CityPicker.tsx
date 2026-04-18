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

// Worldwide list (Israel deliberately excluded per project policy)
const CITIES: CityRecord[] = [
  // Saudi Arabia
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
  { value: 'Hail', labelAr: 'حائل', labelEn: 'Hail', lat: 27.5219, lng: 41.6907, region: 'SA' },
  { value: 'Buraidah', labelAr: 'بريدة', labelEn: 'Buraidah', lat: 26.3260, lng: 43.9750, region: 'SA' },
  // Gulf
  { value: 'Kuwait', labelAr: 'الكويت', labelEn: 'Kuwait City', lat: 29.3759, lng: 47.9774, region: 'GCC' },
  { value: 'Manama', labelAr: 'المنامة', labelEn: 'Manama', lat: 26.2285, lng: 50.5860, region: 'GCC' },
  { value: 'Doha', labelAr: 'الدوحة', labelEn: 'Doha', lat: 25.2854, lng: 51.5310, region: 'GCC' },
  { value: 'Dubai', labelAr: 'دبي', labelEn: 'Dubai', lat: 25.2048, lng: 55.2708, region: 'GCC' },
  { value: 'Abu Dhabi', labelAr: 'أبوظبي', labelEn: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, region: 'GCC' },
  { value: 'Sharjah', labelAr: 'الشارقة', labelEn: 'Sharjah', lat: 25.3463, lng: 55.4209, region: 'GCC' },
  { value: 'Muscat', labelAr: 'مسقط', labelEn: 'Muscat', lat: 23.5859, lng: 58.4059, region: 'GCC' },
  // Iraq
  { value: 'Baghdad', labelAr: 'بغداد', labelEn: 'Baghdad', lat: 33.3152, lng: 44.3661, region: 'IQ' },
  { value: 'Karbala', labelAr: 'كربلاء', labelEn: 'Karbala', lat: 32.6160, lng: 44.0247, region: 'IQ' },
  { value: 'Najaf', labelAr: 'النجف', labelEn: 'Najaf', lat: 32.0000, lng: 44.3333, region: 'IQ' },
  { value: 'Basra', labelAr: 'البصرة', labelEn: 'Basra', lat: 30.5085, lng: 47.7804, region: 'IQ' },
  { value: 'Mosul', labelAr: 'الموصل', labelEn: 'Mosul', lat: 36.3450, lng: 43.1450, region: 'IQ' },
  // Levant
  { value: 'Damascus', labelAr: 'دمشق', labelEn: 'Damascus', lat: 33.5138, lng: 36.2765, region: 'LV' },
  { value: 'Aleppo', labelAr: 'حلب', labelEn: 'Aleppo', lat: 36.2021, lng: 37.1343, region: 'LV' },
  { value: 'Beirut', labelAr: 'بيروت', labelEn: 'Beirut', lat: 33.8938, lng: 35.5018, region: 'LV' },
  { value: 'Amman', labelAr: 'عمّان', labelEn: 'Amman', lat: 31.9454, lng: 35.9284, region: 'LV' },
  { value: 'Gaza', labelAr: 'غزة', labelEn: 'Gaza', lat: 31.5017, lng: 34.4668, region: 'LV' },
  { value: 'Ramallah', labelAr: 'رام الله', labelEn: 'Ramallah', lat: 31.9038, lng: 35.2034, region: 'LV' },
  // Africa
  { value: 'Cairo', labelAr: 'القاهرة', labelEn: 'Cairo', lat: 30.0444, lng: 31.2357, region: 'AF' },
  { value: 'Alexandria', labelAr: 'الإسكندرية', labelEn: 'Alexandria', lat: 31.2001, lng: 29.9187, region: 'AF' },
  { value: 'Khartoum', labelAr: 'الخرطوم', labelEn: 'Khartoum', lat: 15.5007, lng: 32.5599, region: 'AF' },
  { value: 'Tripoli', labelAr: 'طرابلس', labelEn: 'Tripoli', lat: 32.8872, lng: 13.1913, region: 'AF' },
  { value: 'Tunis', labelAr: 'تونس', labelEn: 'Tunis', lat: 36.8065, lng: 10.1815, region: 'AF' },
  { value: 'Algiers', labelAr: 'الجزائر', labelEn: 'Algiers', lat: 36.7538, lng: 3.0588, region: 'AF' },
  { value: 'Casablanca', labelAr: 'الدار البيضاء', labelEn: 'Casablanca', lat: 33.5731, lng: -7.5898, region: 'AF' },
  { value: 'Lagos', labelAr: 'لاغوس', labelEn: 'Lagos', lat: 6.5244, lng: 3.3792, region: 'AF' },
  { value: 'Nairobi', labelAr: 'نيروبي', labelEn: 'Nairobi', lat: -1.2921, lng: 36.8219, region: 'AF' },
  { value: 'Johannesburg', labelAr: 'جوهانسبرغ', labelEn: 'Johannesburg', lat: -26.2041, lng: 28.0473, region: 'AF' },
  // Asia
  { value: 'Tehran', labelAr: 'طهران', labelEn: 'Tehran', lat: 35.6892, lng: 51.3890, region: 'AS' },
  { value: 'Mashhad', labelAr: 'مشهد', labelEn: 'Mashhad', lat: 36.2605, lng: 59.6168, region: 'AS' },
  { value: 'Qom', labelAr: 'قم', labelEn: 'Qom', lat: 34.6401, lng: 50.8764, region: 'AS' },
  { value: 'Istanbul', labelAr: 'إسطنبول', labelEn: 'Istanbul', lat: 41.0082, lng: 28.9784, region: 'AS' },
  { value: 'Ankara', labelAr: 'أنقرة', labelEn: 'Ankara', lat: 39.9334, lng: 32.8597, region: 'AS' },
  { value: 'Karachi', labelAr: 'كراتشي', labelEn: 'Karachi', lat: 24.8607, lng: 67.0011, region: 'AS' },
  { value: 'Lahore', labelAr: 'لاهور', labelEn: 'Lahore', lat: 31.5204, lng: 74.3587, region: 'AS' },
  { value: 'Islamabad', labelAr: 'إسلام آباد', labelEn: 'Islamabad', lat: 33.6844, lng: 73.0479, region: 'AS' },
  { value: 'Delhi', labelAr: 'دلهي', labelEn: 'Delhi', lat: 28.7041, lng: 77.1025, region: 'AS' },
  { value: 'Mumbai', labelAr: 'مومباي', labelEn: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'AS' },
  { value: 'Dhaka', labelAr: 'دكا', labelEn: 'Dhaka', lat: 23.8103, lng: 90.4125, region: 'AS' },
  { value: 'Jakarta', labelAr: 'جاكرتا', labelEn: 'Jakarta', lat: -6.2088, lng: 106.8456, region: 'AS' },
  { value: 'Kuala Lumpur', labelAr: 'كوالالمبور', labelEn: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, region: 'AS' },
  { value: 'Singapore', labelAr: 'سنغافورة', labelEn: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'AS' },
  { value: 'Bangkok', labelAr: 'بانكوك', labelEn: 'Bangkok', lat: 13.7563, lng: 100.5018, region: 'AS' },
  { value: 'Tokyo', labelAr: 'طوكيو', labelEn: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'AS' },
  { value: 'Seoul', labelAr: 'سيول', labelEn: 'Seoul', lat: 37.5665, lng: 126.9780, region: 'AS' },
  { value: 'Beijing', labelAr: 'بكين', labelEn: 'Beijing', lat: 39.9042, lng: 116.4074, region: 'AS' },
  { value: 'Hong Kong', labelAr: 'هونغ كونغ', labelEn: 'Hong Kong', lat: 22.3193, lng: 114.1694, region: 'AS' },
  // Europe
  { value: 'London', labelAr: 'لندن', labelEn: 'London', lat: 51.5074, lng: -0.1278, region: 'EU' },
  { value: 'Paris', labelAr: 'باريس', labelEn: 'Paris', lat: 48.8566, lng: 2.3522, region: 'EU' },
  { value: 'Berlin', labelAr: 'برلين', labelEn: 'Berlin', lat: 52.5200, lng: 13.4050, region: 'EU' },
  { value: 'Madrid', labelAr: 'مدريد', labelEn: 'Madrid', lat: 40.4168, lng: -3.7038, region: 'EU' },
  { value: 'Rome', labelAr: 'روما', labelEn: 'Rome', lat: 41.9028, lng: 12.4964, region: 'EU' },
  { value: 'Amsterdam', labelAr: 'أمستردام', labelEn: 'Amsterdam', lat: 52.3676, lng: 4.9041, region: 'EU' },
  { value: 'Brussels', labelAr: 'بروكسل', labelEn: 'Brussels', lat: 50.8503, lng: 4.3517, region: 'EU' },
  { value: 'Vienna', labelAr: 'فيينا', labelEn: 'Vienna', lat: 48.2082, lng: 16.3738, region: 'EU' },
  { value: 'Stockholm', labelAr: 'ستوكهولم', labelEn: 'Stockholm', lat: 59.3293, lng: 18.0686, region: 'EU' },
  { value: 'Oslo', labelAr: 'أوسلو', labelEn: 'Oslo', lat: 59.9139, lng: 10.7522, region: 'EU' },
  { value: 'Moscow', labelAr: 'موسكو', labelEn: 'Moscow', lat: 55.7558, lng: 37.6173, region: 'EU' },
  // Americas
  { value: 'New York', labelAr: 'نيويورك', labelEn: 'New York', lat: 40.7128, lng: -74.0060, region: 'AM' },
  { value: 'Los Angeles', labelAr: 'لوس أنجلوس', labelEn: 'Los Angeles', lat: 34.0522, lng: -118.2437, region: 'AM' },
  { value: 'Chicago', labelAr: 'شيكاغو', labelEn: 'Chicago', lat: 41.8781, lng: -87.6298, region: 'AM' },
  { value: 'Houston', labelAr: 'هيوستن', labelEn: 'Houston', lat: 29.7604, lng: -95.3698, region: 'AM' },
  { value: 'Toronto', labelAr: 'تورنتو', labelEn: 'Toronto', lat: 43.6532, lng: -79.3832, region: 'AM' },
  { value: 'Montreal', labelAr: 'مونتريال', labelEn: 'Montreal', lat: 45.5017, lng: -73.5673, region: 'AM' },
  { value: 'Mexico City', labelAr: 'مكسيكو سيتي', labelEn: 'Mexico City', lat: 19.4326, lng: -99.1332, region: 'AM' },
  { value: 'Sao Paulo', labelAr: 'ساو باولو', labelEn: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'AM' },
  { value: 'Buenos Aires', labelAr: 'بوينس آيرس', labelEn: 'Buenos Aires', lat: -34.6037, lng: -58.3816, region: 'AM' },
  // Oceania
  { value: 'Sydney', labelAr: 'سيدني', labelEn: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'OC' },
  { value: 'Melbourne', labelAr: 'ملبورن', labelEn: 'Melbourne', lat: -37.8136, lng: 144.9631, region: 'OC' },
  { value: 'Auckland', labelAr: 'أوكلاند', labelEn: 'Auckland', lat: -36.8485, lng: 174.7633, region: 'OC' },
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
