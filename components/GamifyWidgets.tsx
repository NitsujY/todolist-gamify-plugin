import { useState } from 'react';
import { FamilyData, LOOT_TABLE, LootItem, STORY_CHAPTERS } from './types';

// Simple React Component for the Dashboard
export const LeaderboardWidget = ({ data }: { data: FamilyData }) => {
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

export const StoryJournalWidget = ({ data, currentUser }: { data: FamilyData, currentUser: string }) => {
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
              <div 
                key={chapter.id} 
                className={`p-2 rounded border ${isUnlocked ? 'bg-[#e6d5aa] border-[#d4c398]' : 'bg-black/10 border-transparent opacity-50'}`}
              >
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => isUnlocked && setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                >
                  <span className="font-bold text-sm">
                    {isUnlocked ? `Chapter ${chapter.id}: ${chapter.title}` : `Chapter ${chapter.id}: Locked`}
                  </span>
                  {isUnlocked && <span className="text-xs">{expandedChapter === chapter.id ? '▼' : '▶'}</span>}
                </div>
                
                {isUnlocked && expandedChapter === chapter.id && (
                  <div className="mt-2 text-xs leading-relaxed border-t border-[#d4c398] pt-2">
                    {chapter.content}
                  </div>
                )}
                {!isUnlocked && (
                  <div className="text-[10px] mt-1 opacity-70">
                    Requires Level {chapter.requiredLevel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-4 gap-2">
          {inventoryItems.length > 0 ? (
            inventoryItems.map((item, i) => (
              <div key={i} className="aspect-square bg-[#e6d5aa] border border-[#d4c398] rounded flex flex-col items-center justify-center p-1 relative group cursor-help">
                <div className="text-2xl">{item.icon}</div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-[#2c241b] text-[#e0c097] text-[10px] p-2 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-[#8b5e3c]">
                  <div className="font-bold border-b border-[#8b5e3c] mb-1 pb-1">{item.name}</div>
                  <div>{item.description}</div>
                  <div className={`mt-1 font-bold ${item.rarity === 'legendary' ? 'text-yellow-400' : item.rarity === 'rare' ? 'text-blue-300' : 'text-gray-400'}`}>
                    {item.rarity.toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 opacity-50 text-sm">
              Your bag is empty.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
