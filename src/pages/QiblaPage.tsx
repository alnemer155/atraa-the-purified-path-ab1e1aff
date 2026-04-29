import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LocateFixed, Info, Check, Compass, Navigation } from 'lucide-react';
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
const RING_R = CENTER - 8;
const TICK_OUT = RING_R - 4;

/* ============================================================
 * Static dial — ticks, cardinals, Qibla pointer arrow.
 * Memoised once, NEVER re-renders. Rotation handled via parent transform.
 * ============================================================ */
const StaticDial = (() => {
  const ticks: JSX.Element[] = [];
  for (let i = 0; i < 72; i++) {
    const deg = i * 5;
    const angle = (deg * Math.PI) / 180 - Math.PI / 2;
    const isMajor = deg % 90 === 0;
    const isMid = deg % 30 === 0;
    const len = isMajor ? 16 : isMid ? 10 : 4;
    const x1 = CENTER + TICK_OUT * Math.cos(angle);
    const y1 = CENTER + TICK_OUT * Math.sin(angle);
    const x2 = CENTER + (TICK_OUT - len) * Math.cos(angle);
    const y2 = CENTER + (TICK_OUT - len) * Math.sin(angle);
    ticks.push(
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="hsl(var(--foreground))"
        strokeWidth={isMajor ? 2 : isMid ? 1 : 0.6}
        strokeLinecap="round"
        opacity={isMajor ? 0.7 : isMid ? 0.3 : 0.13}
      />
    );
  }

  const cardinals: { label: string; angle: number; isN?: boolean }[] = [
    { label: 'ش', angle: 0, isN: true },
    { label: 'ق', angle: 90 },
    { label: 'ج', angle: 180 },
    { label: 'غ', angle: 270 },
  ];
  const labels = cardinals.map(({ label, angle, isN }) => {
    const rad = (angle * Math.PI) / 180 - Math.PI / 2;
    const dist = RING_R - 38;
    const x = CENTER + dist * Math.cos(rad);
    const y = CENTER + dist * Math.sin(rad);
    return (
      <text
        key={label}
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isN ? 'hsl(var(--gold))' : 'hsl(var(--foreground))'}
        fontSize="13"
        opacity={isN ? 0.95 : 0.4}
        style={{ fontFamily: 'inherit', fontWeight: 300 }}
      >
        {label}
      </text>
    );
  });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {ticks}
      {labels}
    </svg>
  );
})();

/** Kaaba target — sits on the dial at the top so it rotates WITH the qibla. */
const KaabaTarget = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44">
    <circle cx="22" cy="22" r="20" fill="hsl(var(--background))" stroke="hsl(var(--gold))" strokeWidth="1.4" />
    {/* Kaaba */}
    <rect x="13" y="14" width="18" height="18" rx="1" fill="hsl(var(--foreground))" />
    {/* Kiswah gold band */}
    <rect x="13" y="19" width="18" height="3" fill="hsl(var(--gold))" opacity="0.85" />
    {/* Door */}
    <rect x="19.5" y="23" width="5" height="9" rx="0.4" fill="hsl(var(--gold))" opacity="0.75" />
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
  const [deviation, setDeviation] = useState<number | null>(null);

  const headingRef = useRef(0);
  const dialWrapRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const samplesRef = useRef<number[]>([]);
  const hasVibrated = useRef(false);
  const lastAlignedRef = useRef(false);
  const lastDevReportedRef = useRef<number>(-1);

  /* ---------- GPS: cache → fast → accurate ------------------------------ */
  useEffect(() => {
    let cancelled = false;
    const cached = readCachedFix();
    if (cached) {
      setCoords({ lat: cached.lat, lng: cached.lng });
      setQiblaDirection(calculateQibla(cached.lat, cached.lng));
      setGpsAccuracy(cached.accuracy);
    }

    getAccurateLocation(4000).then((pos) => {
      if (cancelled) return;
      const { latitude, longitude, accuracy } = pos.coords;
      writeCachedFix(pos);
      setCoords({ lat: latitude, lng: longitude });
      setQiblaDirection(calculateQibla(latitude, longitude));
      setGpsAccuracy(accuracy);
    }).catch(() => { /* fall through */ });

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

  /* ---------- Compass loop --------------------------------------------- */
  const SAMPLE_SIZE = 8;
  const SMOOTHING = 0.25;

  const apply = useCallback(() => {
    rafRef.current = null;
    if (qiblaDirection === null) return;
    const heading = headingRef.current;
    let rotation = qiblaDirection - heading;
    rotation = ((rotation % 360) + 360) % 360;
    const dev = rotation > 180 ? 360 - rotation : rotation;
    const aligned = dev < 4;
    const score = Math.max(0, 1 - dev / 45);

    if (dialWrapRef.current) {
      dialWrapRef.current.style.transform = `rotate(${rotation}deg)`;
    }
    if (auraRef.current) {
      auraRef.current.style.opacity = String(0.12 + score * 0.6);
    }
    if (hubRef.current) {
      const glow = aligned
        ? `0 0 28px hsl(var(--gold) / 0.95), 0 0 60px hsl(var(--gold) / 0.5)`
        : `0 0 ${4 + score * 18}px hsl(var(--gold) / ${0.18 + score * 0.55})`;
      hubRef.current.style.boxShadow = glow;
    }

    if (aligned !== lastAlignedRef.current) {
      lastAlignedRef.current = aligned;
      setIsAligned(aligned);
    }
    // throttle deviation state updates (every ~1°) to avoid React churn
    const devRounded = Math.round(dev);
    if (devRounded !== lastDevReportedRef.current) {
      lastDevReportedRef.current = devRounded;
      setDeviation(devRounded);
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
      if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
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
      {/* Header */}
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
                  ? 'ضع الهاتف بشكل مسطّح وأدر جسمك حتى تصل علامة الكعبة إلى المؤشّر العلوي. عند المحاذاة يهتزّ الهاتف ويتوهّج المركز بلون ذهبي.'
                  : 'Hold the phone flat and rotate your body until the Kaaba marker reaches the top indicator. On alignment the phone will vibrate and the centre will glow gold.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          {/* Aura */}
          <div
            ref={auraRef}
            className="absolute inset-[-50px] rounded-full pointer-events-none"
            style={{
              opacity: 0,
              background: 'radial-gradient(circle, hsl(var(--gold) / 0.45) 0%, hsl(var(--primary) / 0.18) 45%, transparent 75%)',
              filter: 'blur(34px)',
              transition: 'opacity 220ms linear',
            }}
          />

          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-card border border-border/40" />
          <div className="absolute inset-[10px] rounded-full border border-border/20" />
          <div className="absolute inset-[26px] rounded-full border border-dashed border-border/15" />

          {/* Rotating dial wrap (ticks + cardinals + Kaaba glyph) */}
          <div
            ref={dialWrapRef}
            className="absolute inset-0"
            style={{ transformOrigin: '50% 50%', willChange: 'transform', transition: 'transform 110ms linear' }}
          >
            {StaticDial}
            {/* Kaaba sits at top of the dial — when aligned, it lands at the top indicator */}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2"
              style={{ marginTop: -6 }}
            >
              <KaabaTarget size={44} />
            </div>
          </div>

          {/* Fixed top indicator (the "you are here" pointer) */}
          <div className="absolute inset-x-0 -top-3 flex justify-center pointer-events-none">
            <svg width="22" height="20" viewBox="0 0 22 20">
              <path d="M11 0 L20 18 H2 Z" fill="hsl(var(--gold))" opacity="0.95" />
            </svg>
          </div>

          {/* Centre hub */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              ref={hubRef}
              className="w-4 h-4 rounded-full bg-gold border border-background"
              style={{ transition: 'box-shadow 220ms linear' }}
            />
          </div>
        </div>

        {/* Status pill */}
        <div className="h-9 mt-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isAligned ? (
              <motion.div
                key="aligned"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gold text-background"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-[12px]">{isAr ? 'أنت تواجه القبلة' : 'You are facing the Qibla'}</span>
              </motion.div>
            ) : compassActive && deviation !== null ? (
              <motion.div
                key="dev"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border/30"
              >
                <Navigation className="w-3 h-3 text-muted-foreground/60" />
                <span className="text-[11px] text-muted-foreground/80 tabular-nums font-light">
                  {isAr ? `الانحراف ${deviation}°` : `Off by ${deviation}°`}
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 mb-2">
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
          <span className="text-[9px] text-muted-foreground/45 font-light tracking-wide block mb-1">
            {isAr ? 'المسافة' : 'Distance'}
          </span>
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
