"use client";

import { useEffect, useState } from "react";
import { Sun, CloudRain, Cloud, CloudDrizzle } from "lucide-react";

interface WeatherData {
  date: string;
  day: string;
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy";
  icon: string;
}

interface WeatherForecastProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export function WeatherForecast({
  latitude,
  longitude,
  className = "",
}: WeatherForecastProps) {
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchWeather() {
      if (!latitude || !longitude) {
        setError("Location data not available");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/weather?lat=${latitude}&lng=${longitude}`,
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to fetch weather");
        }

        setForecast(result.data.forecast);
        setError("");
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load weather");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [latitude, longitude]);

  const getWeatherIcon = (condition: WeatherData["condition"]) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-6 h-6 text-orange-400 mx-auto mb-1" />;
      case "rainy":
        return <CloudRain className="w-6 h-6 text-blue-400 mx-auto mb-1" />;
      case "cloudy":
        return <Cloud className="w-6 h-6 text-gray-400 mx-auto mb-1" />;
      case "stormy":
        return <CloudDrizzle className="w-6 h-6 text-blue-600 mx-auto mb-1" />;
      default:
        return <Sun className="w-6 h-6 text-orange-400 mx-auto mb-1" />;
    }
  };

  const getDateRange = () => {
    if (forecast.length === 0) return "";
    const firstDate = new Date(forecast[0].date);
    const lastDate = new Date(forecast[forecast.length - 1].date);
    return `${firstDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  if (loading) {
    return (
      <div
        className={`bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/30 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
            <Sun className="w-5 h-5 text-orange-500" />
            Weather Forecast
          </h4>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || forecast.length === 0) {
    return (
      <div
        className={`bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/30 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
            <Sun className="w-5 h-5 text-orange-500" />
            Weather Forecast
          </h4>
        </div>
        <p className="text-sm text-slate-500 text-center py-4">
          {error || "Weather data unavailable"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/30 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <Sun className="w-5 h-5 text-orange-500" />
          Weather Forecast
        </h4>
        <span className="text-xs font-bold bg-white dark:bg-blue-900/50 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300">
          {getDateRange()}
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 bg-white/60 dark:bg-black/20 rounded-xl p-4">
        {forecast.map((day, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">{day.day}</p>
            {getWeatherIcon(day.condition)}
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {day.temp}°
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
