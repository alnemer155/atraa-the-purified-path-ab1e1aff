import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Search, Loader2, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOSQUES, countriesList, haversineKm, isHighTraffic, type Mosque } from '@/data/mosques';

const MosquesPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const Chevron = isAr ? ChevronLeft : ChevronRight;
  const countries = useMemo(() => countriesList(), []);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<string>('all');
  const [nearMe, setNearMe] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot user location from stored city coords (Settings) if available,
  // and auto-enable "near me" sorting so results are immediately meaningful.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('atraa_city_coords');
      if (raw) {
        setUserLoc(JSON.parse(raw));
        setNearMe(true);
      }
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

  const matches = (m: Mosque, q: string, nq: string) =>
    m.nameAr.includes(q) ||
    m.nameEn.toLowerCase().includes(nq) ||
    m.city.includes(q) ||
    m.cityEn.toLowerCase().includes(nq) ||
    m.country.includes(q) ||
    m.countryEn.toLowerCase().includes(nq) ||
    (m.area ?? '').includes(q);

  const results = useMemo(() => {
    const q = query.trim();
    const nq = q.toLowerCase();
    let list: (Mosque & { distanceKm?: number })[] = MOSQUES.filter((m) => {
      if (country !== 'all' && m.country !== country) return false;
      if (q && !matches(m, q, nq)) return false;
      return true;
    });
    if (nearMe && userLoc) {
      list = list
        .map((m) => ({ ...m, distanceKm: haversineKm(userLoc, m) }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    return list;
  }, [country, query, nearMe, userLoc]);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const nq = q.toLowerCase();
    let list: (Mosque & { distanceKm?: number })[] = MOSQUES.filter((m) => matches(m, q, nq));
    if (userLoc) {
      list = list
        .map((m) => ({ ...m, distanceKm: haversineKm(userLoc, m) }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }
    return list.slice(0, 6);
  }, [query, userLoc]);

  return (
    <div className={`px-4 py-4 pb-24 ${isAr ? 'text-right' : 'text-left'}`}>
      {/* Filters bar */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 ${isAr ? 'right-3' : 'left-3'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSuggestOpen(true); }}
            onFocus={() => setSuggestOpen(true)}
            onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
            placeholder={isAr ? 'ابحث باسم المسجد أو المدينة…' : 'Search mosque or city…'}
            className={`w-full h-11 rounded-2xl bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors ${isAr ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'}`}
          />

          <AnimatePresence>
            {suggestOpen && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 left-0 right-0 mt-1 bg-card border border-border/40 rounded-2xl shadow-lg overflow-hidden divide-y divide-border/30"
              >
                {suggestions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setSuggestOpen(false); navigate(`/mosques/${m.id}`); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 active:bg-secondary/40 transition-colors ${isAr ? 'text-right' : 'text-left'}`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" strokeWidth={1.6} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground truncate">{isAr ? m.nameAr : m.nameEn}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {isAr ? m.city : m.cityEn} · {isAr ? m.country : m.countryEn}
                      </p>
                    </div>
                    {m.distanceKm !== undefined && (
                      <span className="text-[10px] text-primary/70 tabular-nums flex-shrink-0">
                        {m.distanceKm < 10 ? m.distanceKm.toFixed(1) : Math.round(m.distanceKm)} {isAr ? 'كم' : 'km'}
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="flex-1 h-10 rounded-xl bg-card border border-border/40 text-[12px] text-foreground px-3 outline-none focus:border-primary/50"
          >
            <option value="all">{isAr ? 'كل الدول' : 'All countries'}</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => (userLoc ? setNearMe((v) => !v) : requestGeolocation())}
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

      <p className="text-[10px] text-muted-foreground/60 mb-2 px-1 tabular-nums">
        {isAr ? `${results.length} مسجد` : `${results.length} mosques`}
      </p>

      <div className="space-y-2">
        {results.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-[12px]">
            {isAr ? 'لا نتائج مطابقة.' : 'No matching mosques.'}
          </div>
        )}
        {results.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.015, 0.2) }}
          >
            <Link
              to={`/mosques/${m.id}`}
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
              <Chevron className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MosquesPage;
