import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation, MapPin, LocateFixed } from 'lucide-react';
import { motion } from 'framer-motion';

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

// Kaaba SVG icon component
const KaabaIcon = ({ size = 28, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none">
    {/* Base cube */}
    <rect x="12" y="18" width="40" height="36" rx="2" fill="hsl(var(--foreground))" />
    {/* Gold band (kiswa) */}
    <rect x="12" y="28" width="40" height="8" fill="hsl(var(--gold))" opacity="0.9" />
    {/* Gold decorative pattern on band */}
    <rect x="22" y="30" width="20" height="4" rx="1" fill="hsl(var(--gold))" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
    {/* Door */}
    <rect x="27" y="36" width="10" height="16" rx="5" fill="hsl(var(--gold))" opacity="0.8" />
    {/* Top edge highlight */}
    <rect x="12" y="18" width="40" height="2" rx="1" fill="hsl(var(--foreground))" opacity="0.6" />
  </svg>
);

const QiblaPage = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState('');
  const [compassActive, setCompassActive] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
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
      <div className="text-center mb-4">
        <h1 className="text-xl font-semibold text-foreground mb-1">اتجاه القبلة</h1>
        <p className="text-sm text-muted-foreground">الكعبة المشرّفة · بيت الله الحرام</p>
      </div>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: compassSize, height: compassSize }}>
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-card shadow-elevated border-2 border-border" />
          
          {/* Inner decorative ring */}
          <div className="absolute inset-3 rounded-full border border-primary/10" />

          {/* Degree ticks */}
          <svg className="absolute inset-0" viewBox={`0 0 ${compassSize} ${compassSize}`}>
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = (i * 5 * Math.PI) / 180 - Math.PI / 2;
              const isMajor = i % 18 === 0;
              const isMid = i % 9 === 0;
              const len = isMajor ? 16 : isMid ? 10 : 5;
              const outerR = r - 6;
              const x1 = r + outerR * Math.cos(angle);
              const y1 = r + outerR * Math.sin(angle);
              const x2 = r + (outerR - len) * Math.cos(angle);
              const y2 = r + (outerR - len) * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isMajor ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={isMajor ? 2.5 : 1}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Cardinal labels */}
          {[
            { label: 'ش', angle: 0, primary: true },
            { label: 'شر', angle: 90 },
            { label: 'ج', angle: 180 },
            { label: 'غر', angle: 270 },
          ].map(({ label, angle, primary }) => {
            const rad = (angle * Math.PI) / 180 - Math.PI / 2;
            const dist = r - 32;
            const x = r + dist * Math.cos(rad);
            const y = r + dist * Math.sin(rad);
            return (
              <span
                key={label}
                className={`absolute text-[11px] font-semibold ${primary ? 'text-primary' : 'text-muted-foreground'}`}
                style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
              >
                {label}
              </span>
            );
          })}

          {/* Qibla indicator with Kaaba icon */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 14 }}
          >
            <div className="w-full h-full flex flex-col items-center">
              {/* Kaaba at Qibla direction */}
              <div className="flex flex-col items-center mt-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-card transition-all ${
                  isPointingQibla ? 'bg-accent scale-110' : 'bg-card border border-border'
                }`}>
                  <KaabaIcon size={26} />
                </div>
                {/* Needle line */}
                <div className="w-[2px] rounded-full islamic-gradient" style={{ height: r - 60 }} />
              </div>
            </div>
          </motion.div>

          {/* Opposite side subtle line */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 14 }}
          >
            <div className="w-full h-full flex flex-col items-center justify-end">
              <div className="flex flex-col items-center mb-6">
                <div className="w-[1.5px] bg-muted-foreground/15 rounded-full" style={{ height: r - 68 }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/15" />
              </div>
            </div>
          </motion.div>

          {/* Center hub */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                boxShadow: isPointingQibla
                  ? '0 0 28px 6px hsl(var(--primary) / 0.4)'
                  : '0 2px 12px -4px hsl(150 30% 12% / 0.08)',
              }}
              className="w-14 h-14 rounded-full islamic-gradient flex items-center justify-center"
            >
              <div className="w-3 h-3 rounded-full bg-primary-foreground/80" />
            </motion.div>
          </div>
        </div>

        {/* Qibla aligned indicator */}
        {isPointingQibla && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-primary/10"
          >
            <span className="text-sm font-semibold text-primary">✓ أنت تواجه القبلة</span>
          </motion.div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mt-5 mb-2">
        <div className="bg-card rounded-2xl p-3.5 shadow-card text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">الاتجاه</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-3.5 shadow-card text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">المسافة</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {distanceToKaaba !== null ? `${distanceToKaaba.toLocaleString()} كم` : '—'}
          </p>
        </div>
      </div>

      {error && <p className="text-[11px] text-muted-foreground text-center mt-2">{error}</p>}

      {!compassActive && (
        <button
          onClick={requestPermission}
          className="mt-4 mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl islamic-gradient text-primary-foreground text-sm font-medium shadow-card"
        >
          <LocateFixed className="w-4 h-4" />
          تفعيل البوصلة
        </button>
      )}
    </div>
  );
};

export default QiblaPage;
