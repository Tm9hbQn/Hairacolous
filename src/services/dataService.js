import { supabase } from './supabaseClient';
import { fetchDailyInsight } from './geminiService';
import { WEATHER_DATA } from '../data';

const getTodayDateString = () => {
  // Use Israel Time Zone to ensure consistency regardless of user location
  const date = new Date();
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  };
  // toLocaleDateString returns DD/MM/YYYY with he-IL locale usually, but let's be explicit
  // Actually, simplest is to just get the parts in that timezone
  const formatter = new Intl.DateTimeFormat('en-GB', options); // en-GB uses DD/MM/YYYY
  return formatter.format(date);
};

export const getHairForecast = async () => {
  try {
    const today = getTodayDateString();
    console.log(`Checking for data for date: ${today}`);

    // 1. Check if Supabase is configured
    if (!supabase) {
      console.warn("Supabase not configured. Using demo data.");
      return WEATHER_DATA;
    }

    // 2. Check Supabase for today's data
    const { data: existingData, error: dbError } = await supabase
      .from('daily_insights')
      .select('content')
      .eq('date', today)
      .single();

    if (existingData) {
      console.log("Data found in Supabase.");
      return existingData.content;
    }

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.error("Supabase error:", dbError);
      // If DB error (not just missing), we might want to fall back or try fetching fresh?
      // Let's try fetching fresh as fallback if it's just a read error, or maybe just proceed.
    }

    // 3. Data not found in DB, fetch from Gemini
    console.log("Data not found in Supabase. Fetching from Gemini...");

    // Check if Gemini Key is present
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.warn("Gemini API Key missing. Using demo data.");
        return WEATHER_DATA;
    }

    const generatedData = await fetchDailyInsight(today);

    // 4. Save to Supabase
    const { error: insertError } = await supabase
      .from('daily_insights')
      .insert([
        { date: today, content: generatedData }
      ]);

    if (insertError) {
      console.error("Error saving to Supabase:", insertError);
      // We still return the data even if save failed
    } else {
        console.log("Data saved to Supabase.");
    }

    return generatedData;

  } catch (error) {
    console.error("Error in getHairForecast:", error);
    throw error; // Propagate to UI for error handling
  }
};
