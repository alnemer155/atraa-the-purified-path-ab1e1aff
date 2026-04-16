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
        .catch(() => {
          setWeather({ temp: 0, description: 'غير متوفر', code: 0 });
        });
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
    <div className="rounded-2xl bg-card border border-border/20 p-3.5 min-h-[100px] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] text-muted-foreground/40 tracking-widest font-light">الطقس</span>
        <Icon className="w-3.5 h-3.5 text-muted-foreground/25" />
      </div>
      {weather ? (
        <div>
          <div className="flex items-baseline gap-0.5">
            <p className="text-3xl text-foreground tracking-tighter leading-none font-light">{weather.temp}</p>
            <span className="text-base text-muted-foreground/30 font-light">°</span>
          </div>
          <p className="text-[9px] text-muted-foreground/40 mt-1.5 line-clamp-1 font-light">{weather.description}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-8 w-14 rounded-lg bg-secondary/30 animate-pulse" />
          <div className="h-2.5 w-16 rounded-md bg-secondary/20 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
