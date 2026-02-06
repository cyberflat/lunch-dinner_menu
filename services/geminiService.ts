
import { GoogleGenAI } from "@google/genai";
import { MealType, Location, RecommendationResponse, Restaurant } from "../types";

export const getRecommendations = async (
  mealType: MealType,
  radius: number,
  location: Location | null
): Promise<RecommendationResponse> => {
  // 매 요청마다 새로운 인스턴스 생성 (API 키 유효성 확보)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const mealName = mealType === MealType.LUNCH ? '점심' : '저녁';
  const lat = location?.latitude || 37.5665;
  const lng = location?.longitude || 126.9780;

  const prompt = `
    당신은 맛집 추천 전문가입니다. 현재 위치(위도: ${lat}, 경도: ${lng}) 주변 반경 ${radius}m 내의 ${mealName} 식당 5곳을 추천해주세요.
    
    필수 조건:
    1. 반드시 Google Maps 데이터를 기반으로 실제 존재하는 식당만 추천하세요.
    2. 각 식당에 대해 이름, 특징 요약, 평점을 포함하세요.
    3. 링크는 네이버 지도 검색 링크(https://map.naver.com/v5/search/식당이름)를 생성하세요.
    4. 응답 마지막에 반드시 아래의 형식을 지켜서 JSON 블록을 포함하세요.
    
    [JSON 형식 예시]
    {
      "summary": "추천 이유를 친절한 한글로 설명",
      "restaurants": [
        {
          "title": "식당이름",
          "uri": "네이버 지도 링크",
          "description": "한 줄 특징",
          "rating": 4.5
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // Maps Grounding은 Gemini 2.5 시리즈에서 가장 안정적입니다.
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        },
        // 응답 속도와 안정성을 위해 thinkingBudget 제외
      },
    });

    const fullText = response.text || "";
    
    // JSON 추출 로직 (정규식 기반)
    let jsonContent = "";
    const jsonBlockMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonContent = jsonBlockMatch[1];
    } else {
      const firstBrace = fullText.indexOf('{');
      const lastBrace = fullText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonContent = fullText.substring(firstBrace, lastBrace + 1);
      }
    }

    if (jsonContent) {
      try {
        const data = JSON.parse(jsonContent);
        
        // Grounding Metadata에서 실제 링크가 있는지 보강 (선택 사항)
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        return {
          text: data.summary || "선택하신 지역의 맛집 추천입니다.",
          restaurants: (data.restaurants || []).map((r: any) => ({
            title: r.title || "추천 식당",
            uri: r.uri || `https://map.naver.com/v5/search/${encodeURIComponent(r.title || '')}`,
            description: r.description || "상세 정보가 준비 중입니다.",
            rating: typeof r.rating === 'number' ? r.rating : 0.0
          }))
        };
      } catch (e) {
        console.error("JSON 파싱 에러:", e);
      }
    }

    // 폴백: JSON 파싱 실패 시 텍스트만이라도 반환
    return {
      text: fullText.replace(/```json[\s\S]*?```/g, '').trim() || "주변 맛집 정보를 찾았습니다.",
      restaurants: []
    };

  } catch (error) {
    console.error("Gemini 2.5 API 호출 중 오류 발생:", error);
    throw error;
  }
};
