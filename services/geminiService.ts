import { GoogleGenAI, Type } from "@google/genai";
import { Activity, ActivityType, Currency } from "../types";

// Helper to get AI instance safely
const getAIInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key missing - AI features will not work");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// List of models to try in order
const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-1.5-pro"];

// Fallback Mock Logic for Quota Errors
const getMockResponse = (userPrompt: string, currentDate: string): Activity[] => {
  console.warn("Using Mock Fallback due to API Quota/Error 🛡️");
  const lowercasePrompt = userPrompt.toLowerCase();

  // Simple heuristic for mock generation
  let type = ActivityType.SIGHTSEEING;
  if (lowercasePrompt.includes("eat") || lowercasePrompt.includes("dinner") || lowercasePrompt.includes("lunch")) type = ActivityType.FOOD;
  if (lowercasePrompt.includes("train") || lowercasePrompt.includes("bus") || lowercasePrompt.includes("go to")) type = ActivityType.TRANSPORT;
  if (lowercasePrompt.includes("hotel") || lowercasePrompt.includes("stay")) type = ActivityType.ACCOMMODATION;

  return [{
    id: `mock-${Math.random().toString(36).substr(2, 5)}`,
    date: currentDate,
    time: "19:00",
    title: userPrompt.length > 30 ? userPrompt.substring(0, 27) + "..." : userPrompt,
    description: `[Mocked] Based on your request: "${userPrompt}". Our AI is currently resting, but we've added this for you!`,
    type: type,
    isCompleted: false,
    priceEstimate: 1000,
    currency: Currency.JPY,
    images: []
  }];
};

export const generateItinerarySuggestion = async (
  currentItinerary: Activity[],
  userPrompt: string,
  currentDate: string
): Promise<Activity[] | null> => {
  const ai = getAIInstance();
  if (!ai) return getMockResponse(userPrompt, currentDate);

  const prompt = `
    You are a travel assistant for the "SoloTravel" app.
    Today is ${currentDate}.
    The user wants to modify their itinerary based on this request: "${userPrompt}".
    
    Current Itinerary Context: ${JSON.stringify(currentItinerary.map(a => ({ date: a.date, time: a.time, title: a.title, type: a.type })))}

    Please return a JSON array of NEW or MODIFIED activities. 
    The response must strictly follow this schema.
    IMPORTANT: You MUST provide a "date" for each activity (YYYY-MM-DD). If the user says "today", use ${currentDate}.
    If the user doesn't specify a date, infer it from the context or use the date of the most relevant existing activity.
    Maintain "quiet luxury" vibes in descriptions.
  `;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                time: { type: Type.STRING, description: "Time in HH:MM format" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING, enum: Object.values(ActivityType) },
                priceEstimate: { type: Type.NUMBER },
                currency: { type: Type.STRING, enum: Object.values(Currency) }
              },
              required: ["date", "time", "title", "description", "type"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return parsed.map((item: any) => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          isCompleted: false
        }));
      }
    } catch (error: any) {
      console.error(`Gemini Error with ${modelName}:`, error.message || error);
      if (error.message?.includes("429") || error.message?.includes("404") || error.message?.includes("quota")) {
        continue;
      }
      break;
    }
  }

  // Final Fallback
  return getMockResponse(userPrompt, currentDate);
};

export const parseExpenseFromText = async (text: string): Promise<Partial<any> | null> => {
  const ai = getAIInstance();
  if (!ai) return null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Trying model for expense parsing: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Extract expense details from this text: "${text}". If currency is not specified, guess based on context or default to USD. Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              currency: { type: Type.STRING, enum: Object.values(Currency) },
              category: { type: Type.STRING, enum: Object.values(ActivityType) },
              description: { type: Type.STRING }
            },
            required: ["amount", "description"]
          }
        }
      });

      const jsonText = response.text;
      if (jsonText) return JSON.parse(jsonText);
    } catch (e: any) {
      console.error(`Gemini Expense Error with ${modelName}:`, e.message || e);
      if (e.message?.includes("429") || e.message?.includes("404") || e.message?.includes("quota")) continue;
      break;
    }
  }
  return null;
}
