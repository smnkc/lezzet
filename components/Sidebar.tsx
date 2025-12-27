import React from 'react';
import { Users, DollarSign, Star, ChefHat, UserX, TrendingUp, Building2, Coins, UserCheck, Power, Map, Crown, Glasses, ArrowRight, Lock } from 'lucide-react';
import { Waiter, WaiterStatus, CustomerGroup, GameMode, ChefMode } from '../types';
import { COST_NEW_BRANCH } from '../constants';

interface SidebarProps {
  money: number;
  reputation: number;
  queue: CustomerGroup[];
  waiters: Waiter[];
  restaurantLevel: number; // Current Branch ID + 1
  passiveIncome: number; // Calculated dynamic income from other branches
  isChefHired: boolean;
  isChefActive: boolean;
  chefCost: number;
  gameMode: GameMode;
  chefMode: ChefMode;
  canOpenNewBranch: boolean;
  onFireWaiter: (id: number) => void;
  onHireChef: () => void;
  onToggleChef: () => void;
  onOpenUpgrades: () => void;
  onOpenBranchModal: () => void;
  onOpenNewBranch: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    money, 
    reputation, 
    queue, 
    waiters, 
    restaurantLevel,
    passiveIncome,
    isChefHired,
    isChefActive,
    chefCost,
    gameMode,
    chefMode,
    canOpenNewBranch,
    onFireWaiter,
    onHireChef,
    onToggleChef,
    onOpenUpgrades,
    onOpenBranchModal,
    onOpenNewBranch
}) => {
  return (
    <div className="w-80 h-full flex flex-col z-20 backdrop-blur-md bg-slate-900/90 border-l border-white/10 shadow-2xl">
      
      {/* Header Stats */}
      <div className="p-6 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-slate-800/50 to-transparent flex-shrink-0">
        {/* Branch / Level Indicator (Only visible in MODERN mode) */}
        {gameMode === 'NEW_MODERN' && (
          <button 
              onClick={onOpenBranchModal}
              className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/5 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer group"
          >
              <Building2 className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
              ŞUBE {restaurantLevel} (Değiştir)
          </button>
        )}
        
        {gameMode === 'OLD_CLASSIC' && (
             <div className="absolute top-2 right-2 text-[10px] font-bold text-amber-500 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-amber-500/20">
                ŞUBE {restaurantLevel}
            </div>
        )}

        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-4 font-sans tracking-wide drop-shadow-sm">
            LEZZET USTASI
        </h2>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-black/40 p-2 rounded-lg border border-green-500/30 flex flex-col items-center justify-center">
             <DollarSign className="w-5 h-5 text-green-400 mb-1" />
             <span className="text-xl font-bold text-white">{Math.floor(money)}</span>
             <span className="text-[10px] text-green-400/70">ANA KASA</span>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-yellow-500/30 flex flex-col items-center justify-center">
             <Star className="w-5 h-5 text-yellow-400 mb-1 fill-yellow-400" />
             <span className="text-xl font-bold text-white">{reputation}%</span>
             <span className="text-[10px] text-yellow-400/70">İTİBAR</span>
          </div>
        </div>

        {/* Passive Income Indicator */}
        {passiveIncome > 0 && (
            <div className="flex items-center justify-center gap-1 text-xs text-green-300 mb-3 bg-green-900/20 py-1 rounded border border-green-500/20">
                <Coins className="w-3 h-3" />
                <span>+${passiveIncome} / sn (Diğer Şubeler)</span>
            </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
            <button 
                onClick={onOpenUpgrades}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow border border-white/10 transition-transform active:scale-95 group"
            >
                <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                Market & Geliştirmeler
            </button>
            
            {/* Branch Button only for Modern Mode */}
            {gameMode === 'NEW_MODERN' && (
                <button 
                    onClick={onOpenBranchModal}
                    className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-white/5 transition-colors"
                >
                    <Map className="w-3 h-3" />
                    Şubeleri Yönet
                </button>
            )}

            {/* Old Mode Progression UI */}
            {gameMode === 'OLD_CLASSIC' && (
                 <div className="mt-2">
                     {canOpenNewBranch ? (
                         <button 
                             onClick={onOpenNewBranch}
                             className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-green-400/30 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                         >
                             <ArrowRight className="w-4 h-4" />
                             SONRAKİ ŞUBEYİ AÇ (-${COST_NEW_BRANCH})
                         </button>
                     ) : (
                         <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col gap-1">
                             <div className="text-[10px] text-slate-400 uppercase font-bold text-center border-b border-white/5 pb-1 mb-1">Yeni Şube Hedefi</div>
                             
                             <div className={`flex justify-between text-xs ${money >= COST_NEW_BRANCH ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                                 <span>Para:</span>
                                 <span>${money} / ${COST_NEW_BRANCH}</span>
                             </div>
                             
                             <div className={`flex justify-between text-xs ${reputation >= 100 ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>
                                 <span>İtibar:</span>
                                 <span>%{reputation} / %100</span>
                             </div>
                             
                             <div className="text-[9px] text-slate-600 text-center mt-1 italic flex items-center justify-center gap-1">
                                 <Lock className="w-3 h-3" />
                                 Kilitli
                             </div>
                         </div>
                     )}
                 </div>
            )}
        </div>
      </div>

      {/* Chef Section - Only Show if Chef Mode is active */}
      {chefMode === 'WITH_CHEF' && (
        <div className="p-4 border-b border-white/10 flex-shrink-0 bg-slate-900/30">
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg">
                            <ChefHat className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-indigo-100">Baş Şef</span>
                    </div>
                    {isChefHired && (
                        <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isChefActive ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'}`}>
                            {isChefActive ? 'AKTİF' : 'PASİF'}
                        </div>
                    )}
                </div>

                {!isChefHired ? (
                    <button 
                        onClick={onHireChef}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <span>İşe Al</span>
                        <span className="bg-black/30 px-1.5 rounded text-indigo-200">${chefCost}</span>
                    </button>
                ) : (
                    <button 
                        onClick={onToggleChef}
                        className={`
                            w-full text-xs py-2 rounded shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 font-bold border
                            ${isChefActive 
                                ? 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700' 
                                : 'bg-green-600 text-white border-green-500 hover:bg-green-500'}
                        `}
                    >
                        <Power className="w-3 h-3" />
                        {isChefActive ? 'Şefi Dinlendir' : 'Otomasyonu Başlat'}
                    </button>
                )}
            </div>
        </div>
      )}

      {/* Staff Status - Fixed height to show approx 2 items, then scroll */}
      <div className="p-4 border-b border-white/10 flex-shrink-0 bg-slate-900/30 flex flex-col">
        <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center">
                <UserCheck className="w-4 h-4 mr-2 text-slate-500" />
                PERSONEL LİSTESİ
            </div>
            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-white font-mono">{waiters.length}</span>
        </h3>
        
        {/* h-32 sets a fixed height around 128px, enough for ~2.5 items */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar h-32 flex-shrink-0">
          {waiters.map(waiter => (
            <div key={waiter.id} className="bg-black/40 p-2 rounded border border-white/5 group hover:border-white/20 transition-colors relative flex-shrink-0">
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 shadow-[0_0_8px] flex-shrink-0 ${waiter.status === WaiterStatus.IDLE ? 'bg-green-500 shadow-green-500' : 'bg-amber-500 shadow-amber-500'}`} />
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-200 truncate">{waiter.name}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wide truncate">
                        {waiter.status === WaiterStatus.IDLE ? 'HAZIR' : 
                        waiter.status === WaiterStatus.TAKING_ORDER ? 'SİPARİŞ' :
                        waiter.status === WaiterStatus.DELIVERING ? 'SERVİS' : 'TEMİZLİK'}
                    </span>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onFireWaiter(waiter.id); }}
                disabled={waiter.status !== WaiterStatus.IDLE}
                className={`absolute top-1 right-1 p-1 rounded transition-all ${
                    waiter.status === WaiterStatus.IDLE 
                    ? 'text-red-400 hover:bg-red-900/80 hover:text-white cursor-pointer' 
                    : 'text-slate-700 cursor-not-allowed opacity-50'
                }`}
                title="İşten Çıkar"
              >
                <UserX className="w-3 h-3" />
              </button>
            </div>
          ))}
          {waiters.length === 0 && (
              <div className="text-center text-slate-600 text-xs italic p-4 border border-dashed border-slate-700 rounded">
                  Henüz garson alınmadı.
              </div>
          )}
        </div>
      </div>

      {/* Waiting Queue - Fills remaining space, but has minimum height */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col bg-slate-900/30 min-h-[8rem]">
        <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
             <Users className="w-4 h-4 mr-2 text-slate-500" />
             BEKLEME SIRASI
          </div>
          <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-white font-mono">{queue.length}</span>
        </h3>
        
        <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 text-xs italic">
                <span>Müşteri bekleniyor...</span>
            </div>
          ) : (
            queue.map((customer, index) => {
                const patiencePercent = (customer.patience / customer.maxPatience) * 100;
                let patienceColor = 'bg-green-500';
                if (patiencePercent < 50) patienceColor = 'bg-amber-500';
                if (patiencePercent < 20) patienceColor = 'bg-red-500';

                // Styling for VIPs
                let cardStyle = "bg-black/40 border-l-2 border-l-slate-600";
                let icon = null;
                let vipLabel = null;

                if (customer.type === 'VIP_CRITIC') {
                    cardStyle = "bg-red-900/30 border-l-2 border-l-red-500 border border-red-500/30";
                    icon = <Glasses className="w-3 h-3 text-red-300 absolute top-1 right-1 opacity-50" />;
                    patienceColor = "bg-red-500 shadow-[0_0_10px_red]"; 
                } else if (customer.type === 'VIP_TYCOON') {
                    cardStyle = "bg-yellow-900/30 border-l-2 border-l-yellow-400 border border-yellow-400/30";
                    icon = <Crown className="w-3 h-3 text-yellow-300 absolute top-1 right-1 opacity-50" />;
                }

                return (
                  <div key={customer.id} className={`${cardStyle} p-2 rounded-r flex flex-col gap-1 relative overflow-hidden transition-all hover:scale-[1.02] flex-shrink-0`}>
                    {icon}
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-white/10 shadow-lg shrink-0">
                          {customer.size}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide truncate">
                              {index === 0 ? 'SIRADAKİ' : `GRUP #${customer.id.toString().slice(-3)}`}
                          </div>
                          {customer.type === 'VIP_CRITIC' && <div className="text-[8px] bg-red-800 text-white px-1 rounded inline-block">GURME</div>}
                          {customer.type === 'VIP_TYCOON' && <div className="text-[8px] bg-yellow-700 text-white px-1 rounded inline-block">ZENGİN</div>}
                        </div>
                    </div>
                    
                    {/* Patience Bar */}
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div 
                            className={`h-full transition-all duration-300 shadow-[0_0_5px] ${patienceColor}`} 
                            style={{ width: `${patiencePercent}%` }}
                        />
                    </div>
                  </div>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;