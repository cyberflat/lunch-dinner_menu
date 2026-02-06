
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import RestaurantCard from './components/RestaurantCard';
import { MealType, Location, Restaurant } from './types';
import { getRecommendations } from './services/geminiService';
import { 
  Navigation, 
  Map as MapIcon, 
  Search, 
  Loader2, 
  Sun, 
  Moon, 
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [mealType, setMealType] = useState<MealType>(MealType.LUNCH);
  const [radius, setRadius] = useState<number>(500);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<{ text: string; restaurants: Restaurant[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locPermission, setLocPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Initialize location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLocPermission('granted');
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocPermission('denied');
          setError("위치 정보 접근 권한이 필요합니다. 브라우저 설정에서 위치 권한을 허용해주세요.");
        }
      );
    } else {
      setError("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!location) {
      setError("현재 위치를 확인 중이거나 권한이 없습니다. 잠시만 기다려주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(mealType, radius, location);
      setResults(data);
    } catch (err: any) {
      setError("AI 추천을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [mealType, radius, location]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Onboarding Alert for New Users */}
        {locPermission === 'prompt' && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-2xl flex items-start gap-3 mb-6 animate-pulse">
            <Info className="shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-bold">주변 맛집을 찾기 위해 위치 권한이 필요합니다.</p>
              <p className="opacity-80">상단 주소창 옆의 자물쇠 아이콘을 클릭하여 위치 권한을 허용해주세요.</p>
            </div>
          </div>
        )}

        {/* Selection Area */}
        <section className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 p-6 md:p-8 mb-8 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-50" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Meal Type Toggle */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 mb-3 uppercase tracking-widest">어떤 식사를 원하시나요?</label>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button
                  onClick={() => setMealType(MealType.LUNCH)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                    mealType === MealType.LUNCH 
                    ? 'bg-white text-orange-600 shadow-md ring-1 ring-gray-100' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Sun size={18} />
                  맛점 (점심)
                </button>
                <button
                  onClick={() => setMealType(MealType.DINNER)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                    mealType === MealType.DINNER 
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-gray-100' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Moon size={18} />
                  맛저 (저녁)
                </button>
              </div>
            </div>

            {/* Radius Selector */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 mb-3 uppercase tracking-widest">
                이동 가능한 반경: <span className="text-orange-500 font-black">{radius}m</span>
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-300">
                  <span className="bg-gray-50 px-2 py-1 rounded">100m</span>
                  <span className="bg-gray-50 px-2 py-1 rounded">직장 근처</span>
                  <span className="bg-gray-50 px-2 py-1 rounded">2km (차량)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || locPermission === 'denied'}
            className={`w-full mt-10 flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-black text-white transition-all transform active:scale-95 ${
              loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:shadow-xl hover:shadow-orange-200 shadow-lg shadow-orange-100'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                AI가 엄선 중...
              </>
            ) : (
              <>
                <Search size={24} />
                오늘의 {mealType === MealType.LUNCH ? '점심' : '저녁'} 추천 메뉴 보기
              </>
            )}
          </button>
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-3xl flex items-center gap-4 mb-8">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle size={20} className="shrink-0" />
            </div>
            <p className="text-sm font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Results Area */}
        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-50 p-2 rounded-lg">
                  <RefreshCw size={20} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900">AI가 분석한 추천 이유</h2>
              </div>
              <div className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                {results.text}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {results.restaurants.map((res, idx) => (
                <RestaurantCard key={idx} restaurant={res} />
              ))}
            </div>
            
            {results.restaurants.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <MapIcon className="mx-auto w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-500 text-lg font-bold">주변에 맛집 정보가 없어요.</p>
                <p className="text-sm text-gray-400 mt-1">반경을 더 넓히거나 위치를 다시 확인해보세요.</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!results && !loading && !error && (
          <div className="text-center py-16 opacity-60">
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Navigation className="text-orange-500 w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">어디서 무엇을 드실까요?</h2>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">전국 어디서나 현재 위치를 기반으로<br/>직장인 맞춤 맛집을 추천합니다.</p>
          </div>
        )}
      </main>

      {/* Mobile Sticky Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-gray-100 py-4 px-6 text-center md:hidden">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          오늘도 수고 많으셨습니다! 즐거운 식사 되세요.
        </p>
      </footer>
    </div>
  );
};

export default App;
