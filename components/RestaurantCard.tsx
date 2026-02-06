
import React from 'react';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  // 평점이 0이거나 없을 경우 '신규' 또는 '정보없음' 표시 대신 숫자 유지
  const displayRating = restaurant.rating && restaurant.rating > 0 
    ? restaurant.rating.toFixed(1) 
    : '평점 정보 없음';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group relative overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
            {restaurant.title}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className={`${restaurant.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            <span className="text-sm font-bold text-gray-700">{displayRating}</span>
          </div>
        </div>
        <a 
          href={restaurant.uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors text-xs font-bold border border-green-100 shrink-0"
        >
          <span>네이버 지도</span>
          <ExternalLink size={14} />
        </a>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic relative z-10 flex-grow">
        {restaurant.description ? `"${restaurant.description}"` : "식당 상세 설명이 준비 중입니다."}
      </p>
      
      <div className="flex items-center gap-3 text-xs text-gray-400 relative z-10 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-300" />
          <span>현위치 기준 추천</span>
        </div>
      </div>
      
      {/* Naver Brand Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default RestaurantCard;
