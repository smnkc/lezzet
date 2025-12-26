import React from 'react';
import { Branch } from '../types';
import { Building2, Plus, Lock, ArrowRight, Coins, ChevronUp } from 'lucide-react';
import { COST_NEW_BRANCH, MAX_BRANCHES, COST_BRANCH_UPGRADE, MAX_BRANCH_LEVEL, BASE_BRANCH_INCOME } from '../constants';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  activeBranchIndex: number;
  globalMoney: number;
  canOpenNewBranch: boolean;
  onSwitchBranch: (index: number) => void;
  onOpenNewBranch: () => void;
  onUpgradeBranch: (index: number) => void;
}

const BranchModal: React.FC<BranchModalProps> = ({ 
    isOpen, 
    onClose, 
    branches, 
    activeBranchIndex, 
    globalMoney,
    canOpenNewBranch,
    onSwitchBranch,
    onOpenNewBranch,
    onUpgradeBranch
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                    ŞUBE YÖNETİMİ
                </h2>
                <p className="text-slate-400 text-sm">Şirketinizin büyümesini buradan yönetin.</p>
            </div>
            <button 
                onClick={onClose} 
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
                Kapat
            </button>
        </div>

        {/* Grid */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Existing Branches */}
                {branches.map((branch, index) => {
                    const isActive = index === activeBranchIndex;
                    const isMaxLevel = branch.level >= MAX_BRANCH_LEVEL;
                    const canAffordUpgrade = globalMoney >= COST_BRANCH_UPGRADE;
                    const currentIncome = branch.level * BASE_BRANCH_INCOME;

                    return (
                        <div 
                            key={branch.id}
                            className={`
                                relative p-5 rounded-xl border-2 transition-all overflow-hidden flex flex-col
                                ${isActive 
                                    ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                                    : 'bg-slate-800/50 border-slate-700'}
                            `}
                        >
                            {isActive && (
                                <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
                                    AKTİF
                                </div>
                            )}

                            {/* Branch Info */}
                            <div 
                                onClick={() => !isActive && onSwitchBranch(index)}
                                className={`flex items-center gap-3 mb-4 ${!isActive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                            >
                                <div className={`p-3 rounded-lg ${isActive ? 'bg-purple-600' : 'bg-slate-700'}`}>
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">ŞUBE {index + 1}</h3>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        Seviye {branch.level} / {MAX_BRANCH_LEVEL}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 flex-1">
                                <div className="flex justify-between text-sm border-b border-white/5 pb-1">
                                    <span className="text-slate-400">Otomatik Gelir</span>
                                    <span className="text-green-400 font-bold">${currentIncome}/sn</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-white/5 pb-1">
                                    <span className="text-slate-400">İtibar</span>
                                    <span className="text-yellow-400 font-bold">%{branch.reputation}</span>
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="flex flex-col gap-2 mt-auto">
                                {/* Upgrade Level Button */}
                                <button
                                    onClick={() => onUpgradeBranch(index)}
                                    disabled={isMaxLevel || !canAffordUpgrade}
                                    className={`
                                        w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border
                                        ${isMaxLevel 
                                            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                                            : canAffordUpgrade 
                                                ? 'bg-green-600/20 hover:bg-green-600/40 text-green-300 border-green-500/50 active:scale-95' 
                                                : 'bg-slate-800 text-red-400 border-red-900/50 cursor-not-allowed opacity-70'}
                                    `}
                                >
                                    {isMaxLevel ? (
                                        <span>MAKS SEVİYE</span>
                                    ) : (
                                        <>
                                            <ChevronUp className="w-3 h-3" />
                                            <div className="flex flex-col leading-none items-start">
                                                <span>SEVİYE YÜKSELT</span>
                                                <span className="text-[9px] opacity-70">Gelir +${BASE_BRANCH_INCOME} | Maliyet: ${COST_BRANCH_UPGRADE}</span>
                                            </div>
                                        </>
                                    )}
                                </button>

                                {/* Switch Control Button */}
                                {!isActive && (
                                    <button 
                                        onClick={() => onSwitchBranch(index)}
                                        className="w-full bg-slate-700 hover:bg-purple-600 hover:text-white text-slate-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-white/10"
                                    >
                                        Yönetime Geç <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* New Branch Slot */}
                {branches.length < MAX_BRANCHES && (
                    <button 
                        onClick={onOpenNewBranch}
                        disabled={!canOpenNewBranch}
                        className={`
                            relative p-5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-4 transition-all min-h-[200px]
                            ${canOpenNewBranch 
                                ? 'border-green-500/50 bg-green-900/10 hover:bg-green-900/20 cursor-pointer' 
                                : 'border-slate-700 bg-slate-900/30 cursor-not-allowed'}
                        `}
                    >
                        <div className={`
                            w-16 h-16 rounded-full flex items-center justify-center shadow-lg
                            ${canOpenNewBranch ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-600'}
                        `}>
                            {canOpenNewBranch ? <Plus className="w-8 h-8" /> : <Lock className="w-6 h-6" />}
                        </div>

                        <div>
                            <h3 className={`font-bold text-lg ${canOpenNewBranch ? 'text-green-400' : 'text-slate-500'}`}>
                                YENİ ŞUBE AÇ
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                                {canOpenNewBranch 
                                    ? "Mevcut şube maksimum seviyede. Büyüme zamanı!" 
                                    : "Mevcut şubeyi tamamen geliştirmeden yeni şube açamazsın."}
                            </p>
                        </div>
                        
                        <div className="bg-black/30 px-3 py-1 rounded text-sm text-slate-300 border border-white/10">
                            Maliyet: <span className="text-amber-400 font-bold">${COST_NEW_BRANCH}</span>
                        </div>
                    </button>
                )}
            </div>
        </div>
        
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500">
            Toplam {branches.length} / {MAX_BRANCHES} Şube
        </div>
      </div>
    </div>
  );
};

export default BranchModal;