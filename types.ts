export enum TableStatus {
  EMPTY = 'EMPTY',
  WAITING_TO_ORDER = 'WAITING_TO_ORDER',
  WAITING_FOR_FOOD = 'WAITING_FOR_FOOD', // Kitchen cooking
  EATING = 'EATING',
  DIRTY = 'DIRTY',
}

export enum WaiterStatus {
  IDLE = 'IDLE',
  TAKING_ORDER = 'TAKING_ORDER',
  DELIVERING = 'DELIVERING',
  CLEANING = 'CLEANING',
}

export interface Table {
  id: number;
  status: TableStatus;
  seats: number;
  timer: number; // Used for eating duration, cooking duration, etc.
  maxTimer: number; // To calculate progress bar
  waiterId: number | null; // ID of waiter currently servicing this table
  customerGroupSize: number;
  customerType?: CustomerType; // New field
  earnings: number; // Potential earnings from current table
}

export interface Waiter {
  id: number;
  name: string;
  status: WaiterStatus;
  targetTableId: number | null;
}

export type CustomerType = 'NORMAL' | 'VIP_CRITIC' | 'VIP_TYCOON';

export interface CustomerGroup {
  id: number;
  size: number;
  type: CustomerType; // New field
  patience: number; // 0-100 descending
  maxPatience: number;
}

export type UpgradeType = 'SPEED_COOKING' | 'PREMIUM_MENU' | 'MARKETING' | 'WAITER_SPEED' | 'TIP_JAR' | 'MUSIC_SYSTEM';
export type DifficultyLevel = 'EASY' | 'NORMAL' | 'HARD' | 'CRACK';

export interface Upgrade {
  id: UpgradeType;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  effectMultiplier: number; // e.g. 0.8 for time reduction, 1.2 for price increase
}

// New Interface for a single Branch state
export interface Branch {
  id: number;
  name: string;
  level: number; // Branch Level (1-5)
  reputation: number;
  tables: Table[];
  waiters: Waiter[];
  queue: CustomerGroup[];
  upgrades: Record<UpgradeType, number>;
  isChefHired: boolean;
  isChefActive: boolean;
}

export interface GameState {
  gameStarted: boolean;
  difficulty: DifficultyLevel;
  chefCost: number;
  money: number; // Global Shared Money
  
  activeBranchIndex: number;
  branches: Branch[];

  notifications: GameNotification[];
  isUpgradeModalOpen: boolean;
  isBranchModalOpen: boolean; // Replaces PrestigeModalOpen
}

export interface GameNotification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}