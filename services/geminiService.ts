
import { GoogleGenAI } from "@google/genai";
import { MealType, Location, RecommendationResponse, Restaurant } from "../types";

export const getRecommendations = async (
  mealType: MealType,
  radius: number,
  location: Location | null
): Promise<RecommendationResponse> => {
  // 매 요청마다 최신 API 키를 반영한 인스턴스 생성
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const mealName = mealType === MealType.LUNCH ? '점심' : '저녁';
  const locationContext = location 
    ? `현재 위치 좌표: ${location.latitude}, ${location.longitude}`
    : "서울 중심가";

  const prompt = `
    당신은 직장인들의 식사 고민을 해결하는 20년 경력의 맛집 큐레이터입니다.
    현재 위치(${locationContext}) 반경 ${radius}m 내의 ${mealName} 식당 5곳을 추천해주세요.
    
    [응답 가이드라인]
    1. 반드시 구글 검색을 활용해 실제 영업 중인 식당인지 확인하세요.
    2. 식당의 평점(예: 4.5)을 검색 결과에서 찾아 포함하세요.
    3. 식당 링크는 반드시 'https://map.naver.com/v5/search/식당이름' 형식의 네이버 지도 검색 링크로 생성하세요.
    4. 먼저 직장인들에게 건네는 따뜻한 추천 요약 문구(summary)를 한국어로 작성하세요.
    5. 마지막에 반드시 아래의 JSON 형식을 포함하여 응답하세요. 다른 텍스트와 섞이지 않게 JSON 블록(\`\`\`json ... \`\`\`)으로 감싸주세요.

    [JSON 형식 예시]
    {
      "summary": "추천 사유 요약...",
      "restaurants": [
        {
          "title": "식당이름",
          "uri": "네이버 지도 링크",
          "description": "식당 특징 설명",
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
        // responseMimeType: "application/json"을 제거하여 검색 도구와의 충돌을 피합니다.
      },
    });

    const text = response.text || "";
    
    // JSON 블록 추출 로직 (가장 안정적인 방법)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
    
    let parsedData: any = {
      summary: "추천 정보를 가져오는 데 성공했습니다.",
      restaurants: []
    };

    if (jsonMatch) {
      try {
        const cleanJson = jsonMatch[1] || jsonMatch[0];
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON 파싱 에러:", e);
        // 파싱 실패 시 텍스트 기반으로 기본 데이터 생성 시도
        parsedData.summary = text.split('```')[0].trim();
      }
    } else {
      parsedData.summary = text;
    }

    // Google Search Grounding 결과에서 추가 링크가 있다면 활용 (시스템 요구사항)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchLinks = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // 최종 데이터 정리
    return {
      text: parsedData.summary || "선택하신 조건에 맞는 맛집을 찾았습니다.",
      restaurants: (parsedData.restaurants || []).map((r: any) => ({
        ...r,
        rating: r.rating || 0.0,
        // 혹시 링크가 없으면 네이버 검색 링크로 보정
        uri: r.uri || `https://map.naver.com/v5/search/${encodeURIComponent(r.title)}`
      }))
    };
  } catch (error) {
    console.error("Gemini 3 API 실행 중 치명적 오류:", error);
    throw error;
  }
};
