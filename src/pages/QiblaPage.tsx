import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation, MapPin, LocateFixed, Info, Check, Compass } from 'lucide-react';
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

const KaabaIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="12" y="18" width="40" height="36" rx="3" fill="hsl(var(--foreground))" />
    <rect x="12" y="28" width="40" height="8" fill="hsl(var(--gold))" opacity="0.85" />
    <rect x="22" y="30" width="20" height="4" rx="1" fill="hsl(var(--gold))" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
    <rect x="27" y="36" width="10" height="16" rx="5" fill="hsl(var(--gold))" opacity="0.75" />
  </svg>
);

const COMPASS_SIZE = 320;
const R = COMPASS_SIZE / 2;

const CompassDial = ({ heading, rotation, isPointingQibla }: { heading: number; rotation: number; isPointingQibla: boolean }) => {
  const cardinals = [
    { label: 'ش', angle: 0, primary: true },
    { label: 'شر', angle: 90 },
    { label: 'ج', angle: 180 },
    { label: 'غر', angle: 270 },
  ];

  return (
    <div className="relative" style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}>
      {/* Outer ring */}
      <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
        isPointingQibla 
          ? 'shadow-[0_0_40px_8px_hsl(var(--primary)/0.15)]' 
          : ''
      }`}>
        <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${
          isPointingQibla ? 'border-primary/30' : 'border-border/20'
        }`} />
        <div className={`absolute inset-1 rounded-full border transition-colors duration-500 ${
          isPointingQibla ? 'border-primary/10' : 'border-border/10'
        }`} />
      </div>

      {/* Background */}
      <div className={`absolute inset-2 rounded-full transition-all duration-500 ${
        isPointingQibla ? 'bg-primary/[0.03]' : 'bg-card/60'
      }`} />

      {/* Degree marks */}
      <svg className="absolute inset-0" viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}>
        {Array.from({ length: 360 }).map((_, i) => {
          if (i % 1 !== 0) return null;
          const angle = (i * Math.PI) / 180 - Math.PI / 2;
          const isMajor = i % 90 === 0;
          const isMid = i % 45 === 0;
          const isMinor = i % 5 === 0;
          if (!isMajor && !isMid && !isMinor) return null;
          const len = isMajor ? 16 : isMid ? 10 : 4;
          const outerR = R - 8;
          const x1 = R + outerR * Math.cos(angle);
          const y1 = R + outerR * Math.sin(angle);
          const x2 = R + (outerR - len) * Math.cos(angle);
          const y2 = R + (outerR - len) * Math.sin(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? 'hsl(var(--primary))' : isMid ? 'hsl(var(--muted-foreground))' : 'hsl(var(--border))'}
              strokeWidth={isMajor ? 2.5 : isMid ? 1.5 : 0.5}
              strokeLinecap="round"
              opacity={isMajor ? 1 : isMid ? 0.5 : 0.3} />
          );
        })}
      </svg>

      {/* Cardinal directions */}
      {cardinals.map(({ label, angle, primary }) => {
        const rad = (angle * Math.PI) / 180 - Math.PI / 2;
        const dist = R - 36;
        const x = R + dist * Math.cos(rad);
        const y = R + dist * Math.sin(rad);
        return (
          <span key={label}
            className={`absolute text-xs font-bold ${primary ? 'text-primary' : 'text-muted-foreground/40'}`}
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
            {label}
          </span>
        );
      })}

      {/* Qibla pointer */}
      <motion.div className="absolute inset-0" animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 50, damping: 16 }}>
        <div className="w-full h-full flex flex-col items-center">
          <div className="flex flex-col items-center mt-4">
            <motion.div
              animate={isPointingQibla ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={isPointingQibla ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isPointingQibla
                  ? 'bg-primary/10 dark:bg-primary/20 shadow-lg'
                  : 'bg-card border border-border/20'
              }`}>
              <KaabaIcon size={30} />
            </motion.div>
            <div className="w-[2px] rounded-full islamic-gradient opacity-60" style={{ height: R - 60 }} />
          </div>
        </div>
      </motion.div>

      {/* Opposite tail */}
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 50, damping: 16 }}>
        <div className="w-full h-full flex flex-col items-center justify-end">
          <div className="flex flex-col items-center mb-6">
            <div className="w-px bg-muted-foreground/10 rounded-full" style={{ height: R - 70 }} />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/10" />
          </div>
        </div>
      </motion.div>

      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={isPointingQibla ? {
            boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 24px 8px hsl(var(--primary) / 0.12)', '0 0 0 0 hsl(var(--primary) / 0)'],
          } : {}}
          transition={isPointingQibla ? { duration: 2, repeat: Infinity } : {}}
          className="w-16 h-16 rounded-full islamic-gradient flex items-center justify-center"
        >
          <div className="w-3 h-3 rounded-full bg-primary-foreground/90" />
        </motion.div>
      </div>

      {/* Qibla aligned ripple */}
      <AnimatePresence>
        {isPointingQibla && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.15, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DeviationBar = ({ rotation }: { rotation: number }) => {
  const normalized = ((rotation % 360) + 360) % 360;
  const deviation = normalized > 180 ? normalized - 360 : normalized;
  const clampedDev = Math.max(-45, Math.min(45, deviation));
  const percent = ((clampedDev + 45) / 90) * 100;

  return (
    <div className="w-full max-w-[200px] mx-auto mt-4">
      <div className="h-1 rounded-full bg-muted relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-px h-full bg-primary/30 -translate-x-1/2" />
        <motion.div
          className="absolute top-0 w-2 h-full rounded-full bg-primary"
          animate={{ left: `calc(${percent}% - 4px)` }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground/40 text-center mt-1 font-medium">
        {Math.abs(Math.round(deviation))}° {deviation > 1 ? 'يسار' : deviation < -1 ? 'يمين' : ''}
      </p>
    </div>
  );
};

const QiblaPage = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState('');
  const [compassActive, setCompassActive] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const headingRef = useRef(0);
  const hasVibrated = useRef(false);

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
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isPointingQibla = compassActive && (normalizedRotation < 4 || normalizedRotation > 356);

  // Haptic feedback
  useEffect(() => {
    if (isPointingQibla && !hasVibrated.current) {
      hasVibrated.current = true;
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 50, 30]);
      }
    } else if (!isPointingQibla) {
      hasVibrated.current = false;
    }
  }, [isPointingQibla]);

  return (
    <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-right flex-1">
          <h1 className="text-lg font-bold text-foreground tracking-tight">اتجاه القبلة</h1>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">الكعبة المشرّفة · مكة المكرمة</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showInfo ? 'bg-primary/8 text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground/60'}`}>
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
            <div className="glass-card p-3.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                وجّه هاتفك بشكل مسطّح وأدر جسمك حتى تشير علامة الكعبة للأعلى. تأكد من عدم وجود مصادر مغناطيسية قريبة.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <CompassDial heading={heading} rotation={rotation} isPointingQibla={isPointingQibla} />

        {/* Deviation bar */}
        {compassActive && <DeviationBar rotation={rotation} />}

        {/* Aligned badge */}
        <AnimatePresence>
          {isPointingQibla && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              className="flex items-center gap-2 mt-4 px-5 py-2.5 rounded-2xl islamic-gradient"
            >
              <Check className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-bold text-primary-foreground">أنت تواجه القبلة</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mt-4 mb-2">
        <div className="glass-card p-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Navigation className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[10px] text-muted-foreground/60 font-semibold">الاتجاه</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="glass-card p-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/60 font-semibold">المسافة</span>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {distanceToKaaba !== null ? `${distanceToKaaba.toLocaleString()}` : '—'}
            {distanceToKaaba !== null && <span className="text-xs text-muted-foreground/40 mr-1 font-medium">كم</span>}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-muted-foreground text-center mt-1 bg-muted/50 py-2 px-3 rounded-xl font-medium">{error}</p>
      )}

      {!compassActive && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestPermission}
          className="mt-4 mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl islamic-gradient text-primary-foreground text-sm font-bold active:scale-[0.97] transition-transform"
        >
          <LocateFixed className="w-4 h-4" />
          تفعيل البوصلة
        </motion.button>
      )}
    </div>
  );
};

export default QiblaPage;
