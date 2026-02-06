
import { GoogleGenAI } from "@google/genai";
import { MealType, Location, RecommendationResponse, Restaurant } from "../types";

export const getRecommendations = async (
  mealType: MealType,
  radius: number,
  location: Location | null
): Promise<RecommendationResponse> => {
  // 매 요청마다 새로운 인스턴스 생성 (API 키 안정성 확보)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const mealName = mealType === MealType.LUNCH ? '점심' : '저녁';
  const locationContext = location 
    ? `현재 위치: 위도 ${location.latitude}, 경도 ${location.longitude}`
    : "서울 도심 주요 지역";

  // 프롬프트를 더 단순하고 명확하게 수정
  const prompt = `
    당신은 대한민국 최고의 맛집 가이드입니다.
    ${locationContext} 주변 반경 ${radius}m 내의 ${mealName} 식당 5곳을 추천하세요.

    지침:
    1. 반드시 구글 검색을 사용하여 실제 영업 중인 한국 식당인지 확인하세요.
    2. 식당의 평점(예: 4.3)을 검색 결과에서 찾아 포함하세요.
    3. 링크는 반드시 'https://map.naver.com/v5/search/식당이름' 형식의 네이버 지도 검색 URL을 생성하세요.
    4. 응답 마지막에 반드시 아래 형식의 JSON 데이터를 포함하세요. JSON은 \`\`\`json ... \`\`\` 블록으로 감싸야 합니다.

    JSON 데이터 형식:
    {
      "summary": "직장인들을 위한 한글 추천 문구",
      "restaurants": [
        {
          "title": "식당이름",
          "uri": "네이버 지도 검색 URL",
          "description": "한 줄 특징",
          "rating": 4.5
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // googleSearch 사용 시 responseSchema를 설정하면 에러가 잦으므로 제거합니다.
      },
    });

    const fullText = response.text || "";
    
    // JSON 블록만 정밀하게 추출하는 정규식
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        
        // 데이터 보정 (안정적인 UI를 위해)
        return {
          text: data.summary || "선택하신 지역의 맛집 추천 결과입니다.",
          restaurants: (data.restaurants || []).map((r: any) => ({
            title: r.title || "이름 없는 식당",
            uri: r.uri || `https://map.naver.com/v5/search/${encodeURIComponent(r.title || '')}`,
            description: r.description || "상세 정보가 없습니다.",
            rating: typeof r.rating === 'number' ? r.rating : 0.0
          }))
        };
      } catch (parseError) {
        console.error("JSON 파싱 에러:", parseError);
      }
    }

    // JSON 추출 실패 시 텍스트 기반 폴백
    return {
      text: fullText.split('```')[0].trim() || "추천 정보를 구성하는 중 오류가 발생했습니다.",
      restaurants: []
    };

  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    throw error;
  }
};
