import { useState } from 'react';
import type { Plugin, PluginAPI } from '../pluginEngine';
import type { Task } from '../../lib/MarkdownParser';

interface UserStats {
  name: string;
  xp: number;
  level: number;
  unlockedChapterIds: number[];
  inventory: string[];
}

interface StoryChapter {
  id: number;
  title: string;
  content: string;
  requiredLevel: number;
}

interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  icon: string;
}

const STORY_CHAPTERS: StoryChapter[] = [
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

const LOOT_TABLE: LootItem[] = [
  { id: 'potion_focus', name: 'Potion of Focus', description: 'Smells like coffee.', rarity: 'common', icon: '☕' },
  { id: 'scroll_haste', name: 'Scroll of Haste', description: 'Helps you type faster.', rarity: 'common', icon: '📜' },
  { id: 'sword_truth', name: 'Sword of Truth', description: 'Cuts through excuses.', rarity: 'rare', icon: '🗡️' },
  { id: 'shield_deadline', name: 'Shield of Deadlines', description: 'Protects against panic.', rarity: 'rare', icon: '🛡️' },
  { id: 'crown_productivity', name: 'Crown of Productivity', description: 'Shines with the light of 1000 completed tasks.', rarity: 'legendary', icon: '👑' }
];

interface FamilyData {
  users: Record<string, UserStats>;
}

export class GamifyPlugin implements Plugin {
  name = 'GamifyAdventure';
  defaultEnabled = false;
  private currentUser = 'Hero'; // Renamed from 'Me'
  private data: FamilyData = { users: {} };
  // private api: PluginAPI | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onInit(_api: PluginAPI) {
    // this.api = api;
    this.loadData();
  }

  onEnable() {
    this.injectStyles();
  }

  onDisable() {
    this.removeStyles();
  }

  injectStyles() {
    const styleId = 'gamify-adventure-styles';
    if (document.getElementById(styleId)) return;

    const css = `
      @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

      body.gamify-adventure-active {
        font-family: 'MedievalSharp', cursive !important;
        background-color: #2c241b !important;
        color: #e0c097 !important;
      }

      /* Navbar & Top Bar */
      body.gamify-adventure-active .navbar {
        background-color: #1a1510 !important;
        border-bottom: 2px solid #8b5e3c !important;
        color: #d4a373 !important;
      }
      
      body.gamify-adventure-active .navbar .btn {
        color: #d4a373 !important;
      }
      
      body.gamify-adventure-active .navbar .text-primary {
        color: #ffb703 !important;
      }

      /* Sidebar */
      body.gamify-adventure-active aside {
        background-color: #261f16 !important;
        border-right: 4px solid #1a1510 !important;
      }
      
      body.gamify-adventure-active aside button,
      body.gamify-adventure-active aside span {
        color: #a89f91 !important;
      }
      
      body.gamify-adventure-active aside button:hover {
        background-color: #3e3226 !important;
        color: #ffb703 !important;
      }
      
      body.gamify-adventure-active aside .text-primary {
        color: #ffb703 !important;
      }

      /* Main Content Area */
      body.gamify-adventure-active .bg-base-200,
      body.gamify-adventure-active .bg-base-100,
      body.gamify-adventure-active main,
      body.gamify-adventure-active .min-h-screen {
        background-color: #2c241b !important;
      }

      /* Task Items - Parchment Strips */
      body.gamify-adventure-active .group.flex.items-center {
        background: #f4e4bc;
        border: 2px solid #8b5e3c !important;
        margin-bottom: 12px;
        padding: 12px !important;
        border-radius: 2px;
        box-shadow: 4px 4px 0px #1a1510;
        color: #4a3b2a !important;
        font-family: 'MedievalSharp', cursive;
        transition: transform 0.1s;
        opacity: 1 !important; /* Override any opacity transitions */
      }
      
      body.gamify-adventure-active .group.flex.items-center:hover {
        transform: translateY(-2px);
        background: #ebdcb0;
      }
      
      /* Force text color inside tasks to be dark brown (ink color) */
      body.gamify-adventure-active .group.flex.items-center * {
        color: #4a3b2a !important;
      }
      
      /* Checkbox - Hand drawn feel */
      /* Target the button wrapper */
      body.gamify-adventure-active .group.flex.items-center button.rounded-full {
        border-radius: 4px !important;
        padding: 2px !important;
        color: #4a3b2a !important;
      }
      
      /* Target the inner div (the actual box) */
      body.gamify-adventure-active .group.flex.items-center button.rounded-full div {
        border-radius: 4px !important;
        border: 2px solid #4a3b2a !important;
        width: 24px !important;
        height: 24px !important;
        background-color: transparent !important;
      }

      /* Checked State (identified by bg-current class on inner div) */
      body.gamify-adventure-active .group.flex.items-center button.rounded-full div.bg-current {
        background-color: transparent !important;
        position: relative;
      }

      body.gamify-adventure-active .group.flex.items-center button.rounded-full div.bg-current::after {
        content: '⚔️';
        position: absolute;
        top: -4px;
        left: -2px;
        font-size: 20px;
      }
      
      /* Sidebar Text Visibility */
      body.gamify-adventure-active aside button,
      body.gamify-adventure-active aside span,
      body.gamify-adventure-active aside div {
        color: #d4a373 !important;
      }
      
      body.gamify-adventure-active aside button:hover,
      body.gamify-adventure-active aside button:hover * {
        color: #ffb703 !important;
      }

      /* Scrollbars */
      body.gamify-adventure-active ::-webkit-scrollbar {
        width: 12px;
        background: #1a1510;
      }
      body.gamify-adventure-active ::-webkit-scrollbar-thumb {
        background: #8b5e3c;
        border: 2px solid #1a1510;
      }
    `;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
    
    // Activate class on body
    document.body.classList.add('gamify-adventure-active');
  }

  removeStyles() {
    document.body.classList.remove('gamify-adventure-active');
    const style = document.getElementById('gamify-adventure-styles');
    if (style) style.remove();
  }

  // 3. Award XP on completion
  async loadData() {
    try {
      // In a real implementation, you'd use the StorageProvider to read 'gamify-stats.json'
      const stored = localStorage.getItem('gamify-stats');
      if (stored) this.data = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load gamify stats", e);
    }
  }

  // 2. Save shared data
  async saveData() {
    localStorage.setItem('gamify-stats', JSON.stringify(this.data));
    // If using FileSystemAdapter, you would write to the file here to share with family
  }

  // 3. Award XP on completion
  onTaskComplete(task: Task) {
    if (!this.data.users[this.currentUser]) {
      this.data.users[this.currentUser] = { 
        name: this.currentUser, 
        xp: 0, 
        level: 1,
        unlockedChapterIds: [1], // Start with Chapter 1
        inventory: []
      };
    }

    const user = this.data.users[this.currentUser];
    
    // Calculate Gold based on task difficulty
    let goldGain = 5;
    if (task.text.includes('#hard')) goldGain = 25;
    if (task.text.includes('#easy')) goldGain = 2;

    user.xp += goldGain; // Using 'xp' field as Gold for now to keep data structure simple
    
    // Level up logic (Rank up)
    if (user.xp >= user.level * 100) {
      user.level++;
      alert(`📜 HEAR YE! You have reached Rank ${user.level}!`);
      
      // Check for Story Unlocks
      const newChapter = STORY_CHAPTERS.find(c => c.requiredLevel === user.level);
      if (newChapter && !user.unlockedChapterIds.includes(newChapter.id)) {
        user.unlockedChapterIds.push(newChapter.id);
        alert(`📖 NEW CHAPTER UNLOCKED: ${newChapter.title}`);
      }
    }

    // Loot Drop Logic (10% chance)
    if (Math.random() < 0.10) {
      const randomLoot = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
      user.inventory.push(randomLoot.id);
      alert(`🎁 LOOT DROP! You found: ${randomLoot.name} ${randomLoot.icon}`);
    }

    this.saveData();
  }

  // 4. Render a Leaderboard in the UI
  renderDashboard() {
    return (
      <div className="space-y-4">
        <LeaderboardWidget data={this.data} />
        <StoryJournalWidget data={this.data} currentUser={this.currentUser} />
      </div>
    );
  }

  // 5. Optional: Show Gold reward next to task
  onTaskRender(task: Task) {
    let gold = 5;
    if (task.text.includes('#hard')) gold = 25;
    return (
      <span className="text-xs font-bold flex items-center gap-1 text-amber-700 ml-2" title="Reward">
        <span>💰</span> {gold}
      </span>
    );
  }
}

// Simple React Component for the Dashboard
const LeaderboardWidget = ({ data }: { data: FamilyData }) => {
  // Force re-render when data changes would require a subscription system
  // For now, this is a static view of the data passed in
  const sortedUsers = Object.values(data.users).sort((a, b) => b.xp - a.xp);

  return (
    <div className="p-4 rounded-lg mt-4 border-4 border-double border-[#8b5e3c] bg-[#f4e4bc] text-[#4a3b2a] font-mono shadow-lg relative overflow-hidden">
      {/* Decorative corner screws */}
      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#4a3b2a] opacity-50"></div>
      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4a3b2a] opacity-50"></div>
      <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-[#4a3b2a] opacity-50"></div>
      <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#4a3b2a] opacity-50"></div>

      <div className="flex justify-between items-center mb-4 border-b-2 border-[#8b5e3c] pb-2">
        <h3 className="font-bold text-lg uppercase tracking-widest">⚔️ Guild Roster</h3>
      </div>
      
      <div className="space-y-3">
        {sortedUsers.map((user, index) => (
          <div key={user.name} className="flex justify-between items-center p-2 bg-[#e6d5aa] border border-[#d4c398] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4a3b2a] text-[#f4e4bc] flex items-center justify-center font-bold rounded border border-[#8b5e3c]">
                {index + 1}
              </div>
              <div>
                <div className="font-bold uppercase text-sm">{user.name}</div>
                <div className="text-xs opacity-80">Rank {user.level} Adventurer</div>
              </div>
            </div>
            <div className="font-bold text-[#8b5e3c] flex items-center gap-1 bg-[#f4e4bc] px-2 py-1 rounded border border-[#d4c398]">
              <span>💰</span> {user.xp}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-xs opacity-60 italic">
        "Complete quests to earn gold!"
      </div>
    </div>
  );
};

const StoryJournalWidget = ({ data, currentUser }: { data: FamilyData, currentUser: string }) => {
  const user = data.users[currentUser];
  const [activeTab, setActiveTab] = useState<'story' | 'inventory'>('story');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  if (!user) return null;

  // const unlockedChapters = STORY_CHAPTERS.filter(c => user.unlockedChapterIds?.includes(c.id));
  const inventoryItems = user.inventory?.map(id => LOOT_TABLE.find(i => i.id === id)).filter(Boolean) as LootItem[] || [];

  return (
    <div className="p-4 rounded-lg border-4 border-double border-[#8b5e3c] bg-[#f4e4bc] text-[#4a3b2a] font-mono shadow-lg relative overflow-hidden">
      <div className="flex gap-2 mb-4 border-b-2 border-[#8b5e3c] pb-2">
        <button 
          onClick={() => setActiveTab('story')}
          className={`px-3 py-1 font-bold rounded ${activeTab === 'story' ? 'bg-[#8b5e3c] text-[#f4e4bc]' : 'bg-[#e6d5aa] hover:bg-[#d4c398]'}`}
        >
          📖 Journal
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1 font-bold rounded ${activeTab === 'inventory' ? 'bg-[#8b5e3c] text-[#f4e4bc]' : 'bg-[#e6d5aa] hover:bg-[#d4c398]'}`}
        >
          🎒 Inventory ({inventoryItems.length})
        </button>
      </div>

      {activeTab === 'story' && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {STORY_CHAPTERS.map((chapter) => {
            const isUnlocked = user.unlockedChapterIds?.includes(chapter.id);
            return (
              <div key={chapter.id} className={`border border-[#d4c398] p-2 ${isUnlocked ? 'bg-[#e6d5aa]' : 'bg-[#d4c398] opacity-50'}`}>
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => isUnlocked && setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                >
                  <span className="font-bold">
                    {isUnlocked ? `Chapter ${chapter.id}: ${chapter.title}` : `Chapter ${chapter.id}: ???`}
                  </span>
                  <span>{isUnlocked ? (expandedChapter === chapter.id ? '▼' : '▶') : '🔒'}</span>
                </div>
                {isUnlocked && expandedChapter === chapter.id && (
                  <div className="mt-2 text-sm italic border-t border-[#d4c398] pt-2">
                    {chapter.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
          {inventoryItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="aspect-square bg-[#e6d5aa] border border-[#d4c398] flex flex-col items-center justify-center p-1 text-center group relative" title={item.description}>
              <div className="text-2xl">{item.icon}</div>
              <div className="text-[10px] leading-tight mt-1 font-bold truncate w-full">{item.name}</div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-[#2c241b] text-[#e0c097] text-xs p-2 rounded hidden group-hover:block z-10 pointer-events-none">
                <div className={`font-bold ${item.rarity === 'legendary' ? 'text-yellow-400' : item.rarity === 'rare' ? 'text-blue-300' : 'text-white'}`}>
                  {item.name}
                </div>
                <div className="italic opacity-80">{item.description}</div>
              </div>
            </div>
          ))}
          {inventoryItems.length === 0 && (
            <div className="col-span-4 text-center italic opacity-60 py-4">
              Your bag is empty. Complete tasks for a chance to find loot!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
