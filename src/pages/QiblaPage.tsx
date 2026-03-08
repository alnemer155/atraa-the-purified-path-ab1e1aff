import { useState, useEffect, useCallback, useRef } from 'react';
import { Compass, Navigation, MapPin, LocateFixed } from 'lucide-react';
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
    headingRef.current = (headingRef.current + diff * 0.12 + 360) % 360;
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

  // Check if roughly pointing at Qibla (within ±5°)
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isPointingQibla = compassActive && (normalizedRotation < 5 || normalizedRotation > 355);

  const compassSize = 280;
  const r = compassSize / 2;
  const tickR = r - 8;

  return (
    <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">اتجاه القبلة</h1>
        <p className="text-sm text-muted-foreground">نحو بيت الله الحرام</p>
      </div>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: compassSize, height: compassSize }}>
          {/* Background */}
          <div className="absolute inset-0 rounded-full bg-card shadow-elevated border border-border" />

          {/* Degree ticks via SVG */}
          <svg className="absolute inset-0" viewBox={`0 0 ${compassSize} ${compassSize}`}>
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = (i * 5 * Math.PI) / 180 - Math.PI / 2;
              const isMajor = i % 18 === 0;
              const isMid = i % 9 === 0;
              const len = isMajor ? 14 : isMid ? 8 : 4;
              const x1 = r + (tickR) * Math.cos(angle);
              const y1 = r + (tickR) * Math.sin(angle);
              const x2 = r + (tickR - len) * Math.cos(angle);
              const y2 = r + (tickR - len) * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isMajor ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={isMajor ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Inner circle */}
          <div className="absolute inset-8 rounded-full border border-primary/5" />

          {/* Cardinal labels */}
          {[
            { label: 'ش', angle: 0, primary: true },
            { label: 'شر', angle: 90, primary: false },
            { label: 'ج', angle: 180, primary: false },
            { label: 'غر', angle: 270, primary: false },
          ].map(({ label, angle, primary }) => {
            const rad = (angle * Math.PI) / 180 - Math.PI / 2;
            const dist = r - 28;
            const x = r + dist * Math.cos(rad);
            const y = r + dist * Math.sin(rad);
            return (
              <span
                key={label}
                className={`absolute text-[11px] font-semibold ${primary ? 'text-primary' : 'text-muted-foreground'}`}
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {label}
              </span>
            );
          })}

          {/* Qibla needle */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 50, damping: 12 }}
          >
            <div className="w-full h-full flex flex-col items-center">
              {/* Needle top (Qibla direction) */}
              <div className="flex flex-col items-center mt-8">
                <div className="w-6 h-6 rounded-full islamic-gradient flex items-center justify-center shadow-card">
                  <Navigation className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
                </div>
                <div className="w-[2px] islamic-gradient rounded-full" style={{ height: r - 52 }} />
              </div>
            </div>
          </motion.div>

          {/* Needle bottom (opposite) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 50, damping: 12 }}
          >
            <div className="w-full h-full flex flex-col items-center justify-end">
              <div className="flex flex-col items-center mb-8">
                <div className="w-[2px] bg-muted-foreground/20 rounded-full" style={{ height: r - 60 }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/20 mt-0.5" />
              </div>
            </div>
          </motion.div>

          {/* Center hub */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                boxShadow: isPointingQibla
                  ? '0 0 24px 4px hsl(var(--primary) / 0.35)'
                  : '0 2px 12px -4px hsl(150 30% 12% / 0.08)',
              }}
              className="w-16 h-16 rounded-full islamic-gradient flex items-center justify-center"
            >
              <Compass className="w-8 h-8 text-primary-foreground" />
            </motion.div>
          </div>
        </div>

        {/* Qibla aligned indicator */}
        {isPointingQibla && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-primary mt-4"
          >
            ✓ أنت تواجه القبلة
          </motion.p>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mt-6 mb-2">
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
