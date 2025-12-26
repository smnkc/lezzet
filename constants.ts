import { Upgrade, UpgradeType } from "./types";

export const GAME_TICK_MS = 1000;
export const MAX_QUEUE_SIZE = 8;
export const SPAWN_RATE = 0.25; // Slightly lowered base because Reputation will now boost it

// Durations in seconds (ticks)
export const DURATION_COOKING = 8; 
export const DURATION_EATING = 12;
export const DURATION_SERVICE = 5; 
export const DURATION_WAITING_FOR_WAITER = 25; 
export const MAX_PATIENCE = 35; 

export const PRICE_PER_HEAD = 15;
export const CLEANING_REWARD = 5;

// Costs
export const COST_WAITER_HIRE = 100;
export const COST_TABLE_BUY = 150;
// COST_CHEF_HIRE is removed, managed by difficulty state now
export const COST_NEW_BRANCH = 5000; // Cost to open new branch
export const COST_BRANCH_UPGRADE = 1000; // Cost to upgrade branch level

export const DIFFICULTY_SETTINGS = {
  EASY: { label: 'Kolay', chefCost: 500, description: 'Rahat bir başlangıç.', startMoney: 300 },
  NORMAL: { label: 'Normal', chefCost: 1000, description: 'Dengeli deneyim.', startMoney: 300 },
  HARD: { label: 'Zor', chefCost: 2500, description: 'Gerçek bir meydan okuma.', startMoney: 300 },
  CRACK: { label: 'Crack Mod', chefCost: 0, description: 'Şef Bedava + 50K $', startMoney: 50000 }
};

export const WAITER_NAMES = ["Ahmet", "Ayşe", "Mehmet", "Elif", "Can", "Zeynep", "Burak", "Selin"];

export const INITIAL_TABLES_COUNT = 4;
export const MAX_TABLES_COUNT = 16;
export const INITIAL_WAITERS_COUNT = 1;
export const MAX_WAITERS_COUNT = 16;
export const MAX_BRANCHES = 9;
export const MAX_BRANCH_LEVEL = 5;
export const BASE_BRANCH_INCOME = 50;

export const UPGRADE_DEFINITIONS: Record<UpgradeType, Upgrade> = {
  'SPEED_COOKING': {
    id: 'SPEED_COOKING',
    name: 'Hızlı Fırın',
    description: 'Yemek pişirme süresini %15 kısaltır.',
    cost: 200,
    level: 0,
    maxLevel: 5,
    effectMultiplier: 0.85 
  },
  'PREMIUM_MENU': {
    id: 'PREMIUM_MENU',
    name: 'Gurme Menü',
    description: 'Yemek fiyatlarını %20 artırır.',
    cost: 300,
    level: 0,
    maxLevel: 5,
    effectMultiplier: 1.2
  },
  'MARKETING': {
    id: 'MARKETING',
    name: 'Reklam Ağı',
    description: 'Müşteri gelme şansını %20 artırır.',
    cost: 150,
    level: 0,
    maxLevel: 5,
    effectMultiplier: 1.2
  },
  'WAITER_SPEED': {
    id: 'WAITER_SPEED',
    name: 'Hızlı Servis',
    description: 'Garsonların servis ve temizlik hızını artırır.',
    cost: 250,
    level: 0,
    maxLevel: 4, 
    effectMultiplier: 0.8 
  },
  'TIP_JAR': {
    id: 'TIP_JAR',
    name: 'Bahşiş Kutusu',
    description: 'Müşterilerin bahşiş bırakma şansını artırır.',
    cost: 180,
    level: 0,
    maxLevel: 5,
    effectMultiplier: 0.15 
  },
  'MUSIC_SYSTEM': {
    id: 'MUSIC_SYSTEM',
    name: 'Müzik Sistemi',
    description: 'Sıradaki müşterilerin sabrının tükenmesini yavaşlatır.',
    cost: 220,
    level: 0,
    maxLevel: 4,
    effectMultiplier: 0.80 
  }
};