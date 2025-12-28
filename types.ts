export interface UserStats {
  name: string;
  xp: number;
  level: number;
  unlockedChapterIds: number[];
  inventory: string[];
}

export interface StoryChapter {
  id: number;
  title: string;
  content: string;
  requiredLevel: number;
}

export interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  icon: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: "The Awakening",
    content: "You open your eyes to a world shrouded in mist. The air smells of old parchment and ozone. A voice whispers, 'To clear the fog, you must complete the Tasks of the Day.' You pick up a rusty sword lying nearby.",
    requiredLevel: 1
  },
  {
    id: 2,
    title: "The First Guardian",
    content: "Having proven your resolve, the mist recedes slightly. A stone golem blocks the path ahead. It has 'PROCRASTINATION' carved into its forehead. You ready your weapon, knowing only consistent effort can chip away at its stone hide.",
    requiredLevel: 2
  },
  {
    id: 3,
    title: "The Village of Done",
    content: "The golem crumbles. Beyond it lies a small village. The villagers cheer as you approach. They have been waiting for a hero who actually finishes what they start. The Elder hands you a map to the Castle of Goals.",
    requiredLevel: 3
  }
];

export const LOOT_TABLE: LootItem[] = [
  { id: 'potion_focus', name: 'Potion of Focus', description: 'Smells like coffee.', rarity: 'common', icon: '☕' },
  { id: 'scroll_haste', name: 'Scroll of Haste', description: 'Helps you type faster.', rarity: 'common', icon: '📜' },
  { id: 'sword_truth', name: 'Sword of Truth', description: 'Cuts through excuses.', rarity: 'rare', icon: '🗡️' },
  { id: 'shield_deadline', name: 'Shield of Deadlines', description: 'Protects against panic.', rarity: 'rare', icon: '🛡️' },
  { id: 'crown_productivity', name: 'Crown of Productivity', description: 'Shines with the light of 1000 completed tasks.', rarity: 'legendary', icon: '👑' }
];

export interface FamilyData {
  users: Record<string, UserStats>;
}
