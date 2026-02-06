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
    ? '회전율이 빠르고 가성비가 좋으며, 직장인 점심시간(1시간) 내에 충분히 즐길 수 있는 메뉴' 
    : '퇴근 후 동료와 스트레스를 풀기 좋은 회식 장소나, 분위기 있는 데이트/모임 장소';

  // Current location context string
  const locationContext = location 
    ? `현재 위도: ${location.latitude}, 경도: ${location.longitude}`
    : "서울 중심가";

  const prompt = `
    당신은 대한민국 최고의 맛집 가이드이자 직장인들의 점심/저녁 고민을 해결해주는 전문가입니다.
    현재 위치(${locationContext})를 기준으로 약 ${radius}m 반경 내에 있는 ${mealName} 식당 5곳을 엄선해 추천해주세요.
    
    [추천 조건]
    1. ${focus} 위주로 선정할 것.
    2. 구글 검색을 통해 최신 리뷰와 인기도를 반영할 것.
    3. 추천 코멘트는 한국어로 작성하며, 직장인들이 공감할 수 있는 포인트(가성비, 맛, 분위기, 대기 시간 등)를 포함할 것.
    
    [답변 형식]
    - 각 식당의 특징을 '맛점 포인트' 또는 '맛저 포인트'라는 이름으로 친절하게 설명해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // 최신 Gemini 3 모델로 변경
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Gemini 3에 최적화된 검색 도구 사용
      },
    });

    const text = response.text || "추천 정보를 생성하지 못했습니다.";
    
    // Google Search Grounding 결과 처리
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const restaurants: Restaurant[] = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
        description: "최신 검색 결과에서 추천된 장소입니다."
      }));

    return {
      text,
      restaurants
    };
  } catch (error) {
    console.error("Gemini 3 API Error:", error);
    throw error;
  }
};
