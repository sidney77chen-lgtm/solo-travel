import React from 'react';
import { ViewState } from '../types';
import { Map, Calendar, CreditCard, Ticket, Sparkles } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onOpenAI: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, onOpenAI }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t-4 border-pop-dark pb-safe pt-2 z-50">
      <div className="max-w-md mx-auto px-2">
        <div className="grid grid-cols-5 h-20 items-end pb-4 gap-1">
          <button
            onClick={() => setView('itinerary')}
            className={`group flex flex-col items-center justify-center h-full w-full gap-1 rounded-xl transition-all active:translate-y-1 ${
              currentView === 'itinerary' ? 'text-pop-blue' : 'text-gray-400 hover:text-pop-dark'
            }`}
          >
            <div className={`p-2 rounded-lg border-2 transition-all ${
                currentView === 'itinerary' 
                ? 'bg-pop-yellow border-pop-dark shadow-pop-sm -translate-y-1' 
                : 'bg-transparent border-transparent'
            }`}>
               <Calendar size={24} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
            </div>
            <span className={`text-[10px] uppercase tracking-wide ${currentView === 'itinerary' ? 'font-black' : 'font-bold'}`}>Plan</span>
          </button>

          <button
            onClick={() => setView('map')}
            className={`group flex flex-col items-center justify-center h-full w-full gap-1 rounded-xl transition-all active:translate-y-1 ${
              currentView === 'map' ? 'text-pop-blue' : 'text-gray-400 hover:text-pop-dark'
            }`}
          >
             <div className={`p-2 rounded-lg border-2 transition-all ${
                currentView === 'map' 
                ? 'bg-pop-yellow border-pop-dark shadow-pop-sm -translate-y-1' 
                : 'bg-transparent border-transparent'
            }`}>
                <Map size={24} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
            </div>
            <span className={`text-[10px] uppercase tracking-wide ${currentView === 'map' ? 'font-black' : 'font-bold'}`}>Map</span>
          </button>

          {/* AI Button - Center Pop */}
          <div className="relative flex items-center justify-center h-full pointer-events-none">
             <button
                onClick={onOpenAI}
                className="pointer-events-auto absolute -top-8 flex flex-col items-center justify-center w-16 h-16 bg-pop-blue text-white rounded-2xl shadow-pop hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all border-4 border-pop-dark z-20"
             >
                <Sparkles size={32} fill="currentColor" className="text-pop-yellow animate-pulse" />
             </button>
          </div>

          <button
            onClick={() => setView('expenses')}
            className={`group flex flex-col items-center justify-center h-full w-full gap-1 rounded-xl transition-all active:translate-y-1 ${
              currentView === 'expenses' ? 'text-pop-blue' : 'text-gray-400 hover:text-pop-dark'
            }`}
          >
            <div className={`p-2 rounded-lg border-2 transition-all ${
                currentView === 'expenses' 
                ? 'bg-pop-yellow border-pop-dark shadow-pop-sm -translate-y-1' 
                : 'bg-transparent border-transparent'
            }`}>
                <CreditCard size={24} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
            </div>
            <span className={`text-[10px] uppercase tracking-wide ${currentView === 'expenses' ? 'font-black' : 'font-bold'}`}>Spend</span>
          </button>

          <button
            onClick={() => setView('wallet')}
            className={`group flex flex-col items-center justify-center h-full w-full gap-1 rounded-xl transition-all active:translate-y-1 ${
              currentView === 'wallet' ? 'text-pop-blue' : 'text-gray-400 hover:text-pop-dark'
            }`}
          >
             <div className={`p-2 rounded-lg border-2 transition-all ${
                currentView === 'wallet' 
                ? 'bg-pop-yellow border-pop-dark shadow-pop-sm -translate-y-1' 
                : 'bg-transparent border-transparent'
            }`}>
                <Ticket size={24} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
            </div>
            <span className={`text-[10px] uppercase tracking-wide ${currentView === 'wallet' ? 'font-black' : 'font-bold'}`}>Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;