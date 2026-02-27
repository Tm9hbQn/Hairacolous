// weatherService.js — Fix #1
// Fetches REAL weather data from Open-Meteo (free, no API key required).
// Haifa coordinates: 32.794°N, 34.990°E
//
// Hourly variables are used for humidity and dew point so we can take
// the daily maximum (worst-case frizz risk) rather than a single moment.

const HAIFA_LAT  = 32.794;
const HAIFA_LON  = 34.9896;
const FORECAST_DAYS = 8; // today + 7 days (enough for daily + weekly views)

const buildOpenMeteoUrl = () => {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',       HAIFA_LAT);
  url.searchParams.set('longitude',      HAIFA_LON);
  url.searchParams.set('forecast_days',  FORECAST_DAYS);
  url.searchParams.set('timezone',       'Asia/Jerusalem');

  // Daily aggregates — provided directly
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'wind_speed_10m_max',
    'uv_index_max',
  ].join(','));

  // Hourly — used to derive daily-max humidity and dew point
  url.searchParams.set('hourly', [
    'relative_humidity_2m',
    'dew_point_2m',
  ].join(','));

  return url.toString();
};

// Given the hourly arrays and the list of daily dates, extract the per-day
// maximum humidity and maximum dew point (hours 06:00–21:00 only, to avoid
// nocturnal humidity spikes skewing the "daytime" risk assessment).
const aggregateHourlyToDaily = (hourlyTime, hourlyHumidity, hourlyDewPoint, dailyDates) => {
  return dailyDates.map((dateStr) => {
    // hourlyTime entries look like "2026-02-26T00:00" — take the date prefix
    const relevantIndices = hourlyTime.reduce((acc, t, i) => {
      const [date, timePart] = t.split('T');
      const hour = parseInt(timePart.split(':')[0], 10);
      if (date === dateStr && hour >= 6 && hour <= 21) acc.push(i);
      return acc;
    }, []);

    if (relevantIndices.length === 0) {
      // Fallback: use all hours for this date
      const allIndices = hourlyTime.reduce((acc, t, i) => {
        if (t.startsWith(dateStr)) acc.push(i);
        return acc;
      }, []);
      relevantIndices.push(...allIndices);
    }

    const maxHumidity = relevantIndices.length > 0
      ? Math.max(...relevantIndices.map(i => hourlyHumidity[i]))
      : 60;

    const maxDewPoint = relevantIndices.length > 0
      ? Math.max(...relevantIndices.map(i => hourlyDewPoint[i]))
      : 10;

    return { maxHumidity, maxDewPoint };
  });
};

// Returns an array of day objects, one per day from today (index 0) to today+7 (index 7).
// Each object: { date, temp, humidity, dewPoint, wind, uvIndex }
export const fetchRealWeather = async () => {
  const url = buildOpenMeteoUrl();
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const { daily, hourly } = json;

  const dailyMaxHumidDewPoint = aggregateHourlyToDaily(
    hourly.time,
    hourly.relative_humidity_2m,
    hourly.dew_point_2m,
    daily.time,
  );

  return daily.time.map((date, i) => ({
    date,                                                       // "YYYY-MM-DD"
    temp:     Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
    humidity: Math.round(dailyMaxHumidDewPoint[i].maxHumidity),
    dewPoint: Math.round(dailyMaxHumidDewPoint[i].maxDewPoint),
    wind:     Math.round(daily.wind_speed_10m_max[i]),
    uvIndex:  daily.uv_index_max[i] ?? 0,
  }));
};
