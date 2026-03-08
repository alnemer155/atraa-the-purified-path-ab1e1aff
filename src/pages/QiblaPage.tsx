import { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const QiblaPage = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Calculate Qibla direction from coordinates
  const calculateQibla = (lat: number, lng: number): number => {
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLatRad = (kaabaLat * Math.PI) / 180;
    const kaabaLngRad = (kaabaLng * Math.PI) / 180;
    
    const dLng = kaabaLngRad - lngRad;
    const x = Math.sin(dLng);
    const y = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(dLng);
    
    let direction = (Math.atan2(x, y) * 180) / Math.PI;
    if (direction < 0) direction += 360;
    return direction;
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dir = calculateQibla(pos.coords.latitude, pos.coords.longitude);
          setQiblaDirection(dir);
          setPermissionGranted(true);
        },
        () => {
          // Default to Qatif area
          const dir = calculateQibla(26.4207, 50.0888);
          setQiblaDirection(dir);
          setError('تم استخدام الموقع الافتراضي');
        }
      );
    }

    // Try compass
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setHeading(e.alpha);
      }
    };

    if ('DeviceOrientationEvent' in window) {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS requires permission
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestPermission = async () => {
    try {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
            if (e.alpha !== null) setHeading(e.alpha);
          });
        }
      }
    } catch {}
  };

  const rotation = qiblaDirection !== null ? qiblaDirection - heading : 0;

  return (
    <div className="px-4 py-6 animate-fade-in">
      <h1 className="text-xl font-semibold text-foreground mb-2 text-center">اتجاه القبلة</h1>
      <p className="text-sm text-muted-foreground text-center mb-8">نحو بيت الله الحرام</p>

      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          {/* Compass circle */}
          <div className="absolute inset-0 rounded-full border-2 border-border bg-card shadow-elevated" />
          
          {/* Direction markers */}
          <div className="absolute inset-4 rounded-full border border-primary/20" />
          
          {/* Qibla arrow */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="flex flex-col items-center">
              <div className="w-1 h-24 islamic-gradient rounded-full" />
              <div className="w-4 h-4 rounded-full bg-primary shadow-lg -mt-1" />
            </div>
          </div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full islamic-gradient flex items-center justify-center shadow-card">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          {/* Cardinal directions */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-primary">N</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">S</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">E</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">W</span>
        </div>
      </div>

      {qiblaDirection !== null && (
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-primary">{Math.round(qiblaDirection)}°</p>
          <p className="text-sm text-muted-foreground">اتجاه القبلة</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-muted-foreground text-center mt-4">{error}</p>
      )}

      <button
        onClick={requestPermission}
        className="mt-6 mx-auto block px-6 py-2.5 rounded-xl islamic-gradient text-primary-foreground text-sm font-medium shadow-card"
      >
        تفعيل البوصلة
      </button>
    </div>
  );
};

export default QiblaPage;
