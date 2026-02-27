// geminiService.js — Fix #1 (receives real weather data instead of hallucinating)
// Gemini's job is ONLY text generation from the content library.
// Condition classification is done in JS (classifyCondition in utils.js).

import { GoogleGenerativeAI } from "@google/generative-ai";
import promptText from '../assets/prompt.txt?raw';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

// Converts "YYYY-MM-DD" → "DD/MM/YYYY" for display in the output JSON
const toDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

// Builds the weather context block prepended to the prompt.
// periodsInput: { todayData, tomorrowData, weekSummary } | null
const buildWeatherContext = (periodsInput, todayIso) => {
  if (!periodsInput) {
    return (
      `Today's date: ${todayIso}.\n` +
      `Real-time weather data is unavailable. Estimate typical Haifa weather ` +
      `for this season and compute the CONDITION_ID yourself using the algorithm ` +
      `in the prompt below.`
    );
  }

  const { todayData, tomorrowData, weekSummary } = periodsInput;

  const row = (label, d) =>
    `${label}: Date=${toDisplayDate(d.date)} Temp=${d.temp}°C ` +
    `Humidity=${d.humidity}% DewPoint=${d.dewPoint}°C ` +
    `Wind=${d.wind}km/h UV=${d.uvIndex} CONDITION_ID=${d.conditionId}`;

  return [
    '=== REAL WEATHER DATA (Open-Meteo API) ===',
    'CONDITION_IDs were computed by a deterministic JS algorithm.',
    'DO NOT recalculate or override them. Use them to look up the content library below.',
    '',
    row('TODAY    ', todayData),
    row('TOMORROW ', tomorrowData),
    '',
    `WEEKLY: DominantCondition=${weekSummary.conditionId} ` +
    `AvgTemp=${weekSummary.temp}°C AvgHumidity=${weekSummary.humidity}% ` +
    `AvgWind=${weekSummary.wind}km/h MaxUV=${weekSummary.uvIndex}`,
    '=== END WEATHER DATA ===',
  ].join('\n');
};

// periodsInput: { todayData, tomorrowData, weekSummary } | null (degraded mode)
// todayIso: "YYYY-MM-DD"
export const fetchDailyInsight = async (periodsInput, todayIso) => {
  if (!genAI) {
    throw new Error("Gemini API Key is missing");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const weatherContext = buildWeatherContext(periodsInput, todayIso);
  const fullPrompt = `${weatherContext}\n\n${promptText}`;

  try {
    const result   = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text     = response.text();

    // Strip optional markdown code fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in Gemini response");
    }

    const data = JSON.parse(jsonMatch[0]);

    if (!data.periods || !Array.isArray(data.periods)) {
      throw new Error("Invalid response structure: missing 'periods' array");
    }

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
