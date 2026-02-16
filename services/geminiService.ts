import { GoogleGenAI, Type } from "@google/genai";
import { Activity, ActivityType, Currency } from "../types";

// Helper to get AI instance safely
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateItinerarySuggestion = async (
  currentItinerary: Activity[],
  userPrompt: string
): Promise<Activity[] | null> => {
  const ai = getAIInstance();
  if (!ai) return null;

  const prompt = `
    You are a travel assistant for the "SoloTravel" app.
    The user wants to modify their itinerary based on this request: "${userPrompt}".
    
    Current Itinerary Context: ${JSON.stringify(currentItinerary.map(a => ({ time: a.time, title: a.title, type: a.type })))}

    Please return a JSON array of NEW or MODIFIED activities. 
    The response must strictly follow this schema.
    Maintain "quiet luxury" vibes in descriptions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Time in HH:MM format" },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(ActivityType) },
              priceEstimate: { type: Type.NUMBER },
              currency: { type: Type.STRING, enum: Object.values(Currency) }
            },
            required: ["time", "title", "description", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const parsed = JSON.parse(text);
    // Add IDs and defaults
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      isCompleted: false
    }));

  } catch (error) {
    console.error("Gemini Itinerary Error:", error);
    return null;
  }
};

export const parseExpenseFromText = async (text: string): Promise<Partial<any> | null> => {
    const ai = getAIInstance();
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
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
        if(!jsonText) return null;
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Gemini Expense Error", e);
        return null;
    }
}
