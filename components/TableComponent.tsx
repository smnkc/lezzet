import React from 'react';
import { Table, TableStatus, Waiter } from '../types';
import { User, Sparkles, SprayCan, ClipboardList, Crown, Glasses } from 'lucide-react';

interface TableComponentProps {
  table: Table;
  onClick: (tableId: number) => void;
  assignedWaiter?: Waiter;
}

const TableComponent: React.FC<TableComponentProps> = ({ table, onClick, assignedWaiter }) => {
  
  // High-fidelity CSS for the table surface
  const getTableSurfaceStyle = () => {
    // Base wood texture
    const base = "radial-gradient(circle at 30% 30%, #a05a2c, #5c3a1e)";
    
    // Status overlays
    if (table.status === TableStatus.DIRTY) {
        return `radial-gradient(circle at 50% 50%, #4a2e1b, #2d1b0f)`; // Much darker, grimier
    }
    if (table.status === TableStatus.EMPTY) {
         return `radial-gradient(circle at 30% 30%, #b06b3e, #6b4423)`; // Lighter, clean
    }
    
    // VIP Table Styling
    if (table.customerType === 'VIP_TYCOON') {
        return `radial-gradient(circle at 30% 30%, #ffd700, #b8860b)`; // Golden Table for Tycoons
    }
    if (table.customerType === 'VIP_CRITIC') {
        return `radial-gradient(circle at 30% 30%, #8b0000, #3f0000)`; // Velvet Red for Critics
    }

    return base;
  };

  const getBorderColor = () => {
      if (assignedWaiter) return 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]'; // Selection glow
      if (table.status === TableStatus.WAITING_TO_ORDER && !assignedWaiter) return 'border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      if (table.customerType === 'VIP_TYCOON') return 'border-yellow-200 shadow-[0_0_15px_rgba(255,215,0,0.4)]';
      if (table.customerType === 'VIP_CRITIC') return 'border-red-400 shadow-[0_0_15px_rgba(220,20,60,0.4)]';
      return 'border-[#4a3018]';
  };

  // Render Chairs as SVG shapes for better control over "tucked in" animation
  const renderChairs = () => {
      const chairs = [];
      const isOccupied = table.status !== TableStatus.EMPTY && table.status !== TableStatus.DIRTY;
      
      for (let i = 0; i < table.seats; i++) {
          const angle = (i * (360 / table.seats)) * (Math.PI / 180);
          // Radius: Pull chairs in when occupied, push out slightly when empty for easier access look
          const radius = isOccupied ? 45 : 52; 
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          // Chair visuals
          let chairColor = isOccupied ? '#3f2e22' : '#5c4033'; 
          let chairSeatColor = isOccupied ? '#1a1a1a' : '#8b4513'; 

          // VIP Chair Colors
          if (isOccupied) {
              if (table.customerType === 'VIP_TYCOON') {
                  chairColor = '#daa520';
                  chairSeatColor = '#4a3c10';
              } else if (table.customerType === 'VIP_CRITIC') {
                  chairColor = '#800000';
                  chairSeatColor = '#300000';
              }
          }

          chairs.push(
              <div 
                key={i}
                className="absolute w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out"
                style={{
                    transform: `translate(${x}px, ${y}px) rotate(${i * (360 / table.seats) + 90}deg)`,
                    zIndex: isOccupied ? 20 : 5 // Chairs above table when empty (tucked), below/merged when occupied? Actually usually below
                }}
              >
                  {/* Chair Backrest Graphics (CSS) */}
                  <div className="w-10 h-8 rounded-lg shadow-md relative" 
                       style={{ 
                           background: `linear-gradient(to bottom, ${chairColor}, ${chairSeatColor})`,
                           boxShadow: '0 4px 6px rgba(0,0,0,0.5)'
                       }}>
                        {/* Customer Head (Top Down) */}
                        {isOccupied && i < table.customerGroupSize && (
                             <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#f5d0b0] rounded-full border-2 border-black/20 shadow-inner z-30 flex items-center justify-center">
                                 {/* Hair */}
                                 <div className="absolute top-0 left-0 w-full h-full rounded-full bg-black/80 clip-path-hair"></div>
                                 
                                 {/* VIP Accessories */}
                                 {table.customerType === 'VIP_TYCOON' && (
                                     <Crown className="w-4 h-4 text-yellow-400 absolute -top-3 drop-shadow-md fill-yellow-400" />
                                 )}
                                 {table.customerType === 'VIP_CRITIC' && (
                                     <Glasses className="w-4 h-4 text-white absolute -top-1 z-50 drop-shadow-md" />
                                 )}
                             </div>
                        )}
                   </div>
              </div>
          );
      }
      return <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{chairs}</div>;
  };

  // Render Table Top Content (Plates, Food, Menus)
  const renderTableContent = () => {
      // Plate positions
      const plates = [];
      if (table.status === TableStatus.EATING || table.status === TableStatus.DIRTY) {
          for (let i = 0; i < table.customerGroupSize; i++) {
            const angle = (i * (360 / table.seats)) * (Math.PI / 180);
            const radius = 25;
            // Add randomness to plate position if dirty
            const randomOffsetX = table.status === TableStatus.DIRTY ? (Math.random() * 6 - 3) : 0;
            const randomOffsetY = table.status === TableStatus.DIRTY ? (Math.random() * 6 - 3) : 0;
            
            const x = Math.cos(angle) * radius + randomOffsetX;
            const y = Math.sin(angle) * radius + randomOffsetY;
            
            plates.push(
                <div key={i} className="absolute w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-200"
                     style={{ transform: `translate(${x}px, ${y}px)` }}>
                    {table.status === TableStatus.EATING && (
                        // Food Graphics (Simple colored circles)
                        // Fancy Food for Tycoons
                        <div className={`w-4 h-4 rounded-full border ${
                            table.customerType === 'VIP_TYCOON' ? 'bg-amber-300 border-amber-500 shadow-[0_0_5px_gold]' :
                            table.customerType === 'VIP_CRITIC' ? 'bg-red-400 border-red-600' :
                            'bg-orange-400 border-orange-600'
                        }`}></div>
                    )}
                    {table.status === TableStatus.DIRTY && (
                        // Dirty Plate Graphics (Empty and slightly transparent)
                        <div className="w-full h-full rounded-full opacity-80 bg-[radial-gradient(circle,_rgba(0,0,0,0.1)_20%,_#e5e7eb_100%)]">
                            {/* Leftover bits */}
                            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-800/60 rounded-full transform translate-x-1 -translate-y-1"></div>
                        </div>
                    )}
                </div>
            );
          }
      }

      // Menus
      if (table.status === TableStatus.WAITING_TO_ORDER || table.status === TableStatus.WAITING_FOR_FOOD) {
           return (
               <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-10 bg-white shadow-lg border border-gray-300 rounded flex flex-col items-center justify-center p-1 transform rotate-12">
                       <div className="w-full h-0.5 bg-black mb-1"></div>
                       <div className="w-full h-0.5 bg-black mb-1"></div>
                   </div>
               </div>
           );
      }

      // Mess on Dirty Table (Napkins, Spills)
      if (table.status === TableStatus.DIRTY) {
          return (
              <>
                {plates}
                
                {/* Visual Clutter Layer */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                    
                    {/* Crumpled Napkin 1 */}
                    <div className="absolute top-[25%] left-[30%] w-4 h-4 bg-gray-200 shadow-sm z-10"
                        style={{ 
                            clipPath: 'polygon(10% 0%, 90% 10%, 100% 80%, 20% 100%, 0% 50%)',
                            transform: 'rotate(15deg)'
                        }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-400/20"></div>
                    </div>

                     {/* Crumpled Napkin 2 */}
                     <div className="absolute bottom-[20%] right-[25%] w-3 h-3 bg-white shadow-sm z-10"
                        style={{ 
                            clipPath: 'polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%)',
                            transform: 'rotate(-45deg)'
                        }}>
                    </div>

                    {/* Ketchup/Sauce Spill */}
                    <div className="absolute top-[40%] right-[30%] w-5 h-4 bg-red-900/40 blur-[1px] rounded-full transform scale-x-150 rotate-12"></div>
                    
                    {/* Coffee/Drink Ring */}
                    <div className="absolute bottom-[35%] left-[40%] w-4 h-4 border-2 border-amber-900/30 rounded-full blur-[0.5px]"></div>
                    
                    {/* Crumbs */}
                    <div className="absolute top-[60%] left-[50%] w-0.5 h-0.5 bg-yellow-800 rounded-full"></div>
                    <div className="absolute top-[50%] left-[60%] w-1 h-1 bg-gray-800/50 rounded-full"></div>

                </div>
              </>
          );
      }

      return <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{plates}</div>;
  };

  const getActionHint = () => {
    if (assignedWaiter) return null;
    let text = "";
    let icon = null;
    
    switch (table.status) {
      case TableStatus.EMPTY: text = "AL"; break;
      case TableStatus.WAITING_TO_ORDER: text = "SİPARİŞ"; break;
      case TableStatus.DIRTY: text = "TEMİZLE"; break;
    }

    if (!text) return null;

    return (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full shadow-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all z-40 font-bold tracking-wider uppercase pointer-events-none whitespace-nowrap backdrop-blur-sm">
            {text}
        </div>
    );
  };

  // Waiter Overlay Animation (Enhanced)
  const renderWaiter = () => {
      if (!assignedWaiter) return null;
      
      let icon = <ClipboardList className="w-4 h-4 text-white" />;
      let bgColor = "bg-amber-600";
      
      if (table.status === TableStatus.DIRTY) {
          icon = <SprayCan className="w-4 h-4 text-white" />;
          bgColor = "bg-blue-600";
      }

      return (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-bounce-short">
             <div className={`${bgColor} p-1.5 rounded-full border-2 border-white shadow-lg`}>
                {icon}
             </div>
             <div className="bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full mt-1 backdrop-blur-md">
                 {assignedWaiter.name}
             </div>
        </div>
      );
  }

  const progressPercentage = table.maxTimer > 0 
    ? ((table.maxTimer - table.timer) / table.maxTimer) * 100 
    : 0;

  const isPatienceTimer = table.status === TableStatus.WAITING_TO_ORDER && !assignedWaiter;
  const barWidth = isPatienceTimer 
    ? (table.timer / table.maxTimer) * 100 
    : progressPercentage;

  const getBarColor = () => {
      if (isPatienceTimer) return table.timer < 8 ? 'bg-red-500' : 'bg-orange-500';
      if (table.status === TableStatus.EATING) return 'bg-green-500';
      return 'bg-blue-500';
  }

  return (
    <div className="w-40 h-40 flex items-center justify-center relative group select-none">
        
        {/* Floor Shadow under table */}
        <div className="absolute w-28 h-28 bg-black/40 rounded-full blur-md transform translate-y-2"></div>

        {/* Chairs Layer */}
        {renderChairs()}

        {/* Main Table Body */}
        <div 
            onClick={() => onClick(table.id)}
            className={`
                relative w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-transform duration-100 active:scale-95 z-30 cursor-pointer
                ${getBorderColor()}
            `}
            style={{
                background: getTableSurfaceStyle(),
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.3)'
            }}
        >
            {/* Table Surface Shine/Texture overlay */}
            <div className="absolute inset-0 rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>

            {/* Content Layer */}
            {renderTableContent()}

            {/* Status Particles (Sparkles for clean, Smoke for cooking?) */}
            {table.status === TableStatus.DIRTY && assignedWaiter && (
                <Sparkles className="absolute -right-2 -top-2 w-6 h-6 text-yellow-300 animate-spin z-40" />
            )}
            
            {/* Waiting Icon if no waiter */}
            {table.status === TableStatus.WAITING_TO_ORDER && !assignedWaiter && (
                 <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                     <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-lg">!</div>
                 </div>
            )}

            {/* Waiter Floating Above */}
            {renderWaiter()}

            {/* Circular Progress Bar (Ring style would be cool, but keeping linear for clarity or styling it better) */}
            {table.maxTimer > 0 && table.timer < table.maxTimer && (
                <div className="absolute bottom-6 w-16 h-2 bg-black/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/20 shadow-lg z-40">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${getBarColor()}`}
                        style={{ width: `${barWidth}%` }}
                    />
                </div>
            )}
            {/* Show full bar initially for patience */}
            {isPatienceTimer && table.timer === table.maxTimer && (
                <div className="absolute bottom-6 w-16 h-2 bg-black/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/20 shadow-lg z-40">
                    <div className="h-full w-full bg-orange-500"></div>
                </div>
            )}

        </div>

        {getActionHint()}
    </div>
  );
};

export default TableComponent;