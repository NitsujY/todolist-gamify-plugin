import type { Plugin, PluginAPI } from '../pluginEngine';
import type { Task } from '../../lib/MarkdownParser';
import { useTodoStore } from '../../store/useTodoStore';
import { LOOT_TABLE, STORY_CHAPTERS } from './gamifyTypes';
import type { FamilyData, StoryChapter } from './gamifyTypes';
import { LeaderboardWidget, StoryJournalWidget } from './components/GamifyWidgets';

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
      // 1. Try unified config
      const globalConfig = useTodoStore.getState().pluginConfig?.['gamify-stats'];
      if (globalConfig) {
        this.data = globalConfig;
        return;
      }

      // 2. Fallback to localStorage
      const stored = localStorage.getItem('gamify-stats');
      if (stored) this.data = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load gamify stats", e);
    }
  }

  // 2. Save shared data
  async saveData() {
    // Save to unified config
    useTodoStore.getState().setPluginConfig('gamify-stats', this.data);
    
    // Backup to local storage
    localStorage.setItem('gamify-stats', JSON.stringify(this.data));
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
      const newChapter = STORY_CHAPTERS.find((c: StoryChapter) => c.requiredLevel === user.level);
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


