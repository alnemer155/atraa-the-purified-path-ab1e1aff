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
    <rect x="12" y="18" width="40" height="36" rx="3" fill="hsl(var(--foreground))" />
    <rect x="12" y="28" width="40" height="8" fill="hsl(var(--gold))" opacity="0.7" />
    <rect x="27" y="36" width="10" height="16" rx="5" fill="hsl(var(--gold))" opacity="0.6" />
  </svg>
);

const COMPASS_SIZE = 320;
const R = COMPASS_SIZE / 2;

const CompassDial = ({ heading, rotation, isPointingQibla, alignmentScore }: { heading: number; rotation: number; isPointingQibla: boolean; alignmentScore: number }) => {
  const cardinals = [
    { label: 'ش', angle: 0, primary: true },
    { label: 'شر', angle: 90 },
    { label: 'ج', angle: 180 },
    { label: 'غر', angle: 270 },
  ];

  const glow = alignmentScore;

  return (
    <div className="relative" style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}>
      {/* Noor outer halo */}
      <motion.div
        className="absolute inset-[-30px] rounded-full pointer-events-none"
        animate={{
          opacity: 0.15 + glow * 0.55,
          scale: isPointingQibla ? [1, 1.04, 1] : 1,
        }}
        transition={{
          opacity: { duration: 0.4 },
          scale: isPointingQibla ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
        }}
        style={{
          background: `radial-gradient(circle, hsl(var(--gold) / ${0.35 + glow * 0.4}) 0%, hsl(var(--primary) / ${0.18 + glow * 0.3}) 35%, transparent 70%)`,
          filter: `blur(${20 + glow * 25}px)`,
        }}
      />

      <motion.div
        className="absolute inset-0 rounded-full border transition-colors duration-500"
        animate={{ borderColor: `hsl(var(--gold) / ${0.05 + glow * 0.5})` }}
      />

      <svg className="absolute inset-0" viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}>
        {Array.from({ length: 72 }).map((_, i) => {
          const deg = i * 5;
          const angle = (deg * Math.PI) / 180 - Math.PI / 2;
          const isMajor = deg % 90 === 0;
          const isMid = deg % 45 === 0;
          const isMinor = deg % 5 === 0;
          const len = isMajor ? 16 : isMid ? 8 : 3;
          const outerR = R - 4;
          const x1 = R + outerR * Math.cos(angle);
          const y1 = R + outerR * Math.sin(angle);
          const x2 = R + (outerR - len) * Math.cos(angle);
          const y2 = R + (outerR - len) * Math.sin(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? 'hsl(var(--foreground))' : 'hsl(var(--border))'}
              strokeWidth={isMajor ? 1.5 : isMid ? 0.8 : 0.4}
              strokeLinecap="round"
              opacity={isMajor ? 0.6 : isMid ? 0.25 : isMinor ? 0.12 : 0} />
          );
        })}
      </svg>

      {cardinals.map(({ label, angle, primary }) => {
        const rad = (angle * Math.PI) / 180 - Math.PI / 2;
        const dist = R - 36;
        const x = R + dist * Math.cos(rad);
        const y = R + dist * Math.sin(rad);
        return (
          <span key={label}
            className={`absolute text-[11px] ${primary ? 'text-foreground/60' : 'text-muted-foreground/25'}`}
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
            {label}
          </span>
        );
      })}

      <motion.div className="absolute inset-0" animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 50, damping: 16 }}>
        <div className="w-full h-full flex flex-col items-center">
          <div className="flex flex-col items-center mt-4">
            <motion.div
              animate={isPointingQibla ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={isPointingQibla ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-card border border-border/15"
              style={{
                boxShadow: glow > 0.3 ? `0 0 ${glow * 24}px hsl(var(--gold) / ${glow * 0.7})` : undefined,
              }}>
              <KaabaIcon size={26} />
            </motion.div>
            <motion.div
              className="rounded-full"
              style={{
                width: 2,
                height: R - 60,
                background: `linear-gradient(to bottom, hsl(var(--gold) / ${0.4 + glow * 0.6}), hsl(var(--gold) / ${0.05 + glow * 0.2}))`,
                boxShadow: glow > 0.5 ? `0 0 ${glow * 12}px hsl(var(--gold) / ${glow * 0.8})` : 'none',
              }}
              animate={{ opacity: 0.5 + glow * 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 50, damping: 16 }}>
        <div className="w-full h-full flex flex-col items-center justify-end">
          <div className="flex flex-col items-center mb-6">
            <div className="w-px bg-muted-foreground/6 rounded-full" style={{ height: R - 70 }} />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/8" />
          </div>
        </div>
      </motion.div>

      {/* Noor center orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-12 h-12 rounded-full flex items-center justify-center bg-foreground"
          animate={{
            boxShadow: `0 0 ${10 + glow * 30}px hsl(var(--gold) / ${0.2 + glow * 0.7}), inset 0 0 ${4 + glow * 12}px hsl(var(--gold) / ${0.1 + glow * 0.4})`,
          }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="rounded-full bg-background"
            animate={{
              width: 8 + glow * 8,
              height: 8 + glow * 8,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {isPointingQibla && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 pointer-events-none"
              style={{ borderColor: 'hsl(var(--gold) / 0.4)' }}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, delay: 0.3 }}
              className="absolute inset-0 rounded-full border border-primary/20 pointer-events-none"
            />
          </>
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
    <div className="w-full max-w-[200px] mx-auto mt-5">
      <div className="h-[2px] rounded-full bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-px h-full bg-foreground/10 -translate-x-1/2" />
        <motion.div
          className="absolute top-[-1.5px] w-1.5 h-[5px] rounded-full bg-foreground/50"
          animate={{ left: `calc(${percent}% - 3px)` }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>
      <p className="text-[8px] text-muted-foreground/30 text-center mt-1.5 font-light">
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
  const deviationDeg = normalizedRotation > 180 ? 360 - normalizedRotation : normalizedRotation;
  const alignmentScore = compassActive ? Math.max(0, 1 - deviationDeg / 45) : 0;
  const isPointingQibla = compassActive && deviationDeg < 4;

  useEffect(() => {
    if (isPointingQibla && !hasVibrated.current) {
      hasVibrated.current = true;
      if ('vibrate' in navigator) {
        navigator.vibrate([25, 40, 25]);
      }
    } else if (!isPointingQibla) {
      hasVibrated.current = false;
    }
  }, [isPointingQibla]);

  return (
    <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-right flex-1">
          <h1 className="text-lg text-foreground tracking-tight">اتجاه القبلة</h1>
          <p className="text-[9px] text-muted-foreground/40 font-light mt-0.5">الكعبة المشرّفة · مكة المكرمة</p>
        </div>
        <button onClick={() => setShowInfo(!showInfo)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${showInfo ? 'text-foreground' : 'text-muted-foreground/30'}`}>
          <Info className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
            <div className="bg-card border border-border/15 rounded-2xl p-3.5">
              <p className="text-[10px] text-muted-foreground/50 leading-relaxed font-light">
                وجّه هاتفك بشكل مسطّح وأدر جسمك حتى تشير علامة الكعبة للأعلى.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center">
        <CompassDial heading={heading} rotation={rotation} isPointingQibla={isPointingQibla} />

        {compassActive && <DeviationBar rotation={rotation} />}

        <AnimatePresence>
          {isPointingQibla && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -3, scale: 0.98 }}
              className="flex items-center gap-2 mt-5 px-5 py-2.5 rounded-2xl bg-foreground"
            >
              <Check className="w-3.5 h-3.5 text-background" />
              <span className="text-[12px] text-background">أنت تواجه القبلة</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 mb-2">
        <div className="bg-card border border-border/15 rounded-2xl p-3.5 text-center">
          <span className="text-[8px] text-muted-foreground/35 font-light">الاتجاه</span>
          <p className="text-2xl text-foreground tracking-tight font-light mt-1">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="bg-card border border-border/15 rounded-2xl p-3.5 text-center">
          <span className="text-[8px] text-muted-foreground/35 font-light">المسافة</span>
          <p className="text-2xl text-foreground tracking-tight font-light mt-1">
            {distanceToKaaba !== null ? `${distanceToKaaba.toLocaleString()}` : '—'}
            {distanceToKaaba !== null && <span className="text-[10px] text-muted-foreground/30 mr-1 font-light">كم</span>}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[9px] text-muted-foreground/50 text-center mt-1 py-2 font-light">{error}</p>
      )}

      {!compassActive && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestPermission}
          className="mt-4 mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background text-[12px] active:scale-[0.97] transition-transform"
        >
          <LocateFixed className="w-4 h-4" />
          تفعيل البوصلة
        </motion.button>
      )}
    </div>
  );
};

export default QiblaPage;
