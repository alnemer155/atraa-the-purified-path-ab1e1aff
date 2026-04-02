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
    <rect x="12" y="18" width="40" height="36" rx="2" fill="currentColor" />
    <rect x="12" y="28" width="40" height="8" fill="currentColor" opacity="0.6" />
    <rect x="22" y="30" width="20" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="27" y="36" width="10" height="16" rx="5" fill="currentColor" opacity="0.5" />
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
  const compassSize = 300;
  const r = compassSize / 2;

  return (
    <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="text-right flex-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">اتجاه القبلة</h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">الكعبة المشرّفة · مكة المكرمة</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${showInfo ? 'border-foreground/20 text-foreground' : 'border-border text-muted-foreground'}`}>
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
            <div className="rounded-2xl border border-border p-4">
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
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-700 ${
            isPointingQibla ? 'border-foreground' : 'border-border'
          }`} />
          {/* Inner ring */}
          <div className="absolute inset-3 rounded-full border border-border/50" />
          {/* Inner circle */}
          <div className="absolute inset-6 rounded-full border border-border/30" />

          {/* Tick marks */}
          <svg className="absolute inset-0" viewBox={`0 0 ${compassSize} ${compassSize}`}>
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = (i * 5 * Math.PI) / 180 - Math.PI / 2;
              const isMajor = i % 18 === 0;
              const isMid = i % 9 === 0;
              const len = isMajor ? 16 : isMid ? 10 : 4;
              const outerR = r - 2;
              const x1 = r + outerR * Math.cos(angle);
              const y1 = r + outerR * Math.sin(angle);
              const x2 = r + (outerR - len) * Math.cos(angle);
              const y2 = r + (outerR - len) * Math.sin(angle);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isMajor ? 'hsl(var(--foreground))' : 'hsl(var(--border))'}
                  strokeWidth={isMajor ? 2 : 0.8} strokeLinecap="round" />
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
            const dist = r - 34;
            const x = r + dist * Math.cos(rad);
            const y = r + dist * Math.sin(rad);
            return (
              <span key={label}
                className={`absolute text-[11px] font-bold ${primary ? 'text-foreground' : 'text-muted-foreground/40'}`}
                style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                {label}
              </span>
            );
          })}

          {/* Kaaba pointer */}
          <motion.div className="absolute inset-0" animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 50, damping: 16 }}>
            <div className="w-full h-full flex flex-col items-center">
              <div className="flex flex-col items-center mt-7">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  isPointingQibla ? 'border-foreground text-foreground scale-110' : 'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  <KaabaIcon size={22} />
                </div>
                <div className={`w-[1.5px] transition-colors duration-500 ${isPointingQibla ? 'bg-foreground' : 'bg-muted-foreground/20'}`} style={{ height: r - 60 }} />
              </div>
            </div>
          </motion.div>

          {/* Opposite end */}
          <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 50, damping: 16 }}>
            <div className="w-full h-full flex flex-col items-center justify-end">
              <div className="flex flex-col items-center mb-8">
                <div className="w-[1px] bg-border rounded-full" style={{ height: r - 68 }} />
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
              </div>
            </div>
          </motion.div>

          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ scale: isPointingQibla ? 1.15 : 1 }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 ${
                isPointingQibla ? 'bg-foreground' : 'bg-foreground/80'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-background" />
            </motion.div>
          </div>
        </div>

        {/* Aligned badge */}
        <AnimatePresence>
          {isPointingQibla && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-foreground text-background">
              <Check className="w-4 h-4" />
              <span className="text-sm font-bold">أنت تواجه القبلة</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-6 mb-2">
        <div className="rounded-2xl p-4 border border-border text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Navigation className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-semibold">الاتجاه</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="rounded-2xl p-4 border border-border text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-semibold">المسافة</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {distanceToKaaba !== null ? `${distanceToKaaba.toLocaleString()}` : '—'}
            {distanceToKaaba !== null && <span className="text-xs text-muted-foreground mr-1 font-medium">كم</span>}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-muted-foreground text-center mt-2 border border-border py-2 px-3 rounded-xl font-medium">{error}</p>
      )}

      {!compassActive && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={requestPermission}
          className="mt-5 mx-auto flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-foreground text-background text-sm font-bold active:scale-[0.97] transition-transform">
          <LocateFixed className="w-4 h-4" /> تفعيل البوصلة
        </motion.button>
      )}
    </div>
  );
};

export default QiblaPage;
