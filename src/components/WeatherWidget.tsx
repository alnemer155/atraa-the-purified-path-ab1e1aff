import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const city = localStorage.getItem('atraa_weather_city') || 'Qatif';
    fetch(`https://wttr.in/${city}?format=j1`)
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
  }, []);

  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-1.5">
        <Thermometer className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">الطقس</span>
      </div>
      {weather ? (
        <>
          <p className="text-2xl font-bold text-foreground">{weather.temp}°</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{weather.description}</p>
        </>
      ) : (
        <div className="h-10 rounded-lg bg-secondary animate-pulse" />
      )}
    </div>
  );
};

export default WeatherWidget;
