import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation, MapPin, LocateFixed, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

function calculateQibla(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const dLambda = ((KAABA_LNG - lng) * Math.PI) / 180;
  const x = Math.sin(dLambda);
  const y = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLambda);
  let qibla = (Math.atan2(x, y) * 180) / Math.PI;
  if (qibla < 0) qibla += 360;
  return qibla;
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const KaabaIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="12" y="18" width="40" height="36" rx="2" fill="hsl(var(--foreground))" />
    <rect x="12" y="28" width="40" height="8" fill="hsl(var(--gold))" opacity="0.9" />
    <rect x="22" y="30" width="20" height="4" rx="1" fill="hsl(var(--gold))" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
    <rect x="27" y="36" width="10" height="16" rx="5" fill="hsl(var(--gold))" opacity="0.8" />
    <rect x="12" y="18" width="40" height="2" rx="1" fill="hsl(var(--foreground))" opacity="0.6" />
  </svg>
);

const QiblaPage = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState('');
  const [compassActive, setCompassActive] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const headingRef = useRef(0);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          setQiblaDirection(calculateQibla(latitude, longitude));
        },
        () => {
          setCoords({ lat: 26.4207, lng: 50.0888 });
          setQiblaDirection(calculateQibla(26.4207, 50.0888));
          setError('تم استخدام الموقع الافتراضي (القطيف)');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let alpha = e.alpha;
    if (alpha === null) return;
    // @ts-ignore
    if (e.webkitCompassHeading !== undefined) {
      // @ts-ignore
      alpha = e.webkitCompassHeading;
    } else {
      alpha = 360 - alpha;
    }
    let diff = alpha - headingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    headingRef.current = (headingRef.current + diff * 0.15 + 360) % 360;
    setHeading(headingRef.current);
    setCompassActive(true);
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation, true);
      return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }
  }, [handleOrientation]);

  const requestPermission = async () => {
    try {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    } catch {}
  };

  const rotation = qiblaDirection !== null ? qiblaDirection - heading : 0;
  const distanceToKaaba = coords ? Math.round(getDistance(coords.lat, coords.lng, KAABA_LAT, KAABA_LNG)) : null;
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isPointingQibla = compassActive && (normalizedRotation < 5 || normalizedRotation > 355);
  const compassSize = 280;
  const r = compassSize / 2;

  return (
    <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-right flex-1">
          <h1 className="text-lg font-bold text-foreground mb-0.5 tracking-tight">اتجاه القبلة</h1>
          <p className="text-[11px] text-muted-foreground font-medium">الكعبة المشرّفة · مكة المكرمة</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showInfo ? 'bg-primary/10 text-primary' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'}`}>
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Info card */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/20 p-4 shadow-sm">
              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                وجّه هاتفك بشكل مسطّح وأدر جسمك حتى تشير علامة الكعبة للأعلى. تأكد من عدم وجود مصادر مغناطيسية قريبة للحصول على نتائج دقيقة.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: compassSize, height: compassSize }}>
          {/* Background */}
          <div className={`absolute inset-0 rounded-full shadow-xl border transition-all duration-500 ${
            isPointingQibla ? 'bg-primary/5 border-primary/20 shadow-primary/10' : 'bg-card border-border/30 shadow-card'
          }`} />
          <div className="absolute inset-3 rounded-full border border-primary/6" />

          {/* Tick marks */}
          <svg className="absolute inset-0" viewBox={`0 0 ${compassSize} ${compassSize}`}>
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = (i * 5 * Math.PI) / 180 - Math.PI / 2;
              const isMajor = i % 18 === 0;
              const isMid = i % 9 === 0;
              const len = isMajor ? 14 : isMid ? 8 : 4;
              const outerR = r - 6;
              const x1 = r + outerR * Math.cos(angle);
              const y1 = r + outerR * Math.sin(angle);
              const x2 = r + (outerR - len) * Math.cos(angle);
              const y2 = r + (outerR - len) * Math.sin(angle);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isMajor ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={isMajor ? 2.5 : 0.8} strokeLinecap="round" />
              );
            })}
          </svg>

          {/* Cardinal directions */}
          {[
            { label: 'ش', angle: 0, primary: true },
            { label: 'شر', angle: 90 },
            { label: 'ج', angle: 180 },
            { label: 'غر', angle: 270 },
          ].map(({ label, angle, primary }) => {
            const rad = (angle * Math.PI) / 180 - Math.PI / 2;
            const dist = r - 30;
            const x = r + dist * Math.cos(rad);
            const y = r + dist * Math.sin(rad);
            return (
              <span key={label}
                className={`absolute text-[11px] font-bold ${primary ? 'text-primary' : 'text-muted-foreground/50'}`}
                style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                {label}
              </span>
            );
          })}

          {/* Kaaba pointer */}
          <motion.div className="absolute inset-0" animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 14 }}>
            <div className="w-full h-full flex flex-col items-center">
              <div className="flex flex-col items-center mt-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
                  isPointingQibla ? 'bg-accent scale-110 shadow-accent/30' : 'bg-card border border-border/30'
                }`}>
                  <KaabaIcon size={26} />
                </div>
                <div className="w-[2px] rounded-full islamic-gradient" style={{ height: r - 56 }} />
              </div>
            </div>
          </motion.div>

          {/* Opposite pointer */}
          <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 14 }}>
            <div className="w-full h-full flex flex-col items-center justify-end">
              <div className="flex flex-col items-center mb-6">
                <div className="w-[1px] bg-muted-foreground/8 rounded-full" style={{ height: r - 64 }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/8" />
              </div>
            </div>
          </motion.div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{
              boxShadow: isPointingQibla ? '0 0 30px 6px hsl(var(--primary) / 0.3)' : 'var(--shadow-card)',
            }} className="w-14 h-14 rounded-full islamic-gradient flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 rounded-full bg-primary-foreground/80" />
            </motion.div>
          </div>
        </div>

        {/* Qibla aligned badge */}
        <AnimatePresence>
          {isPointingQibla && (
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className="flex items-center gap-2 mt-5 px-6 py-3 rounded-2xl islamic-gradient shadow-lg shadow-primary/15">
              <span className="text-sm font-bold text-primary-foreground flex items-center gap-1.5"><Check className="w-4 h-4" /> أنت تواجه القبلة</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-5 mb-2">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-border/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-primary/8 flex items-center justify-center">
              <Navigation className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">الاتجاه</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-border/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-accent/12 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-accent-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">المسافة</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {distanceToKaaba !== null ? `${distanceToKaaba.toLocaleString()}` : '—'}
            {distanceToKaaba !== null && <span className="text-xs text-muted-foreground/60 mr-1 font-medium">كم</span>}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-muted-foreground text-center mt-1.5 bg-secondary/30 py-2 px-3 rounded-xl font-medium">{error}</p>
      )}

      {!compassActive && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={requestPermission}
          className="mt-4 mx-auto flex items-center gap-2.5 px-7 py-3.5 rounded-2xl islamic-gradient text-primary-foreground text-sm font-bold shadow-xl shadow-primary/20 active:scale-[0.97] transition-transform">
          <LocateFixed className="w-4 h-4" /> تفعيل البوصلة
        </motion.button>
      )}
    </div>
  );
};

export default QiblaPage;
