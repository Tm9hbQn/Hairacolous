import { GoogleGenerativeAI } from "@google/generative-ai";
import promptText from '../assets/prompt.txt?raw';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export const fetchDailyInsight = async (dateStr) => {
  if (!genAI) {
    throw new Error("Gemini API Key is missing");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Prepend current date context to the prompt
  const fullPrompt = `Today is ${dateStr}. \n\n${promptText}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonString = jsonMatch[0];
    const data = JSON.parse(jsonString);

    // Basic validation
    if (!data.periods || !Array.isArray(data.periods)) {
      throw new Error("Invalid JSON structure: missing 'periods' array");
    }

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
