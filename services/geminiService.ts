
import { GoogleGenAI } from "@google/genai";
import { MealType, Location, RecommendationResponse, Restaurant } from "../types";

export const getRecommendations = async (
  mealType: MealType,
  radius: number,
  location: Location | null
): Promise<RecommendationResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const mealName = mealType === MealType.LUNCH ? '점심' : '저녁';
  const focus = mealType === MealType.LUNCH 
    ? '회전율이 빠르고 가성비가 좋으며, 오후 업무에 활력을 줄 수 있는 메뉴' 
    : '퇴근 후 동료와 술 한잔하기 좋거나, 하루의 피로를 풀어줄 수 있는 든든하고 분위기 있는 곳';

  const prompt = `
    당신은 20년 경력의 미식가이자 직장인들의 마음을 잘 아는 맛집 큐레이터입니다.
    현재 내 위치에서 ${radius}m 이내에 있는 ${mealName} 식당 5곳을 추천해주세요.
    
    [추천 가이드라인]
    1. ${focus} 위주로 선정해주세요.
    2. 각 식당이 왜 직장인에게 좋은지, 어떤 메뉴가 인기인지 한국어로 친절하고 전문적이게 설명해주세요.
    3. 답변 전체를 반드시 한국어로 작성해주세요.
    4. 식당 이름뿐만 아니라 그곳의 분위기나 특징(예: '혼밥하기 좋음', '웨이팅 주의', '양 많음')을 포함해주세요.
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
