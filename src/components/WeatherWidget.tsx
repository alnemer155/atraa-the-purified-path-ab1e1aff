import { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = () => {
      let city = localStorage.getItem('atraa_weather_city') || '';
      if (!city && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchFromCity(`${pos.coords.latitude},${pos.coords.longitude}`),
          () => fetchFromCity('Qatif'),
          { enableHighAccuracy: true, timeout: 5000 }
        );
        return;
      }
      fetchFromCity(city || 'Qatif');
    };

    const fetchFromCity = (city: string) => {
      fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
        .then(res => res.json())
        .then(data => {
          if (data?.current_condition?.[0]) {
            const cc = data.current_condition[0];
            setWeather({
              temp: Math.round(parseFloat(cc.temp_C)),
              description: cc.lang_ar?.[0]?.value || cc.weatherDesc?.[0]?.value || '',
            });
          }
        })
        .catch(() => {});
    };

    fetchWeather();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'atraa_weather_city') fetchWeather();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-card border border-border/30">
      <div className="flex items-center gap-1.5 mb-2">
        <Cloud className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] text-muted-foreground font-medium">الطقس</span>
      </div>
      {weather ? (
        <>
          <p className="text-2xl font-bold text-foreground tracking-tight">{weather.temp}°</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{weather.description}</p>
        </>
      ) : (
        <div className="h-10 rounded-lg bg-secondary/60 animate-pulse" />
      )}
    </div>
  );
};

export default WeatherWidget;
