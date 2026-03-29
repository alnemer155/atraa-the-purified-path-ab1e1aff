import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  humidity?: string;
  windSpeed?: string;
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
              humidity: cc.humidity,
              windSpeed: cc.windspeedKmph,
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
    <div className="rounded-2xl glass-card p-4 min-h-[100px] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] text-muted-foreground font-semibold tracking-wide">الطقس</span>
        <Cloud className="w-4 h-4 text-primary/60" />
      </div>
      {weather ? (
        <div>
          <p className="text-3xl font-bold text-foreground tracking-tighter leading-none">{weather.temp}°</p>
          <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1 font-medium">{weather.description}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-8 w-16 rounded-lg bg-secondary/60 animate-pulse" />
          <div className="h-3 w-20 rounded bg-secondary/40 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
