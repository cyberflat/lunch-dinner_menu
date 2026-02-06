
export enum MealType {
  LUNCH = 'LUNCH',
  DINNER = 'DINNER'
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  title: string;
  uri: string;
  description?: string;
  rating?: number;
  reviews?: string[];
}

export interface RecommendationResponse {
  text: string;
  restaurants: Restaurant[];
}
