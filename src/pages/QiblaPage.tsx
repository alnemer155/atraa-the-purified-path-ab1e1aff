import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LocateFixed, Check, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getAccurateLocation, readCachedFix, writeCachedFix } from '@/lib/geo';

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

const SIZE = 300;
const CENTER = SIZE / 2;
const RING_R = CENTER - 6;

/* ============================================================
 * Static dial — ticks + cardinals. Rendered ONCE.
 * ============================================================ */
const StaticDial = (() => {
  const ticks: JSX.Element[] = [];
  for (let i = 0; i < 72; i++) {
    const deg = i * 5;
    const angle = (deg * Math.PI) / 180 - Math.PI / 2;
    const isMajor = deg % 90 === 0;
    const isMid = deg % 30 === 0;
    const len = isMajor ? 14 : isMid ? 9 : 4;
    const x1 = CENTER + RING_R * Math.cos(angle);
    const y1 = CENTER + RING_R * Math.sin(angle);
    const x2 = CENTER + (RING_R - len) * Math.cos(angle);
    const y2 = CENTER + (RING_R - len) * Math.sin(angle);
    ticks.push(
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="hsl(var(--foreground))"
        strokeWidth={isMajor ? 1.6 : isMid ? 1 : 0.6}
        strokeLinecap="round"
        opacity={isMajor ? 0.55 : isMid ? 0.25 : 0.1}
      />
    );
  }

  const cardinals = [
    { label: 'ش', angle: 0, isN: true },
    { label: 'ق', angle: 90 },
    { label: 'ج', angle: 180 },
    { label: 'غ', angle: 270 },
  ];
  const labels = cardinals.map(({ label, angle, isN }) => {
    const rad = (angle * Math.PI) / 180 - Math.PI / 2;
    const dist = RING_R - 32;
    const x = CENTER + dist * Math.cos(rad);
    const y = CENTER + dist * Math.sin(rad);
    return (
      <text
        key={label}
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isN ? 'hsl(var(--gold))' : 'hsl(var(--foreground))'}
        fontSize="12"
        opacity={isN ? 0.9 : 0.35}
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

const KaabaTarget = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="hsl(var(--background))" stroke="hsl(var(--gold))" strokeWidth="1.2" />
    <rect x="12" y="13" width="16" height="16" rx="1" fill="hsl(var(--foreground))" />
    <rect x="12" y="17.5" width="16" height="2.5" fill="hsl(var(--gold))" opacity="0.85" />
    <rect x="17.5" y="20.5" width="5" height="8" rx="0.4" fill="hsl(var(--gold))" opacity="0.75" />
  </svg>
);

const QiblaPage = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [compassActive, setCompassActive] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isAligned, setIsAligned] = useState(false);
  const [deviation, setDeviation] = useState<number | null>(null);

  // Refs — direct DOM mutations to avoid re-renders
  const headingRef = useRef(0);                 // smoothed heading
  const targetHeadingRef = useRef(0);           // last raw sample (for smoothing target)
  const qiblaRef = useRef<number | null>(null); // mirror of qiblaDirection (avoids stale apply)
  const dialWrapRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const samplesRef = useRef<number[]>([]);
  const hasVibrated = useRef(false);
  const lastAlignedRef = useRef(false);
  const lastDevReportedRef = useRef<number>(-1);
  const lastDevUpdateTs = useRef<number>(0);

  /* ---------- GPS — single fast call, fallback to cache ---------------- */
  useEffect(() => {
    let cancelled = false;
    const cached = readCachedFix();
    if (cached) {
      setCoords({ lat: cached.lat, lng: cached.lng });
      const q = calculateQibla(cached.lat, cached.lng);
      setQiblaDirection(q);
      qiblaRef.current = q;
      setGpsAccuracy(cached.accuracy);
    }

    getAccurateLocation(8000)
      .then((pos) => {
        if (cancelled) return;
        const { latitude, longitude, accuracy } = pos.coords;
        writeCachedFix(pos);
        setCoords({ lat: latitude, lng: longitude });
        const q = calculateQibla(latitude, longitude);
        setQiblaDirection(q);
        qiblaRef.current = q;
        setGpsAccuracy(accuracy);
      })
      .catch(() => {
        if (cancelled || cached) return;
        setCoords({ lat: 26.3927, lng: 49.9777 });
        const q = calculateQibla(26.3927, 49.9777);
        setQiblaDirection(q);
        qiblaRef.current = q;
        setError(isAr ? 'تعذّر تحديد الموقع — استخدام الموقع الافتراضي' : 'Location unavailable — using default');
      });

    return () => { cancelled = true; };
  }, [isAr]);

  /* ---------- Smooth animation loop (continuous, decoupled from sensor) - */
  const SMOOTHING = 0.18;

  const tick = useCallback(() => {
    rafRef.current = requestAnimationFrame(tick);
    const q = qiblaRef.current;
    if (q === null) return;

    // Approach the latest sensor heading smoothly each frame.
    let diff = targetHeadingRef.current - headingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    headingRef.current = (headingRef.current + diff * SMOOTHING + 360) % 360;

    let rotation = q - headingRef.current;
    rotation = ((rotation % 360) + 360) % 360;
    const dev = rotation > 180 ? 360 - rotation : rotation;
    const aligned = dev < 4;
    const score = Math.max(0, 1 - dev / 45);

    if (dialWrapRef.current) {
      dialWrapRef.current.style.transform = `rotate(${rotation.toFixed(1)}deg)`;
    }
    if (auraRef.current) {
      auraRef.current.style.opacity = String(0.1 + score * 0.55);
    }
    if (hubRef.current) {
      hubRef.current.style.boxShadow = aligned
        ? `0 0 26px hsl(var(--gold) / 0.95), 0 0 56px hsl(var(--gold) / 0.45)`
        : `0 0 ${4 + score * 16}px hsl(var(--gold) / ${0.16 + score * 0.5})`;
    }

    if (aligned !== lastAlignedRef.current) {
      lastAlignedRef.current = aligned;
      setIsAligned(aligned);
    }

    // Throttle deviation state updates to ~6 Hz AND only when changed by 1°
    const now = performance.now();
    const devRounded = Math.round(dev);
    if (now - lastDevUpdateTs.current > 160 && devRounded !== lastDevReportedRef.current) {
      lastDevReportedRef.current = devRounded;
      lastDevUpdateTs.current = now;
      setDeviation(devRounded);
    }
  }, []);

  /* ---------- Sensor handler — pure ref writes, no React work ---------- */
  const SAMPLE_SIZE = 6;
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let alpha = e.alpha;
    if (alpha === null) return;
    // @ts-ignore
    if (typeof e.webkitCompassHeading === 'number') {
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
    targetHeadingRef.current = meanDeg;

    if (!compassActive) setCompassActive(true);
  }, [compassActive]);

  /* ---------- Mount: start rAF + listeners ----------------------------- */
  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [tick]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    const needsPerm = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
    if (needsPerm) {
      setNeedsPermission(true);
      return;
    }
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(evt, handleOrientation as EventListener, true);
    return () => window.removeEventListener(evt, handleOrientation as EventListener, true);
  }, [handleOrientation]);

  const requestPermission = async () => {
    try {
      // @ts-ignore
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation, true);
        setNeedsPermission(false);
        setCompassActive(true);
      }
    } catch { /* ignore */ }
  };

  /* ---------- Vibrate on alignment ------------------------------------- */
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
    <div className="px-5 py-4 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col">
      {/* Header — minimal */}
      <div className={`mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
        <h1 className="text-[22px] text-foreground tracking-tight font-light leading-none">
          {isAr ? 'القبلة' : 'Qibla'}
        </h1>
        <p className="text-[10px] text-muted-foreground/45 font-light tracking-[0.18em] mt-2">
          {isAr ? 'الكعبة المشرّفة · مكة المكرمة' : 'The Holy Kaaba · Makkah'}
        </p>
      </div>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          {/* Soft aura — direct DOM */}
          <div
            ref={auraRef}
            className="absolute inset-[-44px] rounded-full pointer-events-none"
            style={{
              opacity: 0,
              background: 'radial-gradient(circle, hsl(var(--gold) / 0.42) 0%, hsl(var(--primary) / 0.16) 45%, transparent 75%)',
              filter: 'blur(30px)',
              willChange: 'opacity',
            }}
          />

          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full bg-card border border-border/40" />
          <div className="absolute inset-[8px] rounded-full border border-border/20" />
          <div className="absolute inset-[22px] rounded-full border border-dashed border-border/15" />

          {/* Rotating dial */}
          <div
            ref={dialWrapRef}
            className="absolute inset-0"
            style={{ transformOrigin: '50% 50%', willChange: 'transform' }}
          >
            {StaticDial}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2"
              style={{ marginTop: -4 }}
            >
              <KaabaTarget size={40} />
            </div>
          </div>

          {/* Top fixed indicator (you-arrow) */}
          <div className="absolute inset-x-0 -top-2 flex justify-center pointer-events-none">
            <svg width="20" height="18" viewBox="0 0 20 18">
              <path d="M10 0 L18 16 H2 Z" fill="hsl(var(--gold))" opacity="0.95" />
            </svg>
          </div>

          {/* Centre hub */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              ref={hubRef}
              className="w-3.5 h-3.5 rounded-full bg-gold border border-background"
              style={{ willChange: 'box-shadow' }}
            />
          </div>
        </div>

        {/* Status text */}
        <div className="h-7 mt-7 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isAligned ? (
              <motion.div
                key="aligned"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 text-gold"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-[12px] tracking-wide">{isAr ? 'أنت تواجه القبلة' : 'Facing the Qibla'}</span>
              </motion.div>
            ) : compassActive && deviation !== null ? (
              <motion.div
                key="dev"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-muted-foreground/70"
              >
                <Navigation className="w-3 h-3 opacity-50" />
                <span className="text-[11px] tabular-nums font-light tracking-wide">
                  {isAr ? `الانحراف ${deviation}°` : `Off by ${deviation}°`}
                </span>
              </motion.div>
            ) : !compassActive ? (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] text-muted-foreground/50 font-light tracking-wide"
              >
                {isAr ? 'حرّك الجهاز قليلاً للمعايرة' : 'Move device to calibrate'}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats — hairline row */}
      <div className={`flex items-stretch mt-2 mb-2 border-t border-border/15 pt-4 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1 text-center">
          <p className="text-[8px] text-muted-foreground/40 font-light tracking-[0.2em] uppercase mb-1.5">
            {isAr ? 'الاتجاه' : 'Bearing'}
          </p>
          <p className="text-[20px] text-foreground tracking-tight font-light tabular-nums leading-none">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="w-px bg-border/20 mx-2" />
        <div className="flex-1 text-center">
          <p className="text-[8px] text-muted-foreground/40 font-light tracking-[0.2em] uppercase mb-1.5">
            {isAr ? 'المسافة' : 'Distance'}
          </p>
          <p className="text-[20px] text-foreground tracking-tight font-light tabular-nums leading-none">
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
        <p className="text-[9px] text-muted-foreground/35 text-center mt-1 font-light tabular-nums tracking-wide">
          {isAr ? `دقة الموقع ±${Math.round(gpsAccuracy)} م` : `GPS ±${Math.round(gpsAccuracy)} m`}
        </p>
      )}

      {needsPermission && !compassActive && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={requestPermission}
          className="mt-4 mx-auto flex items-center gap-2 px-7 py-3 rounded-full bg-foreground text-background text-[12px] active:scale-[0.97] transition-transform tracking-wide"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          {isAr ? 'تفعيل البوصلة' : 'Enable compass'}
        </motion.button>
      )}
    </div>
  );
};

export default QiblaPage;
