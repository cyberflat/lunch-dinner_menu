
import { GoogleGenAI, Type } from "@google/genai";
import { MealType, Location, RecommendationResponse, Restaurant } from "../types";

export const getRecommendations = async (
  mealType: MealType,
  radius: number,
  location: Location | null
): Promise<RecommendationResponse> => {
  // 생성 시점에 새로운 인스턴스 생성 (최신 키 반영 보장)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const mealName = mealType === MealType.LUNCH ? '점심' : '저녁';
  const locationContext = location 
    ? `좌표: ${location.latitude}, ${location.longitude}`
    : "서울 주요 업무지구";

  const prompt = `
    당신은 직장인들의 식사 고민을 해결하는 20년 경력의 맛집 큐레이터입니다.
    현재 위치(${locationContext}) 반경 ${radius}m 내의 ${mealName} 식당 5곳을 추천해주세요.
    
    [필수 요구사항]
    1. 반드시 구글 검색을 활용해 실제 존재하는 식당인지 확인하고 최신 정보를 반영하세요.
    2. 결과는 반드시 한국어로 작성하세요.
    3. 각 식당의 평점(0.0~5.0 사이)을 검색 결과를 바탕으로 포함하세요.
    4. 식당으로 연결되는 링크는 반드시 '네이버 지도 검색 결과' 링크(https://map.naver.com/v5/search/식당이름)로 생성하세요.
    5. 전체 추천 이유(summary)는 직장인들이 공감할 수 있는 따뜻한 한글 문장으로 작성하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "추천 사유 및 전체 요약 문구 (한국어)",
            },
            restaurants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  uri: { type: Type.STRING, description: "네이버 지도 검색 URL" },
                  description: { type: Type.STRING, description: "식당의 특징 (예: 가성비 최고, 웨이팅 있음)" },
                  rating: { type: Type.NUMBER, description: "검색 기반 평점" }
                },
                required: ["title", "uri", "description", "rating"]
              }
            }
          },
          required: ["summary", "restaurants"]
        }
      },
    });

    const jsonStr = response.text || "";
    if (!jsonStr) throw new Error("Empty response from AI");
    
    const parsedData = JSON.parse(jsonStr);

    // Google Search Grounding 원본 링크들을 하단에 표기하기 위해 추출 (필수 규칙)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceLinks = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return {
      text: parsedData.summary,
      restaurants: parsedData.restaurants,
      // 원본 출처를 텍스트 하단에 추가하거나 별도로 처리할 수 있습니다.
    };
  } catch (error) {
    console.error("Gemini 3 API Error:", error);
    throw error;
  }
};
