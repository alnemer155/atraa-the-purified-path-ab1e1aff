import { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WeatherData {
  temp: number;
  description: string;
  code: number;
  windKph: number;
  windDir: number; // degrees, meteorological (0 = wind from N)
}

const WeatherWidget = () => {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchFromCoords = (lat: number, lng: number) => {
      fetch(`https://wttr.in/${lat},${lng}?format=j1`)
        .then(res => res.json())
        .then(data => {
          if (data?.current_condition?.[0]) {
            const cc = data.current_condition[0];
            const desc = i18n.language === 'ar'
              ? cc.lang_ar?.[0]?.value || cc.weatherDesc?.[0]?.value || ''
              : cc.weatherDesc?.[0]?.value || '';
            setWeather({
              temp: Math.round(parseFloat(cc.temp_C)),
              description: desc,
              code: parseInt(cc.weatherCode) || 0,
              windKph: Math.round(parseFloat(cc.windspeedKmph) || 0),
              windDir: parseInt(cc.winddirDegree) || 0,
            });
          }
        })
        .catch(() => {
          setWeather({ temp: 0, description: '—', code: 0, windKph: 0, windDir: 0 });
        });
    };

    const load = () => {
      try {
        const raw = localStorage.getItem('atraa_city_coords');
        if (raw) {
          const c = JSON.parse(raw);
          fetchFromCoords(c.lat, c.lng);
          return;
        }
      } catch { /* ignore */ }
      fetchFromCoords(26.5196, 50.0115);
    };

    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'atraa_city_coords') load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [i18n.language]);

  // Convert "wind FROM" direction to "wind TO" direction (arrow points where wind is going)
  // Lucide Navigation arrow points up (north) by default = 0deg, clockwise.
  const arrowRotation = weather ? (weather.windDir + 180) % 360 : 0;

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-3.5 min-h-[100px] flex flex-col justify-between shadow-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground font-medium">{t('home.weather')}</span>
        {weather && (
          <div className="flex items-center gap-1 text-muted-foreground/60">
            <Navigation
              className="w-3 h-3 text-primary/70"
              strokeWidth={1.5}
              style={{ transform: `rotate(${arrowRotation}deg)`, transition: 'transform 0.4s ease-out' }}
            />
            <span className="text-[9px] tabular-nums font-light">{weather.windKph}</span>
          </div>
        )}
      </div>
      {weather ? (
        <div>
          <div className="flex items-baseline gap-0.5">
            <p className="text-3xl text-foreground tracking-tighter leading-none font-semibold">{weather.temp}</p>
            <span className="text-base text-muted-foreground/50">°</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">{weather.description}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-8 w-14 rounded-lg bg-secondary/50 animate-pulse" />
          <div className="h-2.5 w-16 rounded-md bg-secondary/40 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
