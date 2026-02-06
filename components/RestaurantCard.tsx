
import React from 'react';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
          {restaurant.title}
        </h3>
        <a 
          href={restaurant.uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors"
        >
          <ExternalLink size={18} />
        </a>
      </div>
      
      {restaurant.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic">
          "{restaurant.description}"
        </p>
      )}
      
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-orange-400" />
          <span>주변 맛집</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span>추천</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
