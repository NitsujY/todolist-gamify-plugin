# Gamification Plugin Guide: Storybook & Loot System

This guide outlines the architecture for the "Storybook Unlock" and "Loot Drop" systems within the Gamify Plugin.

## Core Concepts

### 1. The Narrative (Storybook)
The application treats the user's productivity journey as a linear RPG story.
- **Progression:** As the user gains XP and Levels up by completing tasks, new chapters of the story are unlocked.
- **Storage:** Story progress is saved in the user's `UserStats` object.
- **Extensibility:** The story content is currently static but designed to be replaced by dynamic LLM generation.

### 2. The Rewards (Loot System)
To provide variable reinforcement (skinner box effect), tasks have a chance to drop "Loot".
- **Triggers:** Every `onTaskComplete` event rolls a die (RNG).
- **Rarity:** Items have rarity tiers (Common, Rare, Legendary).
- **Inventory:** Collected items are stored in the user's inventory.

## Data Structures

### User Stats
```typescript
interface UserStats {
  name: string;
  xp: number;
  level: number;
  unlockedChapterIds: number[]; // IDs of chapters the user can read
  inventory: string[];          // IDs of loot items collected
}
```

### Story Chapter
```typescript
interface StoryChapter {
  id: number;
  title: string;
  content: string;
  requiredLevel: number;
  imagePrompt?: string; // For future AI image generation
}
```

### Loot Item
```typescript
interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  icon: string; // Emoji or URL
}
```

## Future AI Integration (LLM)

To make the story infinite and reactive:

1.  **Dynamic Content Generation:**
    Instead of reading from a static `STORY_CHAPTERS` array, the `getChapter(id)` function can call an LLM API.
    *   *Prompt Context:* "The user has completed 5 tasks about 'Coding' and 'Cleaning'. Write a fantasy chapter where the hero repairs a magical construct and cleans the corruption from the sanctuary."

2.  **Visuals:**
    Use the `imagePrompt` field to call an Image Generation API (DALL-E, Midjourney) when a chapter is unlocked, displaying a unique illustration for that user's journey.

3.  **NPC Interaction:**
    Loot items could be "Quest Items" that trigger specific LLM conversations.
