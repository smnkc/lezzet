import React from 'react';
import { UpgradeType, GameState } from '../types';
import { UPGRADE_DEFINITIONS } from '../constants';
import { X, TrendingUp, Zap, Banknote, Timer, Music, Coins } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  money: number;
  currentLevels: Record<UpgradeType, number>;
  onBuyUpgrade: (type: UpgradeType) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, money, currentLevels, onBuyUpgrade }) => {
  if (!isOpen) return null;

  const getIcon = (type: UpgradeType) => {
    switch (type) {
      case 'SPEED_COOKING': return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'PREMIUM_MENU': return <Banknote className="w-6 h-6 text-green-400" />;
      case 'MARKETING': return <TrendingUp className="w-6 h-6 text-blue-400" />;
      case 'WAITER_SPEED': return <Timer className="w-6 h-6 text-purple-400" />;
      case 'TIP_JAR': return <Coins className="w-6 h-6 text-amber-400" />;
      case 'MUSIC_SYSTEM': return <Music className="w-6 h-6 text-pink-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border-2 border-wood-600 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-wood-300">Restoran Geliştirmeleri</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded mb-4">
             <span className="text-slate-300">Kasa:</span>
             <span className="text-xl font-bold text-green-400">${money}</span>
          </div>

          {Object.values(UPGRADE_DEFINITIONS).map((def) => {
            const currentLevel = currentLevels[def.id];
            const isMaxed = currentLevel >= def.maxLevel;
            // Cost calculation: Base Cost * (1.5 ^ Level)
            const currentCost = Math.floor(def.cost * Math.pow(1.5, currentLevel));
            const canAfford = money >= currentCost;

            return (
              <div key={def.id} className="bg-slate-700 p-4 rounded-lg flex items-center justify-between border border-slate-600">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-slate-800 p-3 rounded-full border border-slate-600">
                    {getIcon(def.id)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{def.name}</h3>
                    <p className="text-xs text-slate-400">{def.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {[...Array(def.maxLevel)].map((_, i) => (
                            <div key={i} className={`w-6 h-1.5 rounded-full ${i < currentLevel ? 'bg-wood-400' : 'bg-slate-600'}`} />
                        ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onBuyUpgrade(def.id)}
                  disabled={isMaxed || !canAfford}
                  className={`
                    ml-4 px-3 py-2 rounded font-bold text-xs min-w-[90px] flex flex-col items-center
                    ${isMaxed 
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                        : canAfford 
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg active:scale-95' 
                            : 'bg-slate-600 text-red-300 opacity-70 cursor-not-allowed'}
                  `}
                >
                  {isMaxed ? (
                    <span>MAKS</span>
                  ) : (
                    <>
                      <span>Yükselt</span>
                      <span className="text-[10px] opacity-80">${currentCost}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;