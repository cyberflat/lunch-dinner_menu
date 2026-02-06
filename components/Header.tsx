
import React from 'react';
import { UtensilsCrossed, Share2 } from 'lucide-react';

const Header: React.FC = () => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '맛점맛저 - 오늘 뭐 먹지?',
          text: '직장인들을 위한 AI 기반 메뉴 추천 서비스!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl shadow-sm">
            <UtensilsCrossed className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            맛점<span className="text-orange-500">맛저</span>
          </h1>
        </div>
        
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-orange-500 transition-colors bg-gray-50 px-4 py-2 rounded-full border border-gray-100"
        >
          <Share2 size={16} />
          <span>공유하기</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
