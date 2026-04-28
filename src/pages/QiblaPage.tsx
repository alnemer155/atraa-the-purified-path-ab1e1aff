import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LocateFixed, Info, Check, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getBestAccuracyLocation, getAccurateLocation, readCachedFix, writeCachedFix } from '@/lib/geo';

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

/** Static dial (ticks + cardinals). Memoised — never re-renders. */
const StaticDial = (() => {
  const ticks: JSX.Element[] = [];
  for (let i = 0; i < 72; i++) {
    const deg = i * 5;
    const angle = (deg * Math.PI) / 180 - Math.PI / 2;
    const isMajor = deg % 90 === 0;
    const isMid = deg % 30 === 0;
    const len = isMajor ? 14 : isMid ? 9 : 5;
    const x1 = CENTER + TICK_OUT * Math.cos(angle);
    const y1 = CENTER + TICK_OUT * Math.sin(angle);
    const x2 = CENTER + (TICK_OUT - len) * Math.cos(angle);
    const y2 = CENTER + (TICK_OUT - len) * Math.sin(angle);
    ticks.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="hsl(var(--foreground))"
        strokeWidth={isMajor ? 1.5 : isMid ? 0.9 : 0.5}
        strokeLinecap="round"
        opacity={isMajor ? 0.55 : isMid ? 0.25 : 0.12} />
    );
  }
  const cardinals = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];
  const labels = cardinals.map(({ label, angle }) => {
    const rad = (angle * Math.PI) / 180 - Math.PI / 2;
    const dist = RING_R - 32;
    const x = CENTER + dist * Math.cos(rad);
    const y = CENTER + dist * Math.sin(rad);
    return (
      <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground" fontSize="11"
        opacity={label === 'N' ? 0.9 : 0.35}>
        {label}
      </text>
    );
  });
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {ticks}
      {labels}
      {/* Qibla needle (gold up, foreground tail) */}
      <line x1={CENTER} y1={CENTER} x2={CENTER} y2={28}
        stroke="hsl(var(--gold))" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <line x1={CENTER} y1={CENTER} x2={CENTER} y2={SIZE - 60}
        stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.12" />
    </svg>
  );
})();

const KaabaGlyph = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <rect x="9" y="11" width="22" height="22" rx="1.5" fill="hsl(var(--foreground))" />
    <rect x="9" y="17" width="22" height="3.6" fill="hsl(var(--gold))" opacity={0.8} />
    <rect x="17" y="22" width="6" height="11" rx="0.6" fill="hsl(var(--gold))" opacity={0.7} />
  </svg>
);

const QiblaPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [compassActive, setCompassActive] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isAligned, setIsAligned] = useState(false);

  const headingRef = useRef(0);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const kaabaRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const samplesRef = useRef<number[]>([]);
  const hasVibrated = useRef(false);
  const lastAlignedRef = useRef(false);

  /* ---------- GPS: cache → fast → accurate ------------------------------ */
  useEffect(() => {
    let cancelled = false;
    const cached = readCachedFix();
    if (cached) {
      setCoords({ lat: cached.lat, lng: cached.lng });
      setQiblaDirection(calculateQibla(cached.lat, cached.lng));
      setGpsAccuracy(cached.accuracy);
    }

    // First: fast one-shot (uses cached system fix, ~instant)
    getAccurateLocation(4000).then((pos) => {
      if (cancelled) return;
      const { latitude, longitude, accuracy } = pos.coords;
      writeCachedFix(pos);
      setCoords({ lat: latitude, lng: longitude });
      setQiblaDirection(calculateQibla(latitude, longitude));
      setGpsAccuracy(accuracy);
    }).catch(() => { /* fall through */ });

    // Then: refine in background for best accuracy
    getBestAccuracyLocation({ windowMs: 5000, acceptAccuracyM: 15, fallbackTimeoutMs: 10000 })
      .then((pos) => {
        if (cancelled) return;
        const { latitude, longitude, accuracy } = pos.coords;
        writeCachedFix(pos);
        setCoords({ lat: latitude, lng: longitude });
        setQiblaDirection(calculateQibla(latitude, longitude));
        setGpsAccuracy(accuracy);
      })
      .catch(() => {
        if (cancelled || cached) return;
        setCoords({ lat: 26.3927, lng: 49.9777 });
        setQiblaDirection(calculateQibla(26.3927, 49.9777));
        setError(isAr ? 'تم استخدام الموقع الافتراضي (الدمام)' : 'Using default location (Dammam)');
      });

    return () => { cancelled = true; };
  }, [isAr]);

  /* ---------- Compass: rAF-batched, direct DOM transform ---------------- */
  const SAMPLE_SIZE = 6;
  const SMOOTHING = 0.22;

  const apply = useCallback(() => {
    rafRef.current = null;
    if (qiblaDirection === null) return;
    const heading = headingRef.current;
    let rotation = qiblaDirection - heading;
    rotation = ((rotation % 360) + 360) % 360;
    const dev = rotation > 180 ? 360 - rotation : rotation;
    const aligned = dev < 4;
    const score = Math.max(0, 1 - dev / 45);

    if (dialRef.current) {
      dialRef.current.style.transform = `rotate(${rotation}deg)`;
    }
    if (kaabaRef.current) {
      // Counter-rotate the cardinal "N" letter group? Not used; keep glyph upright on top of dial.
      kaabaRef.current.style.transform = `rotate(${rotation}deg)`;
    }
    if (auraRef.current) {
      auraRef.current.style.opacity = String(0.15 + score * 0.55);
    }
    if (hubRef.current) {
      hubRef.current.style.boxShadow = `0 0 ${6 + score * 22}px hsl(var(--gold) / ${0.2 + score * 0.6})`;
    }

    if (aligned !== lastAlignedRef.current) {
      lastAlignedRef.current = aligned;
      setIsAligned(aligned);
    }
  }, [qiblaDirection]);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let alpha = e.alpha;
    if (alpha === null) return;
    // @ts-ignore
    if (e.webkitCompassHeading !== undefined) {
      // @ts-ignore
      alpha = e.webkitCompassHeading;
    } else {
      const screenAngle = (typeof window !== 'undefined' && window.screen?.orientation?.angle) || 0;
      alpha = (360 - alpha + screenAngle) % 360;
    }

    const arr = samplesRef.current;
    arr.push(alpha);
    if (arr.length > SAMPLE_SIZE) arr.shift();

    let sumSin = 0, sumCos = 0;
    for (const a of arr) {
      const rad = (a * Math.PI) / 180;
      sumSin += Math.sin(rad);
      sumCos += Math.cos(rad);
    }
    const meanRad = Math.atan2(sumSin / arr.length, sumCos / arr.length);
    let meanDeg = (meanRad * 180) / Math.PI;
    if (meanDeg < 0) meanDeg += 360;

    let diff = meanDeg - headingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    headingRef.current = (headingRef.current + diff * SMOOTHING + 360) % 360;

    if (!compassActive) setCompassActive(true);

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(apply);
    }
  }, [apply, compassActive]);

  useEffect(() => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
      window.addEventListener(evt, handleOrientation as EventListener, true);
      return () => window.removeEventListener(evt, handleOrientation as EventListener, true);
    }
  }, [handleOrientation]);

  // Re-apply transforms once qibla becomes known
  useEffect(() => { apply(); }, [apply]);

  const requestPermission = async () => {
    try {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setCompassActive(true);
        }
      } else {
        setCompassActive(true);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (isAligned && !hasVibrated.current) {
      hasVibrated.current = true;
      if ('vibrate' in navigator) navigator.vibrate([25, 40, 25]);
    } else if (!isAligned) {
      hasVibrated.current = false;
    }
  }, [isAligned]);

  const distanceToKaaba = useMemo(
    () => coords ? Math.round(getDistance(coords.lat, coords.lng, KAABA_LAT, KAABA_LNG)) : null,
    [coords]
  );

  return (
    <div className="px-4 py-5 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
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

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          {/* Aura (direct DOM, no framer) */}
          <div
            ref={auraRef}
            className="absolute inset-[-40px] rounded-full pointer-events-none"
            style={{
              opacity: 0,
              background: 'radial-gradient(circle, hsl(var(--gold) / 0.4) 0%, hsl(var(--primary) / 0.18) 40%, transparent 70%)',
              filter: 'blur(28px)',
              transition: 'opacity 200ms linear',
            }}
          />

          <div className="absolute inset-0 rounded-full bg-card border border-border/30" />
          <div className="absolute inset-[18px] rounded-full border border-border/20" />

          {/* Rotating dial — pure CSS transform */}
          <div
            ref={dialRef}
            className="absolute inset-0"
            style={{ transformOrigin: '50% 50%', willChange: 'transform', transition: 'transform 120ms linear' }}
          >
            {StaticDial}
          </div>

          {/* Kaaba glyph rotates with the dial (sits at top) */}
          <div
            ref={kaabaRef}
            className="absolute inset-0 pointer-events-none flex items-start justify-center"
            style={{ transformOrigin: '50% 50%', willChange: 'transform', transition: 'transform 120ms linear' }}
          >
            <div className="mt-2 rounded-2xl bg-background border border-border/40 p-1.5 flex items-center justify-center">
              <KaabaGlyph size={32} />
            </div>
          </div>

          {/* Static fixed top indicator */}
          <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none">
            <div className="w-[2px] h-3 rounded-full bg-foreground/70 mt-1" />
          </div>

          {/* Center hub */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div ref={hubRef} className="w-3 h-3 rounded-full bg-foreground" style={{ transition: 'box-shadow 200ms linear' }} />
          </div>
        </div>

        <AnimatePresence>
          {isAligned && (
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
      {gpsAccuracy !== null && !error && (
        <p className="text-[9px] text-muted-foreground/40 text-center mt-2 font-light tabular-nums">
          {isAr ? `دقة الموقع: ±${Math.round(gpsAccuracy)} م` : `GPS accuracy: ±${Math.round(gpsAccuracy)} m`}
        </p>
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
