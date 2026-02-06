
import { GoogleGenAI } from "@google/genai";
import { MealType, Location, RecommendationResponse, Restaurant } from "../types";

export const getRecommendations = async (
  mealType: MealType,
  radius: number,
  location: Location | null
): Promise<RecommendationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    I am an office worker looking for ${mealType === MealType.LUNCH ? 'Lunch' : 'Dinner'} options.
    Please recommend 5 specific and popular restaurants within ${radius}m of my current location.
    ${mealType === MealType.LUNCH ? 'Focus on quick, satisfying, and relatively affordable options suitable for a work lunch.' : 'Focus on good places for social dinners, potentially with drinks, or hearty meals.'}
    Provide a brief, appetizing summary for each.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? {
              latitude: location.latitude,
              longitude: location.longitude
            } : undefined
          }
        }
      },
    });

    const text = response.text || "추천 정보를 가져오는 데 실패했습니다.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const restaurants: Restaurant[] = chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri,
        description: chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0] || ""
      }));

    return {
      text,
      restaurants
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
