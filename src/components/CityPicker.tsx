import { useState } from 'react';
import { MapPin, Search, LocateFixed, ChevronDown, ChevronUp, Globe } from 'lucide-react';

interface CityPickerProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

type CityGroup = {
  region: string;
  emoji: string;
  cities: { value: string; label: string }[];
};

const cityGroups: CityGroup[] = [
  {
    region: 'السعودية',
    emoji: '🇸🇦',
    cities: [
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
      { value: 'Tabuk', label: 'تبوك' },
      { value: 'Abha', label: 'أبها' },
      { value: 'Hail', label: 'حائل' },
      { value: 'Jubail', label: 'الجبيل' },
      { value: 'Yanbu', label: 'ينبع' },
      { value: 'Najran', label: 'نجران' },
      { value: 'Taif', label: 'الطائف' },
    ],
  },
  {
    region: 'الخليج العربي',
    emoji: '🌊',
    cities: [
      { value: 'Kuwait City', label: 'الكويت' },
      { value: 'Manama', label: 'المنامة' },
      { value: 'Doha', label: 'الدوحة' },
      { value: 'Dubai', label: 'دبي' },
      { value: 'Abu Dhabi', label: 'أبوظبي' },
      { value: 'Sharjah', label: 'الشارقة' },
      { value: 'Muscat', label: 'مسقط' },
    ],
  },
  {
    region: 'الشام والعراق',
    emoji: '🏛️',
    cities: [
      { value: 'Baghdad', label: 'بغداد' },
      { value: 'Karbala', label: 'كربلاء' },
      { value: 'Najaf', label: 'النجف' },
      { value: 'Basra', label: 'البصرة' },
      { value: 'Damascus', label: 'دمشق' },
      { value: 'Beirut', label: 'بيروت' },
      { value: 'Amman', label: 'عمّان' },
    ],
  },
  {
    region: 'شمال أفريقيا',
    emoji: '🌍',
    cities: [
      { value: 'Cairo', label: 'القاهرة' },
      { value: 'Alexandria', label: 'الإسكندرية' },
      { value: 'Tripoli', label: 'طرابلس' },
      { value: 'Tunis', label: 'تونس' },
      { value: 'Algiers', label: 'الجزائر' },
      { value: 'Casablanca', label: 'الدار البيضاء' },
      { value: 'Khartoum', label: 'الخرطوم' },
    ],
  },
  {
    region: 'آسيا',
    emoji: '🌏',
    cities: [
      { value: 'Tehran', label: 'طهران' },
      { value: 'Istanbul', label: 'إسطنبول' },
      { value: 'Ankara', label: 'أنقرة' },
      { value: 'Islamabad', label: 'إسلام آباد' },
      { value: 'Karachi', label: 'كراتشي' },
      { value: 'Jakarta', label: 'جاكرتا' },
      { value: 'Kuala Lumpur', label: 'كوالالمبور' },
      { value: 'Dhaka', label: 'دكا' },
      { value: 'Tokyo', label: 'طوكيو' },
      { value: 'Seoul', label: 'سيول' },
    ],
  },
  {
    region: 'أوروبا',
    emoji: '🌐',
    cities: [
      { value: 'London', label: 'لندن' },
      { value: 'Paris', label: 'باريس' },
      { value: 'Berlin', label: 'برلين' },
      { value: 'Amsterdam', label: 'أمستردام' },
      { value: 'Stockholm', label: 'ستوكهولم' },
      { value: 'Madrid', label: 'مدريد' },
      { value: 'Rome', label: 'روما' },
      { value: 'Vienna', label: 'فيينا' },
      { value: 'Moscow', label: 'موسكو' },
    ],
  },
  {
    region: 'الأمريكتان',
    emoji: '🌎',
    cities: [
      { value: 'New York', label: 'نيويورك' },
      { value: 'Los Angeles', label: 'لوس أنجلوس' },
      { value: 'Toronto', label: 'تورنتو' },
      { value: 'Chicago', label: 'شيكاغو' },
      { value: 'Houston', label: 'هيوستن' },
      { value: 'Sao Paulo', label: 'ساو باولو' },
      { value: 'Buenos Aires', label: 'بوينس آيرس' },
    ],
  },
  {
    region: 'أفريقيا',
    emoji: '🌍',
    cities: [
      { value: 'Lagos', label: 'لاغوس' },
      { value: 'Nairobi', label: 'نيروبي' },
      { value: 'Johannesburg', label: 'جوهانسبرغ' },
      { value: 'Dar es Salaam', label: 'دار السلام' },
      { value: 'Mogadishu', label: 'مقديشو' },
    ],
  },
  {
    region: 'أوقيانوسيا',
    emoji: '🏝️',
    cities: [
      { value: 'Sydney', label: 'سيدني' },
      { value: 'Melbourne', label: 'ملبورن' },
      { value: 'Auckland', label: 'أوكلاند' },
    ],
  },
];

const allCities = cityGroups.flatMap(g => g.cities);

const CityPicker = ({ selectedCity, onCityChange }: CityPickerProps) => {
  const [search, setSearch] = useState('');
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const detectLocation = () => {
    if (!('geolocation' in navigator)) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://wttr.in/${pos.coords.latitude},${pos.coords.longitude}?format=j1`);
          const data = await res.json();
          const area = data?.nearest_area?.[0]?.areaName?.[0]?.value;
          if (area) onCityChange(area);
        } catch {}
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      onCityChange(search.trim());
      setSearch('');
    }
  };

  const currentCityLabel = allCities.find(c => c.value === selectedCity)?.label || selectedCity;

  const filteredGroups = search
    ? cityGroups
        .map(g => ({
          ...g,
          cities: g.cities.filter(
            c => c.label.includes(search) || c.value.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter(g => g.cities.length > 0)
    : cityGroups;

  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
          <Globe className="w-[18px] h-[18px] text-primary" />
        </div>
        <div className="text-right flex-1">
          <p className="text-sm font-medium text-foreground">المنطقة والطقس</p>
          <p className="text-[11px] text-muted-foreground">اختر مدينتك لعرض الطقس وأوقات الصلاة</p>
        </div>
      </div>

      {/* Current city indicator */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          المدينة الحالية: <span className="text-foreground font-semibold">{currentCityLabel}</span>
        </p>
      </div>

      {/* Search + detect */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {/* Region groups */}
      <div className="space-y-1.5 max-h-[320px] overflow-y-auto hide-scrollbar">
        {filteredGroups.map((group) => {
          const isExpanded = expandedRegion === group.region || !!search;
          const hasSelected = group.cities.some(c => c.value === selectedCity);

          return (
            <div key={group.region} className="rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedRegion(isExpanded && !search ? null : group.region)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors ${
                  hasSelected ? 'bg-primary/10 text-primary' : 'bg-secondary/70 text-foreground hover:bg-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{group.emoji}</span>
                  <span>{group.region}</span>
                  <span className="text-[10px] text-muted-foreground">({group.cities.length})</span>
                </div>
                {!search && (isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
              </button>

              {isExpanded && (
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-secondary/30">
                  {group.cities.map(city => (
                    <button
                      key={city.value}
                      onClick={() => onCityChange(city.value)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        selectedCity === city.value
                          ? 'islamic-gradient text-primary-foreground shadow-card'
                          : 'bg-card text-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CityPicker;
