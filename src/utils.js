// ─── Gradient mapping (Fix #5) ───────────────────────────────────────────────
// Returns Tailwind from/via/to colour stops — used by Background.jsx
export const getGradientClass = (conditionId) => {
  switch (conditionId) {
    case 'SAUNA_STORM':  return 'from-slate-700 via-purple-700 to-slate-800';
    case 'SAUNA_CALM':   return 'from-teal-500 via-cyan-600 to-blue-700';
    case 'DESERT_STORM': return 'from-orange-600 via-amber-500 to-red-600';
    case 'DESERT_CALM':  return 'from-amber-400 via-yellow-400 to-orange-400';
    case 'PERFECT_DAY':  return 'from-sky-400 via-purple-400 to-pink-400';
    default:             return 'from-sky-400 via-purple-400 to-pink-400';
  }
};

// ─── Dose level detection (Fix #3) ───────────────────────────────────────────
// CRITICAL ORDER: check negations BEFORE positive keywords.
// "לא חובה" contains "חובה" — checking 'high' first would misclassify it.
export const getDoseLevel = (text) => {
  if (!text) return 'normal';
  const t = text.toLowerCase();

  // 1. Negation / skip patterns — checked FIRST so they override everything
  const nonePatterns = [
    'לא צריך', 'לא היום', 'לא חובה', 'לא חייב',
    'לוותר', 'אפשר לוותר', 'אין צורך', 'none', 'skip',
  ];
  if (nonePatterns.some(p => t.includes(p))) return 'none';

  // 2. Low-dose markers
  const lowPatterns = ['טיפה', 'מעט', 'קליל', 'דק', 'עדין', 'ממש מעט', 'רק אם'];
  if (lowPatterns.some(p => t.includes(p))) return 'low';

  // 3. High-dose markers (only reached if no negation matched above)
  const highPatterns = ['בנדיבות', 'להעמיס', 'חובה', 'הרבה', 'חזק', 'מלא'];
  if (highPatterns.some(p => t.includes(p))) return 'high';

  return 'normal';
};

// ─── CONDITION_ID computation (Fix #4) ───────────────────────────────────────
// Must be called with REAL weather data — never delegate this logic to Gemini.
// humidity: number (%), dewPoint: number (°C), windSpeed: number (km/h)
export const classifyCondition = (humidity, dewPoint, windSpeed) => {
  const isHumid = dewPoint > 16 || humidity > 65;
  const isDry   = dewPoint < 5  || humidity < 35;
  const isWindy = windSpeed > 18;

  if (isHumid && isWindy)  return 'SAUNA_STORM';
  if (isHumid && !isWindy) return 'SAUNA_CALM';
  if (isDry   && isWindy)  return 'DESERT_STORM';
  if (isDry   && !isWindy) return 'DESERT_CALM';
  return 'PERFECT_DAY';
};

// ─── Weekly condition aggregation (Fix #11) ──────────────────────────────────
// dailyPeriods: array of { humidity, dewPoint, wind, temp, uvIndex }
// Returns the dominant CONDITION_ID for the week + aggregated weather stats
export const computeWeeklyCondition = (dailyPeriods) => {
  if (!dailyPeriods || dailyPeriods.length === 0) return null;

  const counts = {};
  for (const day of dailyPeriods) {
    const cond = classifyCondition(day.humidity, day.dewPoint, day.wind);
    counts[cond] = (counts[cond] || 0) + 1;
  }

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const avg = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);

  return {
    conditionId: dominant,
    temp:      avg(dailyPeriods.map(d => d.temp)),
    humidity:  avg(dailyPeriods.map(d => d.humidity)),
    wind:      avg(dailyPeriods.map(d => d.wind)),
    uvIndex:   Math.max(...dailyPeriods.map(d => d.uvIndex)),
  };
};

// ─── CONDITION_ID validation (Fix #14) ───────────────────────────────────────
const VALID_CONDITIONS = new Set([
  'SAUNA_STORM', 'SAUNA_CALM', 'DESERT_STORM', 'DESERT_CALM', 'PERFECT_DAY',
]);

export const validateConditionId = (id) => {
  if (VALID_CONDITIONS.has(id)) return id;
  console.warn(`Unknown condition_id: "${id}". Defaulting to PERFECT_DAY.`);
  return 'PERFECT_DAY';
};

// ─── Wind / numeric value parsing (Fix #12) ──────────────────────────────────
// Safely extracts the first number from a string like "22 km/h" or "22.5"
export const parseNumericValue = (str, fallback = 0) => {
  if (str == null) return fallback;
  const match = String(str).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : fallback;
};

// ─── Product icon & label helpers (unchanged) ────────────────────────────────
export const getProductIconKey = (key) => {
  const map = {
    shampoo: 'droplet',
    conditioner: 'wind',
    mask: 'sparkles',
    leave_in: 'cloud',
    gel: 'shield',
    oil: 'star',
    styling_tip: 'lightbulb',
    water_refresh: 'spray',
    product_mix: 'shuffle',
    protection: 'shield_check',
  };
  return map[key] || 'sparkles';
};

export const getProductLabel = (key) => {
  const map = {
    shampoo: 'שמפו',
    conditioner: 'מרכך',
    mask: 'מסכה',
    leave_in: 'ליב-אין',
    gel: "ג'ל/מוס",
    oil: 'שמן/סרום',
    styling_tip: 'טיפ',
    water_refresh: 'רענון מים',
    product_mix: 'מיקס חומרים',
    protection: 'הגנה',
  };
  return map[key] || key;
};
