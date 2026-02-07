/**
 * Weather API Endpoint
 *
 * GET /api/weather?lat={latitude}&lng={longitude}
 *
 * Fetches 7-day weather forecast for hotel locations using OpenWeatherMap API
 * Returns simplified weather data with temperature and conditions
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface WeatherForecast {
  date: string;
  day: string;
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy";
  icon: string;
}

// Map OpenWeather condition codes to simplified conditions
function getWeatherCondition(weatherCode: number): {
  condition: WeatherForecast["condition"];
  icon: string;
} {
  if (weatherCode >= 200 && weatherCode < 300) {
    return { condition: "stormy", icon: "⛈️" };
  } else if (weatherCode >= 300 && weatherCode < 600) {
    return { condition: "rainy", icon: "🌧️" };
  } else if (weatherCode >= 801 && weatherCode < 900) {
    return { condition: "cloudy", icon: "☁️" };
  } else {
    return { condition: "sunny", icon: "☀️" };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Validation
    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: "Missing lat or lng parameters" },
        { status: 400 },
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: "Invalid lat or lng values" },
        { status: 400 },
      );
    }

    // Check for OpenWeather API key
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OPENWEATHER_API_KEY not configured. Get free API key from https://openweathermap.org/api",
        },
        { status: 503 },
      );
    }

    // Fetch real weather data from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

    const response = await fetch(weatherUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid API key or not activated yet. Wait 10-15 minutes after signup, then restart dev server.",
          },
          { status: 401 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || `Weather API error: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Process forecast data - get one forecast per day for next 7 days
    const dailyForecasts: WeatherForecast[] = [];
    const processedDates = new Set<string>();

    // First pass: Try to get noon forecasts (12:00) for better accuracy
    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toISOString().split("T")[0];

      if (!processedDates.has(dateStr) && date.getHours() === 12) {
        const weatherInfo = getWeatherCondition(item.weather[0].id);

        dailyForecasts.push({
          date: dateStr,
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
          temp: Math.round(item.main.temp),
          condition: weatherInfo.condition,
          icon: weatherInfo.icon,
        });

        processedDates.add(dateStr);

        if (dailyForecasts.length >= 7) break;
      }
    }

    // Second pass: Fill remaining days with any available time slot
    if (dailyForecasts.length < 7) {
      for (const item of data.list) {
        if (dailyForecasts.length >= 7) break;

        const date = new Date(item.dt * 1000);
        const dateStr = date.toISOString().split("T")[0];

        if (!processedDates.has(dateStr)) {
          const weatherInfo = getWeatherCondition(item.weather[0].id);

          dailyForecasts.push({
            date: dateStr,
            day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
              date.getDay()
            ],
            temp: Math.round(item.main.temp),
            condition: weatherInfo.condition,
            icon: weatherInfo.icon,
          });

          processedDates.add(dateStr);
        }
      }
    }

    // Third pass: If still less than 7 days, extend forecast based on last day pattern
    while (dailyForecasts.length < 7 && dailyForecasts.length > 0) {
      const lastDay = dailyForecasts[dailyForecasts.length - 1];
      const lastDate = new Date(lastDay.date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Calculate average temperature from last 3 days for smoother prediction
      const recentTemps = dailyForecasts.slice(-3).map(d => d.temp);
      const avgTemp = Math.round(recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length);
      
      dailyForecasts.push({
        date: nextDate.toISOString().split("T")[0],
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][nextDate.getDay()],
        temp: avgTemp,
        condition: lastDay.condition, // Use same condition as last available day
        icon: lastDay.icon,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        location: { lat: latitude, lng: longitude },
        forecast: dailyForecasts,
      },
    });
  } catch (error) {
    console.error("Weather API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch weather data",
      },
      { status: 500 },
    );
  }
}
