import { useState, useEffect, useCallback, useRef } from 'react';
import { Compass, Navigation } from 'lucide-react';
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

const QiblaPage = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState('');
  const [compassActive, setCompassActive] = useState(false);
  const headingRef = useRef(0);
  const smoothingFactor = 0.15;

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setQiblaDirection(calculateQibla(pos.coords.latitude, pos.coords.longitude));
        },
        () => {
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

    // Use webkitCompassHeading on iOS for true north
    // @ts-ignore
    if (e.webkitCompassHeading !== undefined) {
      // @ts-ignore
      alpha = e.webkitCompassHeading;
    } else {
      alpha = 360 - alpha;
    }

    // Smooth heading with exponential moving average
    let diff = alpha - headingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    headingRef.current = (headingRef.current + diff * smoothingFactor + 360) % 360;
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

  return (
    <div className="px-4 py-6 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground mb-1 text-center">اتجاه القبلة</h1>
      <p className="text-sm text-muted-foreground text-center mb-8">نحو بيت الله الحرام</p>

      <div className="flex justify-center mb-8">
        <div className="relative w-72 h-72">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-border bg-card shadow-elevated" />
          {/* Inner ring */}
          <div className="absolute inset-5 rounded-full border border-primary/10" />
          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 flex justify-center"
              style={{ transform: `rotate(${i * 10}deg)` }}
            >
              <div className={`w-0.5 rounded-full ${i % 9 === 0 ? 'h-3 bg-primary/60' : 'h-1.5 bg-border'}`} />
            </div>
          ))}

          {/* Qibla arrow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          >
            <div className="flex flex-col items-center">
              <Navigation className="w-5 h-5 text-primary fill-primary -mb-1" />
              <div className="w-0.5 h-[88px] islamic-gradient rounded-full" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mt-0.5" />
            </div>
          </motion.div>

          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full islamic-gradient flex items-center justify-center shadow-card">
              <Compass className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>

          {/* Cardinal directions */}
          <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-primary">ش</span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">ج</span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">شر</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">غر</span>
        </div>
      </div>

      {qiblaDirection !== null && (
        <div className="text-center space-y-1 mb-6">
          <p className="text-2xl font-bold text-primary">{Math.round(qiblaDirection)}°</p>
          <p className="text-sm text-muted-foreground">اتجاه القبلة</p>
        </div>
      )}

      {error && <p className="text-xs text-muted-foreground text-center mb-4">{error}</p>}

      {!compassActive && (
        <button
          onClick={requestPermission}
          className="mx-auto block px-6 py-2.5 rounded-xl islamic-gradient text-primary-foreground text-sm font-medium shadow-card"
        >
          تفعيل البوصلة
        </button>
      )}
    </div>
  );
};

export default QiblaPage;
