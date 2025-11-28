import { useState, useEffect } from 'react';
import type { Plugin, PluginAPI } from '../pluginEngine';
import type { Task } from '../../lib/MarkdownParser';

interface UserStats {
  name: string;
  xp: number;
  level: number;
}

interface FamilyData {
  users: Record<string, UserStats>;
}

export class GamifyPlugin implements Plugin {
  name = 'GamifyFamily';
  private currentUser = 'Me'; // In a real app, ask user for name
  private data: FamilyData = { users: {} };
  private api: PluginAPI | null = null;

  onInit(api: PluginAPI) {
    this.api = api;
    this.loadData();
  }

  // 1. Load shared data (mock implementation for FileSystem)
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
      this.data.users[this.currentUser] = { name: this.currentUser, xp: 0, level: 1 };
    }

    const user = this.data.users[this.currentUser];
    
    // Calculate XP based on task difficulty (maybe look for tags like #hard)
    let xpGain = 10;
    if (task.text.includes('#hard')) xpGain = 50;
    if (task.text.includes('#easy')) xpGain = 5;

    user.xp += xpGain;
    
    // Level up logic
    if (user.xp >= user.level * 100) {
      user.level++;
      alert(`🎉 Level Up! You are now level ${user.level}!`);
    }

    this.saveData();
  }

  // 4. Render a Leaderboard in the UI
  renderDashboard() {
    return <LeaderboardWidget data={this.data} />;
  }

  // 5. Optional: Show XP reward next to task
  onTaskRender(task: Task) {
    let xp = 10;
    if (task.text.includes('#hard')) xp = 50;
    return <span className="text-xs text-yellow-500 font-bold">+{xp} XP</span>;
  }
}

// Simple React Component for the Dashboard
const LeaderboardWidget = ({ data }: { data: FamilyData }) => {
  // Force re-render when data changes would require a subscription system
  // For now, this is a static view of the data passed in
  const sortedUsers = Object.values(data.users).sort((a, b) => b.xp - a.xp);

  return (
    <div className="p-4 bg-base-200 rounded-lg mt-4">
      <h3 className="font-bold text-lg mb-2">🏆 Family Leaderboard</h3>
      <div className="space-y-2">
        {sortedUsers.map((user, index) => (
          <div key={user.name} className="flex justify-between items-center bg-base-100 p-2 rounded">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xl">#{index + 1}</span>
              <span>{user.name}</span>
              <span className="text-xs bg-primary text-primary-content px-1 rounded">Lvl {user.level}</span>
            </div>
            <span className="font-bold text-yellow-600">{user.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};
