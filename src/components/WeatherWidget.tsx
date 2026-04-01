import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  code: number;
}

const getWeatherIcon = (code: number) => {
  if (code >= 300) return CloudRain;
  if (code >= 200) return Cloud;
  return Sun;
};

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
              code: parseInt(cc.weatherCode) || 0,
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

  const Icon = weather ? getWeatherIcon(weather.code) : Cloud;

  return (
    <div className="rounded-2xl glass-card p-4 min-h-[110px] flex flex-col justify-between relative overflow-hidden">
      {/* Subtle decorative circle */}
      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
      
      <div className="flex items-center justify-between mb-3 relative">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">الطقس</span>
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary/70" />
        </div>
      </div>
      {weather ? (
        <div className="relative">
          <div className="flex items-baseline gap-0.5">
            <p className="text-4xl font-bold text-foreground tracking-tighter leading-none">{weather.temp}</p>
            <span className="text-lg font-semibold text-muted-foreground/50">°</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 line-clamp-1 font-medium">{weather.description}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="h-9 w-16 rounded-xl bg-secondary/50 animate-pulse" />
          <div className="h-3 w-20 rounded-lg bg-secondary/30 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
