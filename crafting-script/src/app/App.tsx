import React, { useState } from 'react';
import { PlayerCrafting } from './components/frames/PlayerCrafting';
import { PlayerBlueprints } from './components/frames/PlayerBlueprints';
import { PlayerQueue } from './components/frames/PlayerQueue';
import { AdminDashboard } from './components/frames/AdminDashboard';
import { AdminRecipes } from './components/frames/AdminRecipes';
import { AdminCategories } from './components/frames/AdminCategories';
import { AdminBlueprints } from './components/frames/AdminBlueprints';
import { AdminBenchTypes } from './components/frames/AdminBenchTypes';
import { AdminBenchLocations } from './components/frames/AdminBenchLocations';
import { SystemModals } from './components/frames/SystemModals';
import { Toasts } from './components/frames/Toasts';

type FrameKey = 
  | 'cw_player_crafting_1920'
  | 'cw_player_crafting_2560'
  | 'cw_player_blueprints_1920'
  | 'cw_player_queue_1920'
  | 'ad_admin_dashboard_1920'
  | 'ad_admin_recipes_1920'
  | 'ad_admin_categories_1920'
  | 'ad_admin_blueprints_1920'
  | 'ad_admin_benchTypes_1920'
  | 'ad_admin_benchLocations_1920'
  | 'mdl_system_modals'
  | 'cmp_toasts';

const FRAMES: { key: FrameKey; label: string; width: number; height: number }[] = [
  { key: 'cw_player_crafting_1920', label: 'Player Crafting (1920)', width: 1920, height: 1080 },
  { key: 'cw_player_crafting_2560', label: 'Player Crafting (2560)', width: 2560, height: 1080 },
  { key: 'cw_player_blueprints_1920', label: 'Player Blueprints', width: 1920, height: 1080 },
  { key: 'cw_player_queue_1920', label: 'Player Queue', width: 1920, height: 1080 },
  { key: 'ad_admin_dashboard_1920', label: 'Admin Dashboard', width: 1920, height: 1080 },
  { key: 'ad_admin_recipes_1920', label: 'Admin Recipes', width: 1920, height: 1080 },
  { key: 'ad_admin_categories_1920', label: 'Admin Categories', width: 1920, height: 1080 },
  { key: 'ad_admin_blueprints_1920', label: 'Admin Blueprints', width: 1920, height: 1080 },
  { key: 'ad_admin_benchTypes_1920', label: 'Admin Bench Types', width: 1920, height: 1080 },
  { key: 'ad_admin_benchLocations_1920', label: 'Admin Locations', width: 1920, height: 1080 },
  { key: 'mdl_system_modals', label: 'System Modals', width: 1920, height: 1080 },
  { key: 'cmp_toasts', label: 'Toasts Component', width: 1920, height: 1080 },
];

export default function App() {
  const [currentFrame, setCurrentFrame] = useState<FrameKey>('cw_player_crafting_1920');

  const renderFrame = () => {
    switch (currentFrame) {
      case 'cw_player_crafting_1920':
      case 'cw_player_crafting_2560':
        return <PlayerCrafting frameId={currentFrame} />;
      case 'cw_player_blueprints_1920':
        return <PlayerBlueprints frameId={currentFrame} />;
      case 'cw_player_queue_1920':
        return <PlayerQueue frameId={currentFrame} />;
      case 'ad_admin_dashboard_1920':
        return <AdminDashboard frameId={currentFrame} />;
      case 'ad_admin_recipes_1920':
        return <AdminRecipes frameId={currentFrame} />;
      case 'ad_admin_categories_1920':
        return <AdminCategories frameId={currentFrame} />;
      case 'ad_admin_blueprints_1920':
        return <AdminBlueprints frameId={currentFrame} />;
      case 'ad_admin_benchTypes_1920':
        return <AdminBenchTypes frameId={currentFrame} />;
      case 'ad_admin_benchLocations_1920':
        return <AdminBenchLocations frameId={currentFrame} />;
      case 'mdl_system_modals':
        return <SystemModals frameId={currentFrame} />;
      case 'cmp_toasts':
        return <Toasts frameId={currentFrame} />;
      default:
        return <div>Frame not found</div>;
    }
  };

  const currentFrameConfig = FRAMES.find(f => f.key === currentFrame)!;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900 text-white font-sans">
      {/* Sidebar for Navigation */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 overflow-y-auto z-50">
        <div className="p-4 border-b border-gray-700 font-bold text-lg">Figma Frames</div>
        <div className="flex flex-col p-2 gap-1">
          {FRAMES.map(frame => (
            <button
              key={frame.key}
              onClick={() => setCurrentFrame(frame.key)}
              className={`text-left px-3 py-2 rounded text-sm ${currentFrame === frame.key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              {frame.label}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Viewer */}
      <div className="flex-1 bg-[#050505] flex items-center justify-center overflow-auto p-8 relative">
         {/* Scale wrapper to fit if screen is small */}
         <div 
            style={{ 
              width: currentFrameConfig.width, 
              height: currentFrameConfig.height,
              minWidth: currentFrameConfig.width,
              minHeight: currentFrameConfig.height,
            }} 
            className="bg-black shadow-2xl relative overflow-hidden"
         >
            {renderFrame()}
         </div>
      </div>
    </div>
  );
}
