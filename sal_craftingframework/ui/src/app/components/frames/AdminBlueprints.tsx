import React, { useMemo } from 'react';
import { AdminTopbar } from '../shared/AdminTopbar';
import { AdminNav } from '../shared/AdminNav';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Card } from '../shared/Card';
import { Toggle } from '../shared/Toggle';
import { Plus, Trash2, Save, FileText, ChevronDown } from 'lucide-react';
import { BLUEPRINTS } from '../../data/mockData';
import { useNui } from '../../state/nuiStore';

interface AdminBlueprintsProps {
  frameId: string;
}

export const AdminBlueprints: React.FC<AdminBlueprintsProps> = ({ frameId }) => {
  const { state } = useNui();
  const blueprints = useMemo(() => {
    const snapshotBlueprints = state.snapshot.blueprints;
    if (Array.isArray(snapshotBlueprints) && snapshotBlueprints.length > 0) {
      return snapshotBlueprints;
    }
    if (snapshotBlueprints && typeof snapshotBlueprints === 'object') {
      return Object.values(snapshotBlueprints);
    }
    return BLUEPRINTS;
  }, [state.snapshot.blueprints]);

  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="ad_root" className="flex flex-col h-full">
          <AdminTopbar />
          
          <div className="flex flex-1 overflow-hidden">
             <AdminNav activePage="blueprints" onNavigate={() => {}} />
             
             <div id="ad_content" className="flex-1 flex p-8 gap-8 overflow-hidden">
                 {/* Left List */}
                 <div className="w-1/3 flex flex-col gap-4">
                     <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg">Blueprints</h2>
                        <Button id="btn_blueprint_add" size="sm" variant="primary" className="gap-2"><Plus className="w-3 h-3"/> Add</Button>
                     </div>
                     <Card id="lst_admin_blueprints" className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                        {blueprints.map((bp: any) => (
                           <div key={bp.id} id={`row_admin_blueprint__${bp.id}`} className="p-3 flex items-center justify-between rounded-lg hover:bg-cw-surface-2 cursor-pointer border border-transparent hover:border-cw-primary/30 transition-all group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 rounded bg-cw-bg flex items-center justify-center border border-cw-border shrink-0">
                                      <FileText className="w-4 h-4 text-cw-text-secondary"/>
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                      <span className="font-medium truncate">{bp.name}</span>
                                      <span className="text-[10px] text-cw-text-muted uppercase tracking-wider">{bp.rarity}</span>
                                  </div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="w-4 h-4 text-cw-text-muted hover:text-cw-error" />
                              </div>
                           </div>
                        ))}
                     </Card>
                 </div>

                 {/* Right Editor */}
                 <div className="flex-1 flex flex-col justify-center max-w-xl">
                    <Card className="p-8 flex flex-col gap-6">
                        <h3 className="text-xl font-bold border-b border-cw-border pb-4">Edit Blueprint</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">ID</label>
                            <Input id="inp_blueprint_id" defaultValue="bp_ar" disabled className="opacity-70"/>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Label</label>
                            <Input id="inp_blueprint_label" defaultValue="Assault Rifle BP" />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Description</label>
                            <textarea id="inp_blueprint_desc" className="w-full min-h-[80px] rounded-xl border border-cw-border bg-cw-surface-1 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cw-primary text-cw-text-primary" defaultValue="Schematics for AR manufacturing" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Target Recipe</label>
                                <div id="dd_blueprint_recipeId" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer">
                                      <span>assault_rifle</span>
                                      <ChevronDown className="w-4 h-4"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Rarity</label>
                                <div id="dd_blueprint_rarity" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer">
                                      <span>rare</span>
                                      <ChevronDown className="w-4 h-4"/>
                                </div>
                            </div>
                        </div>

                        <div className="mt-2">
                             <Toggle id="chk_blueprint_tradeable" label="Tradeable" checked />
                        </div>

                        <div className="flex justify-between mt-4 pt-4 border-t border-cw-border">
                            <Button id="btn_blueprint_delete" variant="danger" className="gap-2"><Trash2 className="w-4 h-4"/> Delete</Button>
                            <Button id="btn_blueprint_save" variant="primary" className="gap-2"><Save className="w-4 h-4"/> Save Changes</Button>
                        </div>
                    </Card>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};
