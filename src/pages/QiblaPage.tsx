import { useState, useEffect, useCallback, useRef } from 'react';
import { LocateFixed, Info, Check, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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

const SIZE = 320;
const CENTER = SIZE / 2;
const RING_R = CENTER - 10;
const TICK_OUT = RING_R - 2;
const TICK_LONG = 14;
const TICK_SHORT = 5;

/**
 * KaabaGlyph — minimal stylized Kaaba (rectangle with kiswah band).
 */
const KaabaGlyph = ({ size = 36, glow = 0 }: { size?: number; glow?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <defs>
      <linearGradient id="kaaba-grad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="hsl(var(--foreground))" />
        <stop offset="1" stopColor="hsl(var(--foreground))" stopOpacity="0.85" />
      </linearGradient>
    </defs>
    <rect x="9" y="11" width="22" height="22" rx="1.5" fill="url(#kaaba-grad)" />
    <rect x="9" y="17" width="22" height="3.6" fill="hsl(var(--gold))" opacity={0.7 + glow * 0.3} />
    <rect x="9" y="17" width="22" height="0.6" fill="hsl(var(--gold))" />
    <rect x="9" y="20.6" width="22" height="0.6" fill="hsl(var(--gold))" />
    <rect x="17" y="22" width="6" height="11" rx="0.6" fill="hsl(var(--gold))" opacity={0.55 + glow * 0.4} />
  </svg>
);

interface CompassProps {
  rotation: number;
  alignmentScore: number;
  isPointingQibla: boolean;
  active: boolean;
}

const CompassDial = ({ rotation, alignmentScore, isPointingQibla, active }: CompassProps) => {
  const cardinals = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      {/* Soft outer aura — golden when aligned */}
      <motion.div
        className="absolute inset-[-40px] rounded-full pointer-events-none"
        animate={{
          opacity: active ? 0.18 + alignmentScore * 0.6 : 0,
          scale: isPointingQibla ? [1, 1.04, 1] : 1,
        }}
        transition={{
          opacity: { duration: 0.4 },
          scale: isPointingQibla ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
        }}
        style={{
          background: `radial-gradient(circle, hsl(var(--gold) / ${0.35 + alignmentScore * 0.45}) 0%, hsl(var(--primary) / ${0.12 + alignmentScore * 0.25}) 40%, transparent 70%)`,
          filter: `blur(${22 + alignmentScore * 22}px)`,
        }}
      />

      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-card border border-border/30" />

      {/* Inner ring */}
      <div className="absolute inset-[18px] rounded-full border border-border/20" />

      <motion.svg
        className="absolute inset-0"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.8 }}
      >
        {/* 72 ticks every 5° */}
        {Array.from({ length: 72 }).map((_, i) => {
          const deg = i * 5;
          const angle = (deg * Math.PI) / 180 - Math.PI / 2;
          const isMajor = deg % 90 === 0;
          const isMid = deg % 30 === 0;
          const len = isMajor ? TICK_LONG : isMid ? 9 : TICK_SHORT;
          const x1 = CENTER + TICK_OUT * Math.cos(angle);
          const y1 = CENTER + TICK_OUT * Math.sin(angle);
          const x2 = CENTER + (TICK_OUT - len) * Math.cos(angle);
          const y2 = CENTER + (TICK_OUT - len) * Math.sin(angle);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
              strokeWidth={isMajor ? 1.5 : isMid ? 0.9 : 0.5}
              strokeLinecap="round"
              opacity={isMajor ? 0.55 : isMid ? 0.25 : 0.12} />
          );
        })}

        {/* Cardinal letters */}
        {cardinals.map(({ label, angle }) => {
          const rad = (angle * Math.PI) / 180 - Math.PI / 2;
          const dist = RING_R - 32;
          const x = CENTER + dist * Math.cos(rad);
          const y = CENTER + dist * Math.sin(rad);
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              fontSize="11"
              opacity={label === 'N' ? 0.9 : 0.35}
              transform={`rotate(${-rotation} ${x} ${y})`}
            >
              {label}
            </text>
          );
        })}

        {/* Qibla pointer — fixed to dial (rotates with it) */}
        <g>
          {/* Gold needle */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER}
            y2={28}
            stroke={`hsl(var(--gold) / ${0.4 + alignmentScore * 0.55})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Tail */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER}
            y2={SIZE - 60}
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.12"
          />
        </g>
      </motion.svg>

      {/* Kaaba glyph at top, also rotating with the dial */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-start justify-center"
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.8 }}
      >
        <motion.div
          className="mt-2 rounded-2xl bg-background border border-border/40 p-1.5 flex items-center justify-center"
          animate={isPointingQibla ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={isPointingQibla ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
          style={{
            boxShadow: alignmentScore > 0.3 ? `0 0 ${alignmentScore * 22}px hsl(var(--gold) / ${alignmentScore * 0.7})` : undefined,
          }}
        >
          <KaabaGlyph size={32} glow={alignmentScore} />
        </motion.div>
      </motion.div>

      {/* Static fixed top indicator (current direction marker) */}
      <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none">
        <div className="w-[2px] h-3 rounded-full bg-foreground/70 mt-1" />
      </div>

      {/* Center hub */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-3 h-3 rounded-full bg-foreground"
          animate={{
            boxShadow: `0 0 ${6 + alignmentScore * 22}px hsl(var(--gold) / ${0.2 + alignmentScore * 0.6})`,
          }}
        />
      </div>

      {/* Aligned ripple */}
      <AnimatePresence>
        {isPointingQibla && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1.25, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 pointer-events-none"
            style={{ borderColor: 'hsl(var(--gold) / 0.4)' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const QiblaPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
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
          setCoords({ lat: 26.3927, lng: 49.9777 });
          setQiblaDirection(calculateQibla(26.3927, 49.9777));
          setError(isAr ? 'تم استخدام الموقع الافتراضي (الدمام)' : 'Using default location (Dammam)');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [isAr]);

  // Smoothing buffer + low-pass filter for stable, accurate compass motion.
  // Kalman-lite: combine angular EMA with circular-mean of recent samples.
  const samplesRef = useRef<number[]>([]);
  const SAMPLE_SIZE = 8;
  const SMOOTHING = 0.18; // higher = snappier, lower = smoother

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let alpha = e.alpha;
    if (alpha === null) return;
    // @ts-ignore — webkitCompassHeading is true magnetic north on iOS
    if (e.webkitCompassHeading !== undefined) {
      // @ts-ignore
      alpha = e.webkitCompassHeading;
    } else {
      // Android/desktop: invert and apply screen orientation correction
      const screenAngle = (typeof window !== 'undefined' && window.screen?.orientation?.angle) || 0;
      alpha = (360 - alpha + screenAngle) % 360;
    }

    // Push into circular sample buffer
    const arr = samplesRef.current;
    arr.push(alpha);
    if (arr.length > SAMPLE_SIZE) arr.shift();

    // Compute circular mean of buffer (handles 359↔0 wrap-around correctly)
    let sumSin = 0, sumCos = 0;
    for (const a of arr) {
      const rad = (a * Math.PI) / 180;
      sumSin += Math.sin(rad);
      sumCos += Math.cos(rad);
    }
    const meanRad = Math.atan2(sumSin / arr.length, sumCos / arr.length);
    let meanDeg = (meanRad * 180) / Math.PI;
    if (meanDeg < 0) meanDeg += 360;

    // Low-pass towards circular mean (shortest angular delta)
    let diff = meanDeg - headingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    headingRef.current = (headingRef.current + diff * SMOOTHING + 360) % 360;
    setHeading(headingRef.current);
    setCompassActive(true);
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
      // Use the more accurate `deviceorientationabsolute` when available
      const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
      window.addEventListener(evt, handleOrientation as EventListener, true);
      return () => window.removeEventListener(evt, handleOrientation as EventListener, true);
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
      } else {
        setCompassActive(true);
      }
    } catch { /* ignore */ }
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
      if ('vibrate' in navigator) navigator.vibrate([25, 40, 25]);
    } else if (!isPointingQibla) {
      hasVibrated.current = false;
    }
  }, [isPointingQibla]);

  return (
    <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      {/* Heritage header */}
      <div className="flex items-center justify-between mb-5">
        <div className={`flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
          <h1 className="text-lg text-foreground tracking-tight">{isAr ? 'اتجاه القبلة' : 'Qibla Direction'}</h1>
          <p className="text-[9px] text-muted-foreground/45 font-light mt-0.5 tracking-wide">
            {isAr ? 'الكعبة المشرّفة · مكة المكرمة' : 'The Holy Kaaba · Makkah'}
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${showInfo ? 'bg-foreground text-background' : 'bg-card border border-border/30 text-muted-foreground/50'}`}
          aria-label="info"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="bg-card border border-border/20 rounded-2xl p-4">
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed font-light">
                {isAr
                  ? 'ضع الهاتف بشكل مسطّح وأدر جسمك حتى تتطابق علامة الكعبة مع المؤشّر العلوي. عند المحاذاة الكاملة سيهتزّ الهاتف ويتوهج المؤشّر بلون ذهبي.'
                  : 'Hold the phone flat and turn your body until the Kaaba glyph aligns with the top marker. On full alignment the phone will vibrate and the dial will glow gold.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <CompassDial
          rotation={rotation}
          alignmentScore={alignmentScore}
          isPointingQibla={isPointingQibla}
          active={compassActive}
        />

        <AnimatePresence>
          {isPointingQibla && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              className="flex items-center gap-2 mt-6 px-5 py-2.5 rounded-2xl bg-foreground"
            >
              <Check className="w-3.5 h-3.5 text-background" />
              <span className="text-[12px] text-background">{isAr ? 'أنت تواجه القبلة' : 'You are facing the Qibla'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-6 mb-2">
        <div className="bg-card border border-border/20 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Compass className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-[9px] text-muted-foreground/45 font-light tracking-wide">{isAr ? 'الاتجاه' : 'Bearing'}</span>
          </div>
          <p className="text-[22px] text-foreground tracking-tight font-light tabular-nums">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="bg-card border border-border/20 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] text-muted-foreground/45 font-light tracking-wide">{isAr ? 'المسافة' : 'Distance'}</span>
          </div>
          <p className="text-[22px] text-foreground tracking-tight font-light tabular-nums">
            {distanceToKaaba !== null ? distanceToKaaba.toLocaleString() : '—'}
            {distanceToKaaba !== null && (
              <span className="text-[10px] text-muted-foreground/40 ms-1 font-light">{isAr ? 'كم' : 'km'}</span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[9px] text-muted-foreground/50 text-center mt-2 font-light">{error}</p>
      )}

      {!compassActive && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestPermission}
          className="mt-4 mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background text-[12px] active:scale-[0.97] transition-transform"
        >
          <LocateFixed className="w-4 h-4" />
          {isAr ? 'تفعيل البوصلة' : 'Enable compass'}
        </motion.button>
      )}
    </div>
  );
};

export default QiblaPage;
