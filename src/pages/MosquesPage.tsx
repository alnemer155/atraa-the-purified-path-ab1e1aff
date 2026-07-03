import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, Search, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOSQUES, countriesList, haversineKm, type Mosque } from '@/data/mosques';

const MosquesPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const countries = useMemo(() => countriesList(), []);

  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<string>('all');
  const [nearMe, setNearMe] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Boot user location from stored city coords (Settings) if available.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('atraa_city_coords');
      if (raw) setUserLoc(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const requestGeolocation = () => {
    if (!('geolocation' in navigator)) {
      setLocError(isAr ? 'تحديد الموقع غير مدعوم على هذا الجهاز' : 'Geolocation is not supported');
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMe(true);
        setLocating(false);
      },
      () => {
        setLocError(isAr ? 'تعذّر تحديد الموقع' : 'Failed to get location');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  const results = useMemo(() => {
    let list: (Mosque & { distanceKm?: number })[] = [...MOSQUES];
    if (country !== 'all') list = list.filter(m => m.country === country);
    const q = query.trim();
    if (q) {
      const nq = q.toLowerCase();
      list = list.filter(m =>
        m.nameAr.includes(q) ||
        m.nameEn.toLowerCase().includes(nq) ||
        m.city.includes(q) ||
        m.cityEn.toLowerCase().includes(nq) ||
        m.country.includes(q) ||
        m.countryEn.toLowerCase().includes(nq) ||
        (m.area ?? '').includes(q)
      );
    }
    if (nearMe && userLoc) {
      list = list
        .map(m => ({ ...m, distanceKm: haversineKm(userLoc, m) }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    return list;
  }, [country, query, nearMe, userLoc]);

  const openMap = (m: Mosque) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`px-4 py-4 pb-24 ${isAr ? 'text-right' : 'text-left'}`}>
      {/* Filters bar */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 ${isAr ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? 'ابحث باسم المسجد أو المدينة…' : 'Search mosque or city…'}
            className={`w-full h-11 rounded-2xl bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors ${isAr ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'}`}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="flex-1 h-10 rounded-xl bg-card border border-border/40 text-[12px] text-foreground px-3 outline-none focus:border-primary/50"
          >
            <option value="all">{isAr ? 'كل الدول' : 'All countries'}</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => (userLoc ? setNearMe(v => !v) : requestGeolocation())}
            className={`h-10 px-3 rounded-xl border text-[12px] flex items-center gap-1.5 transition-colors ${
              nearMe && userLoc
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border/40'
            }`}
          >
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>{isAr ? 'القريب مني' : 'Near me'}</span>
          </button>
        </div>

        {locError && (
          <p className="text-[10px] text-destructive/80 px-1">{locError}</p>
        )}
      </div>

      {/* Counter */}
      <p className="text-[10px] text-muted-foreground/60 mb-2 px-1 tabular-nums">
        {isAr ? `${results.length} مسجد` : `${results.length} mosques`}
      </p>

      {/* List */}
      <div className="space-y-2">
        {results.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-[12px]">
            {isAr ? 'لا نتائج مطابقة.' : 'No matching mosques.'}
          </div>
        )}
        {results.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.015, 0.2) }}
            onClick={() => openMap(m)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/30 active:scale-[0.98] transition-transform shadow-card ${isAr ? 'text-right' : 'text-left'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary/80" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground font-medium truncate">
                {isAr ? m.nameAr : m.nameEn}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {isAr ? m.city : m.cityEn}
                {m.area ? ` · ${m.area}` : ''}
                {' · '}
                {isAr ? m.country : m.countryEn}
              </p>
            </div>
            {m.distanceKm !== undefined && (
              <span className="text-[10px] tabular-nums text-primary/70 flex-shrink-0">
                {m.distanceKm < 10 ? m.distanceKm.toFixed(1) : Math.round(m.distanceKm)} {isAr ? 'كم' : 'km'}
              </span>
            )}
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MosquesPage;
