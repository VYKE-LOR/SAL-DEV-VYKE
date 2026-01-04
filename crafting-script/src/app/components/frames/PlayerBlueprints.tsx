import React from 'react';
import { PlayerTopbar } from '../shared/PlayerTopbar';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toggle } from '../shared/Toggle';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { BLUEPRINTS } from '../../data/mockData';
import { Filter, ChevronRight, FileText } from 'lucide-react';

interface PlayerBlueprintsProps {
  frameId: string;
}

export const PlayerBlueprints: React.FC<PlayerBlueprintsProps> = ({ frameId }) => {
  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="cw_bp_root" className="flex flex-col h-full">
         <PlayerTopbar title="BLUEPRINTS" subtitle="Manage your schematics" />

         <div id="cw_bp_layout" className="flex-1 flex overflow-hidden">
            {/* Left Filter Panel */}
            <div id="cw_bp_sidebar" className="w-80 border-r border-cw-border bg-cw-surface-1/30 flex flex-col p-4 gap-4">
                <Input id="inp_search_blueprints" placeholder="Search blueprints..." />
                
                <div id="dd_filter_bp_category" className="bg-cw-bg border border-cw-border rounded-lg p-2 text-sm flex justify-between items-center text-cw-text-secondary cursor-pointer">
                    <span>All Categories</span>
                    <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
                
                <Toggle id="tgl_filter_bp_owned_only" label="Owned Only" />
            </div>

            {/* Right Grid */}
            <div id="cw_bp_grid_panel" className="flex-1 flex flex-col bg-cw-bg p-6 overflow-y-auto">
               <h2 id="txt_bp_title" className="text-2xl font-bold mb-6 text-cw-text-primary">Blueprints Library</h2>
               
               <div id="lst_blueprints" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {BLUEPRINTS.map(bp => (
                     <Card key={bp.id} id={`card_blueprint__${bp.id}`} className="flex flex-col overflow-hidden transition-all hover:border-cw-primary/50 group">
                        <div className="aspect-video bg-cw-surface-2 relative flex items-center justify-center p-6">
                            <FileText className="w-16 h-16 text-cw-text-muted opacity-20 group-hover:opacity-100 group-hover:text-cw-primary transition-all duration-300 transform group-hover:scale-110" />
                            <div id="img_bp_icon" className="absolute inset-0" />
                        </div>
                        <div className="p-4 flex flex-col gap-2 flex-1">
                           <div className="flex justify-between items-start">
                              <h3 id="txt_bp_name" className="font-bold text-lg">{bp.name}</h3>
                              <Badge id="badge_bp_rarity" className={bp.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}>
                                 {bp.rarity}
                              </Badge>
                           </div>
                           <p id="txt_bp_desc_short" className="text-sm text-cw-text-muted line-clamp-2">{bp.desc}</p>
                           
                           <div className="mt-auto pt-4 flex items-center justify-between">
                              <Badge id="badge_bp_status" variant={bp.owned ? "success" : "secondary"}>
                                 {bp.owned ? "OWNED" : "MISSING"}
                              </Badge>
                              <Button id="btn_bp_select" size="sm" variant="minimal">Details</Button>
                           </div>
                        </div>
                     </Card>
                  ))}
               </div>
               
               {/* Detail modal trigger (hidden/placeholder) */}
               <div className="mt-8 flex justify-center">
                  <Button id="btn_bp_open_details_modal" variant="ghost">Open Details (Debug)</Button>
               </div>
            </div>
         </div>
       </div>
    </div>
  );
};
