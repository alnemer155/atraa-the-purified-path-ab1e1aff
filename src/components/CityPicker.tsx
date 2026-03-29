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
    <div className="bg-card rounded-2xl shadow-card border border-border/30 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div className="text-right flex-1">
          <p className="text-sm font-medium text-foreground">المنطقة والطقس</p>
          <p className="text-[10px] text-muted-foreground">اختر مدينتك لعرض الطقس وأوقات الصلاة</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-2.5 px-1">
        <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          الحالية: <span className="text-foreground font-semibold">{currentCityLabel}</span>
        </p>
      </div>

      <div className="flex gap-1.5 mb-2.5">
        <div className="flex-1 flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
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
          className="px-2.5 py-2 rounded-xl bg-primary/8 text-primary flex items-center gap-1 text-xs font-medium disabled:opacity-40"
        >
          <LocateFixed className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto hide-scrollbar">
        {filteredGroups.map((group) => {
          const isExpanded = expandedRegion === group.region || !!search;
          const hasSelected = group.cities.some(c => c.value === selectedCity);

          return (
            <div key={group.region} className="rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedRegion(isExpanded && !search ? null : group.region)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  hasSelected ? 'bg-primary/6 text-primary' : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{group.emoji}</span>
                  <span>{group.region}</span>
                  <span className="text-[9px] text-muted-foreground">({group.cities.length})</span>
                </div>
                {!search && (isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
              </button>

              {isExpanded && (
                <div className="flex flex-wrap gap-1 p-2 bg-secondary/15">
                  {group.cities.map(city => (
                    <button
                      key={city.value}
                      onClick={() => onCityChange(city.value)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        selectedCity === city.value
                          ? 'islamic-gradient text-primary-foreground shadow-card'
                          : 'bg-card text-foreground hover:bg-primary/6 hover:text-primary border border-border/20'
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
