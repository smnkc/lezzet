import React, { useState, useEffect } from 'react';
import { 
  GameState, 
  Table, 
  Waiter, 
  TableStatus, 
  WaiterStatus, 
  UpgradeType,
  DifficultyLevel,
  Branch,
  CustomerType,
  GameMode,
  ChefMode
} from './types';
import { 
  INITIAL_TABLES_COUNT, 
  INITIAL_WAITERS_COUNT, 
  WAITER_NAMES, 
  GAME_TICK_MS, 
  MAX_QUEUE_SIZE, 
  SPAWN_RATE,
  DURATION_COOKING,
  DURATION_EATING,
  DURATION_SERVICE,
  DURATION_WAITING_FOR_WAITER,
  PRICE_PER_HEAD,
  CLEANING_REWARD,
  COST_WAITER_HIRE,
  COST_TABLE_BUY,
  MAX_TABLES_COUNT,
  MAX_WAITERS_COUNT,
  MAX_PATIENCE,
  UPGRADE_DEFINITIONS,
  COST_NEW_BRANCH,
  DIFFICULTY_SETTINGS,
  MAX_BRANCHES,
  BASE_BRANCH_INCOME,
  COST_BRANCH_UPGRADE,
  MAX_BRANCH_LEVEL
} from './constants';
import TableComponent from './components/TableComponent';
import Sidebar from './components/Sidebar';
import UpgradeModal from './components/UpgradeModal';
import BranchModal from './components/BranchModal';
import { PlusCircle, LayoutGrid, Baby, User, Skull, ChefHat, Zap, Clock, Rocket, Play, Ban } from 'lucide-react';

const App: React.FC = () => {
  
  // --- Create Initial Branch Helper ---
  const createInitialBranch = (id: number): Branch => ({
      id,
      name: `Şube ${id + 1}`,
      level: 1, // Start at Level 1
      reputation: 50,
      tables: Array.from({ length: INITIAL_TABLES_COUNT }, (_, i) => ({
        id: i,
        status: TableStatus.EMPTY,
        seats: 4,
        timer: 0,
        maxTimer: 0,
        waiterId: null,
        customerGroupSize: 0,
        earnings: 0
      })),
      waiters: Array.from({ length: INITIAL_WAITERS_COUNT }, (_, i) => ({
        id: i,
        name: WAITER_NAMES[i % WAITER_NAMES.length],
        status: WaiterStatus.IDLE,
        targetTableId: null
      })),
      queue: [],
      upgrades: {
          'SPEED_COOKING': 0,
          'PREMIUM_MENU': 0,
          'MARKETING': 0,
          'WAITER_SPEED': 0,
          'TIP_JAR': 0,
          'MUSIC_SYSTEM': 0
      },
      isChefHired: false,
      isChefActive: true
  });

  // --- Initialize State ---
  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    gameMode: 'NEW_MODERN',
    chefMode: 'WITH_CHEF',
    difficulty: 'NORMAL',
    chefCost: DIFFICULTY_SETTINGS.NORMAL.chefCost,
    money: 300, 
    activeBranchIndex: 0,
    branches: [createInitialBranch(0)],
    notifications: [],
    isUpgradeModalOpen: false,
    isBranchModalOpen: false
  });

  // Setup Wizard State
  const [setupStep, setSetupStep] = useState<number>(0); // 0: Game Mode, 1: Chef Mode, 2: Difficulty

  const [tick, setTick] = useState(0);

  // --- Helper Functions ---
  
  const addNotification = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = Date.now() + Math.random(); 
    setGameState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { id, message: msg, type }].slice(-5) 
    }));
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== id)
      }));
    }, 3000);
  };

  const checkCanOpenNewBranch = (state: GameState) => {
      if (state.branches.length >= MAX_BRANCHES) return false;
      
      // Requirement 1: Money
      if (state.money < COST_NEW_BRANCH) return false;
      
      // Requirement 2: 100 Reputation in current branch
      const currentBranch = state.branches[state.activeBranchIndex];
      if (currentBranch.reputation < 100) return false;
      
      return true;
  };

  // --- Passive Income Calculation for Background Branches ---
  const calculatePassiveIncome = (branch: Branch): number => {
      return branch.level * BASE_BRANCH_INCOME;
  };


  // --- Game Loop (The Heartbeat) ---
  useEffect(() => {
    if (!gameState.gameStarted) return; 

    const interval = setInterval(() => {
      setTick(t => t + 1);
      
      setGameState(currentState => {
        let { branches, activeBranchIndex, money, notifications, gameMode } = currentState;
        let newBranches = [...branches];
        let newMoney = money;
        let activeBranch = { ...newBranches[activeBranchIndex] }; // Shallow copy of active branch

        // --- OLD CLASSIC MODE: Auto Switch REMOVED ---
        // User now manually triggers next branch via sidebar button

        // --- 1. PROCESS BACKGROUND BRANCHES (Passive Income) ---
        let totalPassiveIncome = 0;
        newBranches.forEach((branch, index) => {
            if (index !== activeBranchIndex) {
                const income = calculatePassiveIncome(branch);
                totalPassiveIncome += income;
            }
        });
        newMoney += totalPassiveIncome;

        // --- 2. PROCESS ACTIVE BRANCH (Detailed Simulation) ---
        
        // Unpack Active Branch Data
        let { tables, waiters, queue, reputation, upgrades, isChefHired, isChefActive } = activeBranch;
        let newTables = [...tables];
        let newWaiters = [...waiters];
        let newQueue = [...queue];
        let newReputation = reputation;

        // Upgrade Multipliers
        const marketingLevel = upgrades['MARKETING'];
        const marketingMultiplier = Math.pow(UPGRADE_DEFINITIONS['MARKETING'].effectMultiplier, marketingLevel);
        const reputationFactor = 0.5 + (reputation / 100); 
        const effectiveSpawnRate = SPAWN_RATE * marketingMultiplier * reputationFactor;
        
        const speedLevel = upgrades['SPEED_COOKING'];
        const speedMultiplier = Math.pow(UPGRADE_DEFINITIONS['SPEED_COOKING'].effectMultiplier, speedLevel); 
        const effectiveCookingDuration = Math.max(1, Math.round(DURATION_COOKING * speedMultiplier));

        const menuLevel = upgrades['PREMIUM_MENU'];
        const priceMultiplier = Math.pow(UPGRADE_DEFINITIONS['PREMIUM_MENU'].effectMultiplier, menuLevel);
        const effectivePricePerHead = Math.floor(PRICE_PER_HEAD * priceMultiplier);

        const musicLevel = upgrades['MUSIC_SYSTEM'];
        const patienceDecayRate = 1 * Math.pow(UPGRADE_DEFINITIONS['MUSIC_SYSTEM'].effectMultiplier, musicLevel);

        const tipLevel = upgrades['TIP_JAR'];
        const tipChance = tipLevel * UPGRADE_DEFINITIONS['TIP_JAR'].effectMultiplier;

        const waiterSpeedLevel = upgrades['WAITER_SPEED'];
        const waiterSpeedMultiplier = Math.pow(UPGRADE_DEFINITIONS['WAITER_SPEED'].effectMultiplier, waiterSpeedLevel);
        const effectiveServiceDuration = Math.max(1, Math.round(DURATION_SERVICE * waiterSpeedMultiplier));

        // Spawning Logic (VIP Logic Added)
        if (Math.random() < effectiveSpawnRate && newQueue.length < MAX_QUEUE_SIZE) {
          const groupSize = Math.floor(Math.random() * 4) + 1; 
          
          // VIP Chance: 5% for Critic, 5% for Tycoon
          const roll = Math.random();
          let type: CustomerType = 'NORMAL';
          let patience = MAX_PATIENCE;

          if (roll < 0.05) {
              type = 'VIP_CRITIC';
              patience = Math.floor(MAX_PATIENCE * 0.7); // Critics have less patience
          } else if (roll < 0.10) {
              type = 'VIP_TYCOON';
              // Normal patience
          }

          newQueue.push({
              id: Date.now() + Math.random(),
              size: groupSize,
              type: type,
              patience: patience,
              maxPatience: patience
          });
          
          if (type !== 'NORMAL') {
             const vipName = type === 'VIP_CRITIC' ? "Ünlü Gurme" : "Zengin İş İnsanı";
             const notifId = Date.now() + Math.random();
             notifications = [...notifications, { 
                 id: notifId, 
                 message: `${vipName} sıraya girdi!`, 
                 type: 'warning' as const
             }].slice(-5);
          }
        }

        // Patience Logic
        newQueue = newQueue.map(q => ({...q, patience: q.patience - patienceDecayRate}));
        const angryCustomers = newQueue.filter(q => q.patience <= 0);
        if (angryCustomers.length > 0) {
            
            // Check if any angry customer was VIP
            angryCustomers.forEach(c => {
                 if (c.type === 'VIP_CRITIC') {
                     newReputation = Math.max(0, newReputation - 15); // Critic Penalty
                     const id = Date.now() + Math.random();
                     notifications = [...notifications, { id, message: "Gurme kızıp gitti! Çok itibar kaybettin!", type: 'error' as const }].slice(-5);
                 } else {
                     newReputation = Math.max(0, newReputation - 2);
                 }
            });

            newQueue = newQueue.filter(q => q.patience > 0);
            
            // Generic notif if not critic (critic handled above)
            if (!angryCustomers.some(c => c.type === 'VIP_CRITIC')) {
                const id = Date.now();
                notifications = [...notifications, { 
                    id, 
                    message: "Müşteri çok beklediği için gitti! (-Rep)", 
                    type: 'error' as const 
                }].slice(-5);
            }
        }

        // Table Logic
        newTables = newTables.map(table => {
          if (table.timer > 0) {
            return { ...table, timer: table.timer - 1 };
          }
          if (table.timer === 0) {
            if (table.status === TableStatus.WAITING_TO_ORDER && table.waiterId === null) {
                const leaveId = Date.now() + table.id;
                
                // Penalty Logic for Leaving Table
                let penalty = 5;
                if (table.customerType === 'VIP_CRITIC') {
                    penalty = 20;
                    notifications = [...notifications, { id: leaveId, message: "Gurme masadan kalktı! REZALET!", type: 'error' as const }].slice(-5);
                } else {
                    notifications = [...notifications, { id: leaveId, message: "Masa sipariş alınmadığı için kalktı! (-Rep)", type: 'error' as const }].slice(-5);
                }
                
                newReputation = Math.max(0, newReputation - penalty);
                return { ...table, status: TableStatus.EMPTY, customerGroupSize: 0, customerType: 'NORMAL', earnings: 0, timer: 0, maxTimer: 0 };
            }
            else if (table.status === TableStatus.WAITING_FOR_FOOD) {
               return { ...table, status: TableStatus.EATING, timer: DURATION_EATING, maxTimer: DURATION_EATING };
            }
            else if (table.status === TableStatus.EATING) {
               const baseBill = table.customerGroupSize * effectivePricePerHead;
               let finalBill = baseBill;
               
               // VIP BONUS LOGIC
               if (table.customerType === 'VIP_TYCOON') {
                   finalBill = finalBill * 5; // Tycoon pays 5x
                   const nId = Date.now() + Math.random();
                   notifications = [...notifications, { id: nId, message: `Zengin Müşteri $${finalBill} ödedi!`, type: 'success' as const }].slice(-5);
               }

               if (tipLevel > 0 && Math.random() < tipChance) {
                   const tipAmount = Math.ceil(baseBill * 0.5); 
                   finalBill += tipAmount;
                   const notifId = Date.now() + Math.random();
                   notifications = [...notifications, { 
                       id: notifId, message: `Cömert Bahşiş! (+$${tipAmount})`, type: 'success' as const 
                   }].slice(-5);
               }
               
               newMoney += finalBill; 
               return { ...table, status: TableStatus.DIRTY, customerGroupSize: 0, earnings: 0, maxTimer: 0 };
            }
          }
          return table;
        });

        // Waiter Logic
        newWaiters = newWaiters.map(waiter => {
            if (waiter.status === WaiterStatus.IDLE) return waiter;
            
            // Note: We check against 'tables' (previous state) for timer=0 transition
            const oldTableIndex = tables.findIndex(t => t.id === waiter.targetTableId);
            if (oldTableIndex === -1) return { ...waiter, status: WaiterStatus.IDLE, targetTableId: null };
            
            const oldTable = tables[oldTableIndex];
            if (oldTable.timer === 0 && oldTable.waiterId === waiter.id) {
                const releasedWaiter = { ...waiter, status: WaiterStatus.IDLE, targetTableId: null };
                const targetTableIndex = newTables.findIndex(t => t.id === waiter.targetTableId);
                const targetTable = newTables[targetTableIndex];

                if (targetTable.status === TableStatus.WAITING_TO_ORDER) {
                    newTables[targetTableIndex] = { ...targetTable, status: TableStatus.WAITING_FOR_FOOD, waiterId: null, timer: effectiveCookingDuration, maxTimer: effectiveCookingDuration };
                } else if (targetTable.status === TableStatus.DIRTY) {
                    
                    // Reputation Gain on Clean
                    let repGain = 1;
                    if (targetTable.customerType === 'VIP_CRITIC') {
                        repGain = 15; // Critic Satisfaction Bonus
                        const nId = Date.now() + Math.random();
                        notifications = [...notifications, { id: nId, message: "Gurme yemeği beğendi! (+15 Rep)", type: 'success' as const }].slice(-5);
                    }

                    newTables[targetTableIndex] = { ...targetTable, status: TableStatus.EMPTY, waiterId: null, customerType: 'NORMAL', timer: 0, maxTimer: 0 };
                    newMoney += CLEANING_REWARD;
                    newReputation = Math.min(100, newReputation + repGain); 
                }
                return releasedWaiter;
            }
            return waiter;
        });

        // Chef Automation Logic
        if (isChefHired && isChefActive) {
            // Auto Seat
            const emptyTableIndices = newTables.map((t, i) => t.status === TableStatus.EMPTY ? i : -1).filter(i => i !== -1);
            let seatedCount = 0;
            while (seatedCount < newQueue.length && seatedCount < emptyTableIndices.length) {
                const tableIdx = emptyTableIndices[seatedCount];
                const customer = newQueue[seatedCount];
                newTables[tableIdx] = { 
                    ...newTables[tableIdx], 
                    status: TableStatus.WAITING_TO_ORDER, 
                    customerGroupSize: customer.size, 
                    customerType: customer.type,
                    seats: 4, 
                    timer: DURATION_WAITING_FOR_WAITER, 
                    maxTimer: DURATION_WAITING_FOR_WAITER 
                };
                seatedCount++;
            }
            if (seatedCount > 0) newQueue = newQueue.slice(seatedCount);

            // Auto Assign Waiters
            const tablesNeedingAttention = newTables.filter(t => (t.status === TableStatus.WAITING_TO_ORDER || t.status === TableStatus.DIRTY) && t.waiterId === null);
            const idleWaiters = newWaiters.filter(w => w.status === WaiterStatus.IDLE);
            let wIdx = 0, tIdx = 0;
            while (wIdx < idleWaiters.length && tIdx < tablesNeedingAttention.length) {
                const waiter = idleWaiters[wIdx];
                const table = tablesNeedingAttention[tIdx];
                const newStatus = table.status === TableStatus.DIRTY ? WaiterStatus.CLEANING : WaiterStatus.TAKING_ORDER;
                
                const wArrIdx = newWaiters.findIndex(w => w.id === waiter.id);
                newWaiters[wArrIdx] = { ...waiter, status: newStatus, targetTableId: table.id };
                
                const tArrIdx = newTables.findIndex(t => t.id === table.id);
                newTables[tArrIdx] = { ...table, waiterId: waiter.id, timer: effectiveServiceDuration, maxTimer: effectiveServiceDuration };
                
                wIdx++; tIdx++;
            }
        }

        // Apply Updates to Active Branch
        activeBranch.tables = newTables;
        activeBranch.waiters = newWaiters;
        activeBranch.queue = newQueue;
        activeBranch.reputation = newReputation;

        // Save back to branches array
        newBranches[activeBranchIndex] = activeBranch;

        return {
          ...currentState,
          activeBranchIndex, // Needed for Old Mode branch switching
          branches: newBranches,
          money: newMoney,
          notifications
        };
      });
    }, GAME_TICK_MS);

    return () => clearInterval(interval);
  }, [gameState.gameStarted]);

  // --- Interaction Handlers ---

  const selectGameMode = (mode: GameMode) => {
      setGameState(prev => ({ ...prev, gameMode: mode }));
      setSetupStep(1);
  };

  const selectChefMode = (mode: ChefMode) => {
      setGameState(prev => ({ ...prev, chefMode: mode }));
      // Always go to difficulty selection now, so user can select CRACK for No Chef
      setSetupStep(2);
  };

  const startGame = (difficulty: DifficultyLevel) => {
      const settings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS];
      
      setGameState(prev => ({
          ...prev,
          gameStarted: true,
          difficulty: difficulty,
          chefCost: settings.chefCost,
          money: settings.startMoney 
      }));
  };

  const currentBranch = gameState.branches[gameState.activeBranchIndex];

  // Wrapper helper to update ONLY the current branch in state
  const updateCurrentBranch = (updater: (branch: Branch) => Branch) => {
      setGameState(prev => {
          const newBranches = [...prev.branches];
          newBranches[prev.activeBranchIndex] = updater(newBranches[prev.activeBranchIndex]);
          return { ...prev, branches: newBranches };
      });
  };

  const handleTableClick = (tableId: number) => {
    const table = currentBranch.tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.status === TableStatus.EMPTY) {
      if (currentBranch.queue.length > 0) {
        const customer = currentBranch.queue[0];
        updateCurrentBranch(branch => ({
            ...branch,
            queue: branch.queue.slice(1),
            tables: branch.tables.map(t => t.id === tableId ? {
                ...t, 
                status: TableStatus.WAITING_TO_ORDER, 
                customerGroupSize: customer.size, 
                customerType: customer.type,
                seats: 4, 
                timer: DURATION_WAITING_FOR_WAITER, 
                maxTimer: DURATION_WAITING_FOR_WAITER
            } : t)
        }));
        addNotification(`Grup masaya oturdu (${customer.size} kişi)`, 'success');
      } else {
        addNotification("Sırada müşteri yok!", 'warning');
      }
      return;
    }

    const needsWaiter = (table.status === TableStatus.WAITING_TO_ORDER || table.status === TableStatus.DIRTY);
    if (needsWaiter) {
      if (table.waiterId !== null) { addNotification("Zaten bir garson ilgileniyor.", 'info'); return; }
      const idleWaiter = currentBranch.waiters.find(w => w.status === WaiterStatus.IDLE);
      
      if (idleWaiter) {
        const waiterSpeedLevel = currentBranch.upgrades['WAITER_SPEED'];
        const speedMultiplier = Math.pow(UPGRADE_DEFINITIONS['WAITER_SPEED'].effectMultiplier, waiterSpeedLevel);
        const effectiveServiceDuration = Math.max(1, Math.round(DURATION_SERVICE * speedMultiplier));
        const newStatus = table.status === TableStatus.DIRTY ? WaiterStatus.CLEANING : WaiterStatus.TAKING_ORDER;
        
        updateCurrentBranch(branch => ({
            ...branch,
            waiters: branch.waiters.map(w => w.id === idleWaiter.id ? { ...w, status: newStatus, targetTableId: tableId } : w),
            tables: branch.tables.map(t => t.id === tableId ? { ...t, waiterId: idleWaiter.id, timer: effectiveServiceDuration, maxTimer: effectiveServiceDuration } : t)
        }));
      } else {
        addNotification("Boşta garson yok!", 'warning');
      }
    }
  };

  const hireWaiter = () => {
      if (currentBranch.waiters.length >= MAX_WAITERS_COUNT) { addNotification("Maksimum garson sayısına ulaşıldı!", 'warning'); return; }
      if (gameState.money >= COST_WAITER_HIRE) {
          const newId = currentBranch.waiters.length > 0 ? Math.max(...currentBranch.waiters.map(w => w.id)) + 1 : 1;
          const newWaiter: Waiter = { id: newId, name: WAITER_NAMES[Math.floor(Math.random() * WAITER_NAMES.length)], status: WaiterStatus.IDLE, targetTableId: null };
          setGameState(prev => ({ ...prev, money: prev.money - COST_WAITER_HIRE }));
          updateCurrentBranch(b => ({ ...b, waiters: [...b.waiters, newWaiter] }));
          addNotification("Yeni garson işe alındı!", 'success');
      } else { addNotification(`Yetersiz bakiye ($${COST_WAITER_HIRE})`, 'warning'); }
  };

  const fireWaiter = (waiterId: number) => {
    const waiter = currentBranch.waiters.find(w => w.id === waiterId);
    if (waiter && waiter.status === WaiterStatus.IDLE) {
        updateCurrentBranch(b => ({ ...b, waiters: b.waiters.filter(w => w.id !== waiterId) }));
        addNotification(`${waiter.name} işten çıkarıldı.`, 'info');
    } else { addNotification("Çalışan garson işten çıkarılamaz!", 'warning'); }
  };

  const hireChef = () => {
      if (gameState.chefMode === 'NO_CHEF') return;
      if (gameState.money >= gameState.chefCost) {
          setGameState(prev => ({ ...prev, money: prev.money - prev.chefCost }));
          updateCurrentBranch(b => ({ ...b, isChefHired: true, isChefActive: true }));
          addNotification("Şef işe alındı!", 'success');
      } else { addNotification(`Yetersiz bakiye ($${gameState.chefCost})`, 'warning'); }
  };

  const toggleChef = () => {
      updateCurrentBranch(b => ({ ...b, isChefActive: !b.isChefActive }));
  };

  const buyTable = () => {
      if (currentBranch.tables.length >= MAX_TABLES_COUNT) { addNotification("Maksimum masa sayısına ulaşıldı!", 'warning'); return; }
      if (gameState.money >= COST_TABLE_BUY) {
          const newId = currentBranch.tables.length > 0 ? Math.max(...currentBranch.tables.map(t => t.id)) + 1 : 0;
          const newTable: Table = { id: newId, status: TableStatus.EMPTY, seats: 4, timer: 0, maxTimer: 0, waiterId: null, customerGroupSize: 0, earnings: 0 };
          setGameState(prev => ({ ...prev, money: prev.money - COST_TABLE_BUY }));
          updateCurrentBranch(b => ({ ...b, tables: [...b.tables, newTable] }));
          addNotification("Yeni masa satın alındı!", 'success');
      } else { addNotification(`Yetersiz bakiye ($${COST_TABLE_BUY})`, 'warning'); }
  };

  const handleBuyUpgrade = (type: UpgradeType) => {
      const def = UPGRADE_DEFINITIONS[type];
      const currentLevel = currentBranch.upgrades[type];
      if (currentLevel >= def.maxLevel) return;
      const cost = Math.floor(def.cost * Math.pow(1.5, currentLevel));
      if (gameState.money >= cost) {
          setGameState(prev => ({ ...prev, money: prev.money - cost }));
          updateCurrentBranch(b => ({ ...b, upgrades: { ...b.upgrades, [type]: currentLevel + 1 } }));
          addNotification(`${def.name} geliştirildi!`, 'success');
      }
  };

  // --- Branch Management Logic ---
  
  const handleOpenNewBranch = () => {
      if (checkCanOpenNewBranch(gameState)) {
          setGameState(prev => {
              const newBranchId = prev.branches.length;
              const newBranch = createInitialBranch(newBranchId);
              
              return {
                  ...prev,
                  money: prev.money - COST_NEW_BRANCH,
                  branches: [...prev.branches, newBranch],
                  activeBranchIndex: newBranchId,
                  isBranchModalOpen: false // Close modal after opening
              };
          });
          addNotification(`Şube ${gameState.branches.length + 1} açıldı!`, 'success');
      } else {
          addNotification("Yeni şube için şartlar sağlanmadı.", 'warning');
      }
  };

  const switchBranch = (index: number) => {
      setGameState(prev => ({
          ...prev,
          activeBranchIndex: index,
          isBranchModalOpen: false
      }));
  };

  const handleUpgradeBranchLevel = (branchIndex: number) => {
      const branch = gameState.branches[branchIndex];
      
      if (branch.level >= MAX_BRANCH_LEVEL) {
          addNotification("Bu şube zaten maksimum seviyede!", "warning");
          return;
      }

      if (gameState.money >= COST_BRANCH_UPGRADE) {
          setGameState(prev => {
              const newBranches = [...prev.branches];
              newBranches[branchIndex] = {
                  ...branch,
                  level: branch.level + 1
              };
              return {
                  ...prev,
                  money: prev.money - COST_BRANCH_UPGRADE,
                  branches: newBranches
              };
          });
          addNotification(`Şube seviyesi ${branch.level + 1}'e yükseltildi! Gelir arttı.`, "success");
      } else {
          addNotification(`Yetersiz bakiye! ($${COST_BRANCH_UPGRADE} gerekli)`, "warning");
      }
  };

  // --- Render Start Screen Wizard ---
  if (!gameState.gameStarted) {
      return (
          <div className="flex h-screen w-screen bg-slate-900 items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm"></div>
               <div className="relative z-10 bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl border-2 border-amber-600 shadow-2xl max-w-4xl w-full text-center">
                   
                   <div className="mb-8">
                       <ChefHat className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                       <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-2">LEZZET USTASI</h1>
                       <p className="text-slate-400">Restoran İmparatorluğunu Kur</p>
                   </div>

                   {/* Step 0: Game Mode Selection */}
                   {setupStep === 0 && (
                       <div className="animate-in fade-in duration-300">
                           <h3 className="text-white font-bold mb-6 text-xl">Oyun Modunu Seç</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <button onClick={() => selectGameMode('OLD_CLASSIC')} className="bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-amber-500 p-6 rounded-xl transition-all group text-left">
                                   <div className="flex items-center justify-between mb-4">
                                       <span className="text-2xl font-black text-amber-400">ESKİ USÜL</span>
                                       <Clock className="w-8 h-8 text-slate-400 group-hover:text-amber-400" />
                                   </div>
                                   <p className="text-slate-300 text-sm mb-2">
                                       • $5000 + 100 İtibar yapınca yeni şube açılır.<br/>
                                       • Eski şubeler pasif gelir ($50) sağlar.<br/>
                                       • Basit ve çizgisel ilerleme.
                                   </p>
                               </button>

                               <button onClick={() => selectGameMode('NEW_MODERN')} className="bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-purple-500 p-6 rounded-xl transition-all group text-left">
                                   <div className="flex items-center justify-between mb-4">
                                       <span className="text-2xl font-black text-purple-400">YENİ NESİL</span>
                                       <Rocket className="w-8 h-8 text-slate-400 group-hover:text-purple-400" />
                                   </div>
                                   <p className="text-slate-300 text-sm mb-2">
                                       • Şubeleri dilediğin gibi yönet ve geliştir.<br/>
                                       • İstediğin zaman şubeler arası geçiş yap.<br/>
                                       • Detaylı yönetim paneli.
                                   </p>
                               </button>
                           </div>
                       </div>
                   )}

                   {/* Step 1: Chef Mode Selection */}
                   {setupStep === 1 && (
                       <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                           <h3 className="text-white font-bold mb-6 text-xl">Şef Tercihi</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <button onClick={() => selectChefMode('WITH_CHEF')} className="bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-indigo-500 p-6 rounded-xl transition-all group flex flex-col items-center">
                                   <ChefHat className="w-12 h-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                                   <div className="text-2xl font-bold text-white mb-2">ŞEFLİ OYUN</div>
                                   <p className="text-slate-400 text-sm">Şef kiralayarak otomatik masa yerleştirme ve garson atama özelliklerini kullanabilirsin.</p>
                               </button>

                               <button onClick={() => selectChefMode('NO_CHEF')} className="bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600 hover:border-red-500 p-6 rounded-xl transition-all group flex flex-col items-center">
                                   <Ban className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
                                   <div className="text-2xl font-bold text-white mb-2">ŞEFSİZ (ZOR)</div>
                                   <p className="text-slate-400 text-sm">Şef yok, otomasyon yok. Her masayı ve garsonu tek tek yönetmelisin.</p>
                               </button>
                           </div>
                           <button onClick={() => setSetupStep(0)} className="mt-8 text-slate-500 hover:text-white underline">Geri Dön</button>
                       </div>
                   )}

                   {/* Step 2: Difficulty Selection (NOW FOR BOTH MODES) */}
                   {setupStep === 2 && (
                       <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                           <h3 className="text-white font-bold mb-6 text-xl">Zorluk Seviyesi Seç</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
                               {/* Filter difficulties: If NO_CHEF, only show NORMAL and CRACK */}
                               {(Object.keys(DIFFICULTY_SETTINGS) as DifficultyLevel[])
                                .filter(diff => {
                                    if (gameState.chefMode === 'NO_CHEF') {
                                        return diff === 'NORMAL' || diff === 'CRACK';
                                    }
                                    return true;
                                })
                                .map(diff => {
                                   const setting = DIFFICULTY_SETTINGS[diff];
                                   const isCrack = diff === 'CRACK';
                                   // If No Chef mode, don't show "Chef Cost" in the card, or show it as disabled/irrelevant
                                   const isNoChef = gameState.chefMode === 'NO_CHEF';

                                   return (
                                       <button 
                                        key={diff} 
                                        onClick={() => startGame(diff)} 
                                        className={`
                                            relative overflow-hidden p-4 rounded-xl transition-all border-2 flex flex-col items-center justify-between min-h-[140px]
                                            ${isCrack 
                                                ? 'bg-purple-900/50 hover:bg-purple-900 border-purple-500 hover:border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] group' 
                                                : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 hover:border-amber-500'
                                            }
                                        `}
                                       >
                                           {isCrack && <div className="absolute top-0 right-0 p-1"><Zap className="w-4 h-4 text-purple-300 animate-pulse" /></div>}
                                           
                                           <div className="text-center">
                                               <div className={`text-xl font-bold mb-1 ${isCrack ? 'text-purple-300 group-hover:text-white' : 'text-white'}`}>{setting.label}</div>
                                               <div className="text-xs text-slate-400 mb-2 leading-tight">{setting.description}</div>
                                           </div>
                                           
                                           <div className="text-center w-full">
                                               {!isNoChef && (
                                                   <div className={`font-bold text-sm ${isCrack ? 'text-green-400' : 'text-amber-400'}`}>
                                                       Şef: ${setting.chefCost}
                                                   </div>
                                               )}
                                               {setting.startMoney > 300 && (
                                                    <div className="text-xs text-green-300 mt-1 font-mono">
                                                        +${setting.startMoney} Başlangıç
                                                    </div>
                                               )}
                                           </div>
                                       </button>
                                   );
                               })}
                           </div>
                           <button onClick={() => setSetupStep(1)} className="mt-8 text-slate-500 hover:text-white underline">Geri Dön</button>
                       </div>
                   )}
               </div>
          </div>
      );
  }

  // Calculate total passive income for display
  let currentPassiveIncomeDisplay = 0;
  gameState.branches.forEach((b, i) => {
      if (i !== gameState.activeBranchIndex) currentPassiveIncomeDisplay += calculatePassiveIncome(b);
  });
  // Display as rounded integer usually
  const passiveDisplay = currentPassiveIncomeDisplay;

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden">
      
      <UpgradeModal 
        isOpen={gameState.isUpgradeModalOpen}
        onClose={() => setGameState(prev => ({ ...prev, isUpgradeModalOpen: false }))}
        money={gameState.money}
        currentLevels={currentBranch.upgrades}
        onBuyUpgrade={handleBuyUpgrade}
      />

      <BranchModal 
        isOpen={gameState.isBranchModalOpen}
        onClose={() => setGameState(prev => ({ ...prev, isBranchModalOpen: false }))}
        branches={gameState.branches}
        activeBranchIndex={gameState.activeBranchIndex}
        globalMoney={gameState.money}
        canOpenNewBranch={checkCanOpenNewBranch(gameState)}
        onSwitchBranch={switchBranch}
        onOpenNewBranch={handleOpenNewBranch}
        onUpgradeBranch={handleUpgradeBranchLevel}
      />

      {/* Game Area */}
      <div 
        className="flex-1 relative overflow-hidden flex flex-col"
        style={{
            backgroundColor: '#3d2b1f',
            backgroundImage: `linear-gradient(45deg, #2a1d15 25%, transparent 25%, transparent 75%, #2a1d15 75%, #2a1d15), linear-gradient(45deg, #2a1d15 25%, transparent 25%, transparent 75%, #2a1d15 75%, #2a1d15)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)'
        }}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/30"></div>

        {/* Notifications */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none gap-2 w-full max-w-md">
            {gameState.notifications.map(n => (
                <div key={n.id} className={`px-4 py-2 rounded shadow-lg text-sm font-bold animate-bounce-short text-center border-2 ${n.type === 'success' ? 'bg-green-600 border-green-400 text-white' : n.type === 'warning' ? 'bg-amber-600 border-amber-400 text-white' : n.type === 'error' ? 'bg-red-600 border-red-400 text-white' : 'bg-blue-600 border-blue-400 text-white'}`}>
                    {n.message}
                </div>
            ))}
        </div>

        {/* Tables Grid */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4 z-10">
            <div className="grid grid-cols-4 gap-4 content-center justify-items-center max-w-5xl">
                {currentBranch.tables.map(table => (
                <TableComponent 
                    key={table.id} 
                    table={table} 
                    onClick={handleTableClick}
                    assignedWaiter={currentBranch.waiters.find(w => w.id === table.waiterId)}
                />
                ))}
            </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 z-40 px-4 pb-6 pt-2">
             <button 
                onClick={buyTable}
                disabled={currentBranch.tables.length >= MAX_TABLES_COUNT}
                className="bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 disabled:opacity-50 disabled:grayscale text-white px-6 py-3 rounded-xl shadow-[0_4px_0_rgb(120,53,15)] active:shadow-none active:translate-y-1 flex items-center gap-2 border-2 border-amber-400 font-bold transition-all min-w-[140px] justify-center"
             >
                <LayoutGrid className="w-5 h-5 drop-shadow-md" />
                {currentBranch.tables.length >= MAX_TABLES_COUNT ? (
                    <span className="text-lg font-bold">MAKS</span>
                ) : (
                    <div className="flex flex-col items-start">
                        <span className="text-sm shadow-black drop-shadow-sm">Masa Ekle</span>
                        <span className="text-xs text-amber-200">${COST_TABLE_BUY}</span>
                    </div>
                )}
             </button>

             <button 
                onClick={hireWaiter}
                disabled={currentBranch.waiters.length >= MAX_WAITERS_COUNT}
                className="bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-50 disabled:grayscale text-white px-6 py-3 rounded-xl shadow-[0_4px_0_rgb(6,78,59)] active:shadow-none active:translate-y-1 flex items-center gap-2 border-2 border-emerald-400 font-bold transition-all min-w-[140px] justify-center"
             >
                <PlusCircle className="w-5 h-5 drop-shadow-md" />
                {currentBranch.waiters.length >= MAX_WAITERS_COUNT ? (
                    <span className="text-lg font-bold">MAKS</span>
                ) : (
                    <div className="flex flex-col items-start">
                        <span className="text-sm shadow-black drop-shadow-sm">Garson Kirala</span>
                        <span className="text-xs text-emerald-200">${COST_WAITER_HIRE}</span>
                    </div>
                )}
             </button>
        </div>
      </div>

      <Sidebar 
        money={gameState.money}
        reputation={currentBranch.reputation}
        queue={currentBranch.queue}
        waiters={currentBranch.waiters}
        restaurantLevel={gameState.activeBranchIndex + 1}
        passiveIncome={passiveDisplay}
        isChefHired={currentBranch.isChefHired}
        isChefActive={currentBranch.isChefActive}
        chefCost={gameState.chefCost}
        gameMode={gameState.gameMode}
        chefMode={gameState.chefMode}
        canOpenNewBranch={checkCanOpenNewBranch(gameState)}
        onFireWaiter={fireWaiter}
        onHireChef={hireChef}
        onToggleChef={toggleChef}
        onOpenUpgrades={() => setGameState(prev => ({ ...prev, isUpgradeModalOpen: true }))}
        onOpenBranchModal={() => setGameState(prev => ({ ...prev, isBranchModalOpen: true }))}
        onOpenNewBranch={handleOpenNewBranch}
      />
    </div>
  );
};

export default App;