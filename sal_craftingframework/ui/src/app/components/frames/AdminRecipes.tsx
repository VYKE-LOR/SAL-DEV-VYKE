import React, { useMemo } from 'react';
import { AdminTopbar } from '../shared/AdminTopbar';
import { AdminNav } from '../shared/AdminNav';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Badge } from '../shared/Badge';
import { Card } from '../shared/Card';
import { Toggle } from '../shared/Toggle';
import { Search, Plus, Trash2, Copy, Save, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { useNui } from '../../state/nuiStore';

interface AdminRecipesProps {
  frameId: string;
}

export const AdminRecipes: React.FC<AdminRecipesProps> = ({ frameId }) => {
  const { state } = useNui();
  const recipes = useMemo(() => {
    const snapshotRecipes = state.snapshot.recipes;
    if (Array.isArray(snapshotRecipes) && snapshotRecipes.length > 0) {
      return snapshotRecipes;
    }
    if (snapshotRecipes && typeof snapshotRecipes === 'object') {
      return Object.values(snapshotRecipes);
    }
    return [
      { id: 'assault_rifle', name: 'Assault Rifle', category: 'Weapons', level: 3 },
      { id: 'pistol_ammo', name: 'Pistol Ammo', category: 'Ammo', level: 1 },
      { id: 'bandage', name: 'Bandage', category: 'Medical', level: 1 },
    ];
  }, [state.snapshot.recipes]);

  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="ad_root" className="flex flex-col h-full">
          <AdminTopbar />
          
          <div className="flex flex-1 overflow-hidden">
             <AdminNav activePage="recipes" onNavigate={() => {}} />
             
             <div id="ad_content" className="flex-1 flex overflow-hidden">
                <div id="ad_split_layout" className="w-full h-full flex">
                   
                   {/* Left List Panel */}
                   <div id="ad_list_panel" className="w-80 border-r border-cw-border bg-cw-surface-1/30 flex flex-col">
                      <div className="p-4 border-b border-cw-border flex gap-2">
                         <Input id="inp_admin_recipe_search" placeholder="Search recipes..." className="bg-cw-bg" />
                         <Button id="btn_admin_recipe_add" size="icon" variant="primary"><Plus className="w-4 h-4"/></Button>
                      </div>
                      
                      <div id="lst_admin_recipes" className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                         {recipes.map((recipe: any, i: number) => (
                            <div key={recipe.id || i} id={`row_admin_recipe__${recipe.id || i}`} className="p-3 rounded-lg hover:bg-cw-surface-2 group cursor-pointer border border-transparent hover:border-cw-primary/30 transition-all">
                               <div className="flex justify-between items-start mb-1">
                                  <span id="txt_admin_recipe_name" className="font-bold text-sm text-cw-text-primary">{recipe.name}</span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button id="btn_admin_recipe_edit" size="icon" variant="ghost" className="h-6 w-6"><Edit className="w-3 h-3"/></Button>
                                      <Button id="btn_admin_recipe_delete" size="icon" variant="ghost" className="h-6 w-6 text-cw-error hover:text-cw-error"><Trash2 className="w-3 h-3"/></Button>
                                  </div>
                               </div>
                               <div className="flex gap-1">
                                  <Badge id="badge_admin_recipe_category" variant="outline" className="text-[10px] py-0">{recipe.category || recipe.categoryId}</Badge>
                                  <Badge id="badge_admin_recipe_level" variant="secondary" className="text-[10px] py-0">Lvl {recipe.level || recipe.levelRequirement || 1}</Badge>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Right Editor Panel */}
                   <div id="ad_editor_panel" className="flex-1 flex flex-col bg-cw-bg overflow-y-auto">
                       <div className="p-6 border-b border-cw-border bg-cw-surface-1/50 sticky top-0 z-10 backdrop-blur-md">
                           <div className="flex justify-between items-center">
                              <span id="txt_admin_editor_title" className="text-xl font-bold">Recipe Editor</span>
                              <div id="ad_save_actions" className="flex gap-2">
                                  <Button id="btn_recipe_delete_current" variant="danger" size="sm" className="mr-4">Delete</Button>
                                  <Button id="btn_recipe_duplicate" variant="secondary" size="sm" className="gap-2"><Copy className="w-3 h-3"/> Duplicate</Button>
                                  <Button id="btn_recipe_save" variant="primary" size="sm" className="gap-2"><Save className="w-3 h-3"/> Save Changes</Button>
                              </div>
                           </div>
                       </div>
                       
                       <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
                           <Card className="p-6 grid grid-cols-2 gap-4">
                               <div className="col-span-2 md:col-span-1">
                                   <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">ID</label>
                                   <Input id="inp_recipe_id" defaultValue="assault_rifle" disabled className="opacity-70" />
                               </div>
                               <div className="col-span-2 md:col-span-1">
                                   <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Label</label>
                                   <Input id="inp_recipe_label" defaultValue="Assault Rifle" />
                               </div>
                               <div className="col-span-2">
                                   <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Description</label>
                                   <textarea id="inp_recipe_description" className="w-full min-h-[80px] rounded-xl border border-cw-border bg-cw-surface-1 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cw-primary text-cw-text-primary" defaultValue="Standard issue automatic rifle." />
                               </div>
                           </Card>
                           
                           <Card className="p-6 grid grid-cols-2 gap-4">
                               <div className="col-span-1">
                                  <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Category</label>
                                  <div id="dd_recipe_categoryId" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer">
                                      <span>Weapons</span>
                                      <ChevronDown className="w-4 h-4"/>
                                  </div>
                               </div>
                               <div className="col-span-1">
                                  <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Craft Time (sec)</label>
                                  <Input id="inp_recipe_craftTimeSec" type="number" defaultValue="45" />
                               </div>
                               <div className="col-span-1">
                                  <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Level Req</label>
                                  <Input id="inp_recipe_levelRequired" type="number" defaultValue="3" />
                               </div>
                               <div className="col-span-1">
                                  <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">XP Reward</label>
                                  <Input id="inp_recipe_xpReward" type="number" defaultValue="120" />
                               </div>
                               
                               <div className="col-span-2 border-t border-cw-border my-2"></div>
                               
                               <div className="col-span-1 flex flex-col gap-2">
                                   <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Bench Types (Allowed)</label>
                                   <div id="dd_recipe_allowedBenchTypes" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2 min-h-[44px] cursor-pointer">
                                      <Badge variant="secondary" className="mr-1">workbench</Badge>
                                      <Badge variant="secondary">advanced_bench</Badge>
                                   </div>
                               </div>
                               <div className="col-span-1 flex flex-col gap-2">
                                   <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Bench Types (Denied)</label>
                                   <div id="dd_recipe_deniedBenchTypes" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2 min-h-[44px] cursor-pointer">
                                   </div>
                               </div>

                               <div className="col-span-2 border-t border-cw-border my-2"></div>

                               <div className="col-span-2 flex items-center gap-6">
                                  <Toggle id="chk_recipe_requiresBlueprint" label="Requires Blueprint" />
                                  
                                  <div className="flex-1">
                                     <div id="dd_recipe_blueprintId" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer opacity-100">
                                         <span>bp_assault_rifle</span>
                                         <ChevronDown className="w-4 h-4"/>
                                     </div>
                                  </div>
                               </div>
                           </Card>

                           <div className="grid grid-cols-2 gap-6">
                               {/* Ingredients Section */}
                               <div id="ad_ingredients_section" className="flex flex-col gap-2">
                                   <div className="flex justify-between items-center">
                                      <h3 className="font-bold text-sm uppercase text-cw-text-secondary">Ingredients</h3>
                                      <Button id="btn_ing_add" size="sm" variant="minimal" className="h-7 text-xs">+ Add</Button>
                                   </div>
                                   <Card className="p-0 overflow-hidden bg-cw-surface-1">
                                       <div id="lst_recipe_ingredients" className="flex flex-col divide-y divide-cw-border/50">
                                          {[0, 1].map(idx => (
                                              <div key={idx} id={`row_recipe_ingredient__${idx}`} className="flex items-center p-2 gap-2">
                                                  <div id={`dd_ing_itemName__${idx}`} className="flex-1 bg-cw-bg border border-cw-border rounded px-2 py-1 text-sm cursor-pointer">steel_ingot</div>
                                                  <input id={`inp_ing_amount__${idx}`} type="number" className="w-16 bg-cw-bg border border-cw-border rounded px-2 py-1 text-sm text-center" defaultValue="10" />
                                                  <Button id={`btn_ing_remove__${idx}`} size="icon" variant="ghost" className="h-7 w-7 text-cw-text-muted hover:text-cw-error"><X className="w-3 h-3"/></Button>
                                              </div>
                                          ))}
                                       </div>
                                   </Card>
                               </div>

                               {/* Outputs Section */}
                               <div id="ad_outputs_section" className="flex flex-col gap-2">
                                   <div className="flex justify-between items-center">
                                      <h3 className="font-bold text-sm uppercase text-cw-text-secondary">Outputs</h3>
                                      <Button id="btn_out_add" size="sm" variant="minimal" className="h-7 text-xs">+ Add</Button>
                                   </div>
                                   <Card className="p-0 overflow-hidden bg-cw-surface-1">
                                       <div id="lst_recipe_outputs" className="flex flex-col divide-y divide-cw-border/50">
                                          {[0].map(idx => (
                                              <div key={idx} id={`row_recipe_output__${idx}`} className="flex items-center p-2 gap-2">
                                                  <div id={`dd_out_itemName__${idx}`} className="flex-1 bg-cw-bg border border-cw-border rounded px-2 py-1 text-sm cursor-pointer">assault_rifle</div>
                                                  <input id={`inp_out_amount__${idx}`} type="number" className="w-16 bg-cw-bg border border-cw-border rounded px-2 py-1 text-sm text-center" defaultValue="1" />
                                                  <Button id={`btn_out_remove__${idx}`} size="icon" variant="ghost" className="h-7 w-7 text-cw-text-muted hover:text-cw-error"><X className="w-3 h-3"/></Button>
                                              </div>
                                          ))}
                                       </div>
                                   </Card>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
