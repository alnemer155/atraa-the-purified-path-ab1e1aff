import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Thermometer } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

const getWeatherIcon = (icon: string) => {
  if (icon.includes('01')) return Sun;
  if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return Cloud;
  if (icon.includes('09')) return CloudDrizzle;
  if (icon.includes('10')) return CloudRain;
  if (icon.includes('11')) return CloudLightning;
  if (icon.includes('13')) return CloudSnow;
  return Thermometer;
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const city = localStorage.getItem('atraa_weather_city') || 'Qatif';
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},SA&units=metric&lang=ar&appid=0c06e4aa0b6e4f1d26fec4bfc tried`)
      .catch(() => {
        // Fallback: use a free weather API
        return fetch(`https://wttr.in/${city}?format=j1`);
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.current_condition) {
          setWeather({
            temp: Math.round(parseFloat(data.current_condition[0].temp_C)),
            description: data.current_condition[0].lang_ar?.[0]?.value || data.current_condition[0].weatherDesc[0].value,
            icon: '01d',
          });
        }
      })
      .catch(() => {});
  }, []);

  const Icon = weather ? getWeatherIcon(weather.icon) : Thermometer;

  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-card">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">الطقس</span>
      </div>
      {weather ? (
        <>
          <p className="text-2xl font-bold text-foreground">{weather.temp}°</p>
          <p className="text-xs text-muted-foreground mt-0.5">{weather.description}</p>
        </>
      ) : (
        <div className="h-10 rounded-lg bg-secondary animate-pulse" />
      )}
    </div>
  );
};

export default WeatherWidget;
