
import React from 'react';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
            {restaurant.title}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-gray-700">{restaurant.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
        <a 
          href={restaurant.uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors text-xs font-bold border border-green-100"
        >
          <span>네이버 지도</span>
          <ExternalLink size={14} />
        </a>
      </div>
      
      {restaurant.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic relative z-10">
          "{restaurant.description}"
        </p>
      )}
      
      <div className="flex items-center gap-3 text-xs text-gray-400 relative z-10">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-300" />
          <span>주변 맛집</span>
        </div>
      </div>
      
      {/* Decorative Naver Color Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default RestaurantCard;
