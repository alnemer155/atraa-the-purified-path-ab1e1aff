import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LocateFixed, Check, Compass } from 'lucide-react';
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

const SIZE = 304;
const CENTER = SIZE / 2;
const OUTER_R = CENTER - 4;
const INNER_R = OUTER_R - 18;

/* ============================================================
 * Static dial — refined ticks + cardinals. Rendered ONCE.
 * ============================================================ */
const StaticDial = (() => {
  const ticks: JSX.Element[] = [];
  for (let i = 0; i < 120; i++) {
    const deg = i * 3;
    const angle = (deg * Math.PI) / 180 - Math.PI / 2;
    const isMajor = deg % 90 === 0;
    const isMid = deg % 30 === 0;
    const isSub = deg % 15 === 0;
    const len = isMajor ? 16 : isMid ? 11 : isSub ? 6 : 3;
    const x1 = CENTER + INNER_R * Math.cos(angle);
    const y1 = CENTER + INNER_R * Math.sin(angle);
    const x2 = CENTER + (INNER_R - len) * Math.cos(angle);
    const y2 = CENTER + (INNER_R - len) * Math.sin(angle);
    ticks.push(
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="hsl(var(--foreground))"
        strokeWidth={isMajor ? 1.4 : isMid ? 0.9 : 0.5}
        strokeLinecap="round"
        opacity={isMajor ? 0.6 : isMid ? 0.28 : isSub ? 0.16 : 0.08}
      />
    );
    // Numeric degree at every 30°
    if (isMid && !isMajor) {
      const tx = CENTER + (INNER_R - 26) * Math.cos(angle);
      const ty = CENTER + (INNER_R - 26) * Math.sin(angle);
      ticks.push(
        <text
          key={`d${i}`}
          x={tx} y={ty}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(var(--foreground))"
          fontSize="7"
          opacity="0.32"
          style={{ fontFamily: 'inherit', fontWeight: 300, letterSpacing: '0.05em' }}
        >
          {deg}
        </text>
      );
    }
  }

  const cardinals = [
    { label: 'ش', angle: 0, isN: true },
    { label: 'ق', angle: 90 },
    { label: 'ج', angle: 180 },
    { label: 'غ', angle: 270 },
  ];
  const labels = cardinals.map(({ label, angle, isN }) => {
    const rad = (angle * Math.PI) / 180 - Math.PI / 2;
    const dist = INNER_R - 44;
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
        style={{ fontFamily: 'inherit', fontWeight: 300, letterSpacing: '0.02em' }}
      >
        {label}
      </text>
    );
  });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {/* Two faint reference circles */}
      <circle cx={CENTER} cy={CENTER} r={INNER_R} fill="none" stroke="hsl(var(--border))" strokeWidth="0.6" opacity="0.55" />
      <circle cx={CENTER} cy={CENTER} r={INNER_R - 56} fill="none" stroke="hsl(var(--border))" strokeWidth="0.4" opacity="0.4" strokeDasharray="2 4" />
      {ticks}
      {labels}
    </svg>
  );
})();

/* ============================================================
 * Qibla pointer — gold arrow + crescent silhouette of the Kaaba.
 * Sits on the dial so it rotates with the heading.
 * ============================================================ */
const QiblaPointer = () => (
  <svg
    className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
    width="46" height="58" viewBox="0 0 46 58"
    style={{ marginTop: -6 }}
  >
    {/* Long needle pointing toward center */}
    <defs>
      <linearGradient id="qiblaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="1" />
        <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.55" />
      </linearGradient>
    </defs>
    <path d="M23 4 L29 22 L23 18 L17 22 Z" fill="url(#qiblaGrad)" />
    {/* Kaaba badge */}
    <g transform="translate(23,38)">
      <circle r="14" fill="hsl(var(--background))" stroke="hsl(var(--gold))" strokeWidth="1.1" />
      <rect x="-7" y="-6.5" width="14" height="13" rx="1" fill="hsl(var(--foreground))" />
      <rect x="-7" y="-2.5" width="14" height="2" fill="hsl(var(--gold))" opacity="0.9" />
      <rect x="-2.5" y="0.5" width="5" height="6" rx="0.4" fill="hsl(var(--gold))" opacity="0.8" />
    </g>
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
  const [heading, setHeading] = useState<number | null>(null);

  // Refs — direct DOM mutations to avoid re-renders
  const headingRef = useRef(0);
  const targetHeadingRef = useRef(0);
  const qiblaRef = useRef<number | null>(null);
  const dialWrapRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);
  const headingPillRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const samplesRef = useRef<number[]>([]);
  const hasVibrated = useRef(false);
  const lastAlignedRef = useRef(false);
  const lastDevReportedRef = useRef<number>(-1);
  const lastDevUpdateTs = useRef<number>(0);
  const lastHeadingReportedRef = useRef<number>(-1);
  const lastHeadingUpdateTs = useRef<number>(0);

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

  /* ---------- Smooth animation loop ----------------------------------- */
  const SMOOTHING = 0.2;

  const tick = useCallback(() => {
    rafRef.current = requestAnimationFrame(tick);
    const q = qiblaRef.current;
    if (q === null) return;

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
      auraRef.current.style.opacity = String(0.08 + score * 0.55);
    }
    if (hubRef.current) {
      hubRef.current.style.boxShadow = aligned
        ? `0 0 30px hsl(var(--gold) / 0.95), 0 0 70px hsl(var(--gold) / 0.5)`
        : `0 0 ${4 + score * 18}px hsl(var(--gold) / ${0.18 + score * 0.5})`;
    }

    if (aligned !== lastAlignedRef.current) {
      lastAlignedRef.current = aligned;
      setIsAligned(aligned);
    }

    const now = performance.now();
    const devRounded = Math.round(dev);
    if (now - lastDevUpdateTs.current > 160 && devRounded !== lastDevReportedRef.current) {
      lastDevReportedRef.current = devRounded;
      lastDevUpdateTs.current = now;
      setDeviation(devRounded);
    }
    const headingRounded = Math.round(headingRef.current);
    if (now - lastHeadingUpdateTs.current > 200 && headingRounded !== lastHeadingReportedRef.current) {
      lastHeadingReportedRef.current = headingRounded;
      lastHeadingUpdateTs.current = now;
      // Update pill via ref (no re-render).
      if (headingPillRef.current) {
        headingPillRef.current.textContent = `${headingRounded}°`;
      } else {
        setHeading(headingRounded);
      }
    }
  }, []);

  /* ---------- Sensor handler ------------------------------------------ */
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

  /* ---------- Mount: start rAF + listeners ---------------------------- */
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

  /* ---------- Vibrate on alignment ------------------------------------ */
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
    <div className="px-5 pt-3 pb-6 animate-fade-in min-h-[calc(100vh-130px)] flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header — sleek */}
      <div className="text-center mb-1">
        <p className="text-[8px] text-gold/70 font-light tracking-[0.4em] uppercase mb-1.5">
          {isAr ? 'القبلة' : 'Qibla'}
        </p>
        <h1 className="text-[20px] text-foreground tracking-tight font-light leading-none">
          {isAr ? 'الكعبة المشرّفة' : 'The Holy Kaaba'}
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/40 border border-border/20">
          <Compass className="w-3 h-3 text-muted-foreground/60" strokeWidth={1.6} />
          <span className="text-[9.5px] text-muted-foreground/80 font-light tabular-nums">
            {isAr ? 'الاتجاه الحالي' : 'Heading'} ·{' '}
            <span ref={headingPillRef}>{heading !== null ? `${heading}°` : '—'}</span>
          </span>
        </div>
      </div>

      {/* Compass */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          {/* Soft aura */}
          <div
            ref={auraRef}
            className="absolute inset-[-50px] rounded-full pointer-events-none"
            style={{
              opacity: 0,
              background: 'radial-gradient(circle, hsl(var(--gold) / 0.45) 0%, hsl(var(--primary) / 0.15) 50%, transparent 78%)',
              filter: 'blur(34px)',
              willChange: 'opacity',
            }}
          />

          {/* Outer ring — gradient bezel */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 180deg, hsl(var(--gold) / 0.18), hsl(var(--border) / 0.5), hsl(var(--gold) / 0.12), hsl(var(--border) / 0.5), hsl(var(--gold) / 0.18))',
              padding: 1,
            }}
          >
            <div className="w-full h-full rounded-full bg-card" />
          </div>

          {/* Inner shadow ring */}
          <div
            className="absolute inset-[6px] rounded-full"
            style={{
              boxShadow: 'inset 0 1px 1px hsl(var(--background) / 0.8), inset 0 -10px 24px hsl(var(--foreground) / 0.04)',
            }}
          />

          {/* Rotating dial */}
          <div
            ref={dialWrapRef}
            className="absolute inset-0"
            style={{ transformOrigin: '50% 50%', willChange: 'transform' }}
          >
            {StaticDial}
            <QiblaPointer />
          </div>

          {/* Top fixed indicator */}
          <div className="absolute inset-x-0 -top-3 flex justify-center pointer-events-none">
            <div className="flex flex-col items-center">
              <div className="w-[2px] h-3 bg-gradient-to-b from-foreground/55 to-transparent rounded-full" />
              <svg width="14" height="10" viewBox="0 0 14 10" className="-mt-[1px]">
                <path d="M7 0 L13 9 H1 Z" fill="hsl(var(--foreground))" opacity="0.85" />
              </svg>
            </div>
          </div>

          {/* Centre hub — dual-ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="absolute inset-[-8px] rounded-full border border-gold/20" />
              <div
                ref={hubRef}
                className="w-3 h-3 rounded-full bg-gold border border-background"
                style={{ willChange: 'box-shadow' }}
              />
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="h-7 mt-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isAligned ? (
              <motion.div
                key="aligned"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-[11.5px] tracking-wide">
                  {isAr ? 'أنت تواجه القبلة' : 'Facing the Qibla'}
                </span>
              </motion.div>
            ) : compassActive && deviation !== null ? (
              <motion.div
                key="dev"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-muted-foreground/75"
              >
                <span className="w-1 h-1 rounded-full bg-gold/60" />
                <span className="text-[11px] tabular-nums font-light tracking-wide">
                  {isAr ? `الانحراف ${deviation}°` : `Off by ${deviation}°`}
                </span>
              </motion.div>
            ) : !compassActive ? (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] text-muted-foreground/55 font-light tracking-wide"
              >
                {isAr ? 'حرّك الجهاز قليلاً للمعايرة' : 'Move device to calibrate'}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats — three-column hairline row */}
      <div className="grid grid-cols-3 gap-2 mt-2 mb-2">
        <div className="rounded-2xl bg-card border border-border/20 px-3 py-3 text-center">
          <p className="text-[7.5px] text-muted-foreground/45 font-light tracking-[0.22em] uppercase mb-1">
            {isAr ? 'الاتجاه' : 'Bearing'}
          </p>
          <p className="text-[18px] text-foreground tracking-tight font-light tabular-nums leading-none">
            {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : '—'}
          </p>
        </div>
        <div className="rounded-2xl bg-card border border-border/20 px-3 py-3 text-center">
          <p className="text-[7.5px] text-muted-foreground/45 font-light tracking-[0.22em] uppercase mb-1">
            {isAr ? 'المسافة' : 'Distance'}
          </p>
          <p className="text-[18px] text-foreground tracking-tight font-light tabular-nums leading-none">
            {distanceToKaaba !== null ? distanceToKaaba.toLocaleString() : '—'}
            {distanceToKaaba !== null && (
              <span className="text-[9px] text-muted-foreground/45 ms-1 font-light">{isAr ? 'كم' : 'km'}</span>
            )}
          </p>
        </div>
        <div className="rounded-2xl bg-card border border-border/20 px-3 py-3 text-center">
          <p className="text-[7.5px] text-muted-foreground/45 font-light tracking-[0.22em] uppercase mb-1">
            {isAr ? 'الدقة' : 'Accuracy'}
          </p>
          <p className="text-[18px] text-foreground tracking-tight font-light tabular-nums leading-none">
            {gpsAccuracy !== null ? `±${Math.round(gpsAccuracy)}` : '—'}
            {gpsAccuracy !== null && (
              <span className="text-[9px] text-muted-foreground/45 ms-1 font-light">{isAr ? 'م' : 'm'}</span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[9px] text-muted-foreground/50 text-center mt-2 font-light">{error}</p>
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
