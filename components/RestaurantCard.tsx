
import React from 'react';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  const hasRating = typeof restaurant.rating === 'number' && restaurant.rating > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
            {restaurant.title}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className={`${hasRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            <span className="text-sm font-bold text-gray-700">
              {hasRating ? restaurant.rating.toFixed(1) : '평점 정보 없음'}
            </span>
          </div>
        </div>
        <a 
          href={restaurant.uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all text-xs font-bold border border-green-100 shrink-0"
        >
          <span>네이버 지도</span>
          <ExternalLink size={14} />
        </a>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic flex-grow">
        {restaurant.description ? `"${restaurant.description}"` : "식당에 대한 상세 설명이 준비 중입니다."}
      </p>
      
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 pt-3 border-t border-gray-50 uppercase tracking-tight">
        <MapPin size={12} className="text-gray-300" />
        <span>실시간 정보 기반 추천</span>
      </div>
      
      <div className="absolute top-0 left-0 w-1 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default RestaurantCard;
