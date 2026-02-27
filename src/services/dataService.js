// dataService.js — Fixes #2 (date format), #7 (cache TTL/upsert), #15 (retry)
// Orchestrates: real weather → CONDITION_ID calculation → Gemini text → cache

import { supabase } from './supabaseClient';
import { fetchDailyInsight } from './geminiService';
import { fetchRealWeather } from './weatherService';
import { classifyCondition, computeWeeklyCondition, validateConditionId } from '../utils';
import { WEATHER_DATA } from '../data';

// ─── Fix #2: date format ─────────────────────────────────────────────────────
// Returns YYYY-MM-DD in Israel time zone. Previously returned DD/MM/YYYY,
// which caused every Supabase cache lookup to miss.
const getTodayDateString = () => {
  const now = new Date();
  // en-CA locale uses YYYY-MM-DD ordering — safest cross-environment approach
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Jerusalem',
  }).formatToParts(now);
  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;
  return `${y}-${m}-${d}`;
};

// ─── Fix #7: cache with TTL ───────────────────────────────────────────────────
const CACHE_TTL_HOURS = 6;

const loadFromCache = async (dateStr) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('daily_insights')
      .select('content, created_at')
      .eq('date', dateStr)
      .single();

    if (error || !data) return null;

    const ageHours = (Date.now() - new Date(data.created_at).getTime()) / 3_600_000;
    if (ageHours > CACHE_TTL_HOURS) {
      console.log(`Cache stale (${Math.round(ageHours)}h). Refreshing.`);
      return null;
    }

    console.log('Serving from Supabase cache.');
    return data.content;
  } catch (e) {
    console.warn('Cache read error (non-fatal):', e.message);
    return null;
  }
};

// ─── Fix #7 + #15: upsert with exponential-backoff retry ─────────────────────
const saveToCache = async (dateStr, content) => {
  if (!supabase) return;
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { error } = await supabase
        .from('daily_insights')
        .upsert(
          [{ date: dateStr, content, created_at: new Date().toISOString() }],
          { onConflict: 'date' },
        );
      if (!error) {
        console.log('Saved to Supabase cache.');
        return;
      }
      throw error;
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        const wait = 1000 * (attempt + 1);
        console.warn(`Cache write attempt ${attempt + 1} failed. Retrying in ${wait}ms.`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        console.warn('Cache write failed after retries (non-fatal):', e.message);
      }
    }
  }
};

// ─── Main entry point ─────────────────────────────────────────────────────────
export const getHairForecast = async () => {
  const today = getTodayDateString(); // always YYYY-MM-DD
  console.log(`Fetching forecast for ${today}`);

  // 1. Try cache first
  const cached = await loadFromCache(today);
  if (cached) return cached;

  // 2. No Gemini key → demo mode
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn('Gemini API key missing. Using demo data.');
    return { ...WEATHER_DATA, _isDemo: true };
  }

  try {
    // 3. Fetch REAL weather (Fix #1) — gracefully degrade if unavailable
    let periodsInput = null;
    try {
      const weatherDays = await fetchRealWeather();
      console.log(`Real weather fetched: ${weatherDays.length} days.`);

      // 4. Compute CONDITION_IDs in JS (Fix #4) — never delegate to Gemini
      const todayData    = {
        ...weatherDays[0],
        conditionId: classifyCondition(weatherDays[0].humidity, weatherDays[0].dewPoint, weatherDays[0].wind),
      };
      const tomorrowData = {
        ...weatherDays[1],
        conditionId: classifyCondition(weatherDays[1].humidity, weatherDays[1].dewPoint, weatherDays[1].wind),
      };
      const weekDays     = weatherDays.slice(2);
      const weekSummary  = computeWeeklyCondition(weekDays);

      periodsInput = { todayData, tomorrowData, weekSummary };
    } catch (weatherErr) {
      console.error('Weather API unavailable — Gemini will estimate conditions:', weatherErr.message);
      // periodsInput stays null; geminiService handles the null case
    }

    // 5. Ask Gemini for Hebrew text
    const generated = await fetchDailyInsight(periodsInput, today);

    // 6. Validate condition IDs Gemini echoed back (Fix #14)
    if (generated && generated.periods) {
      generated.periods.forEach(p => {
        if (p.weather_data) {
          p.weather_data.condition_id_detected = validateConditionId(
            p.weather_data.condition_id_detected,
          );
        }
      });
    }

    // 7. Persist to cache
    await saveToCache(today, generated);

    return generated;

  } catch (err) {
    console.error('Forecast pipeline failed. Using demo data.', err);
    return { ...WEATHER_DATA, _isDemo: true };
  }
};
