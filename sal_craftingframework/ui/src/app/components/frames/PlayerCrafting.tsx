import React, { useMemo, useState } from 'react';
import { PlayerTopbar } from '../shared/PlayerTopbar';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Toggle } from '../shared/Toggle';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { CATEGORIES, RECIPES, INGREDIENTS } from '../../data/mockData';
import { Search, Filter, Hammer, Clock, Zap, ChevronRight, User, Archive, Layers, Box, Lock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNui } from '../../state/nuiStore';

interface PlayerCraftingProps {
  frameId: string;
  onOpenQueue?: () => void;
  onOpenBlueprints?: () => void;
  onClose?: () => void;
}

export const PlayerCrafting: React.FC<PlayerCraftingProps> = ({ frameId, onOpenQueue, onOpenBlueprints, onClose }) => {
  const { state, actions } = useNui();
  const [activeTab, setActiveTab] = useState('tab_craft');
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const categories = useMemo(() => {
    const snapshotCategories = state.snapshot.categories;
    if (Array.isArray(snapshotCategories) && snapshotCategories.length > 0) {
      return snapshotCategories;
    }
    if (snapshotCategories && typeof snapshotCategories === 'object') {
      return Object.values(snapshotCategories);
    }
    return CATEGORIES;
  }, [state.snapshot.categories]);

  const recipes = useMemo(() => {
    const snapshotRecipes = state.snapshot.recipes;
    if (Array.isArray(snapshotRecipes) && snapshotRecipes.length > 0) {
      return snapshotRecipes;
    }
    if (snapshotRecipes && typeof snapshotRecipes === 'object') {
      return Object.values(snapshotRecipes);
    }
    return RECIPES;
  }, [state.snapshot.recipes]);

  const selected = recipes.find((recipe: any) => recipe.id === selectedRecipe) || recipes[0];
  const ingredients = (selected && selected.ingredients) ? selected.ingredients : INGREDIENTS;

  const xp = state.snapshot.player?.xp ?? state.player?.xp ?? 0;
  const level = state.snapshot.player?.level ?? state.player?.level ?? 1;
  const renderProfile = () => (
    <div id="cmp_cw_profile_panel" className="flex flex-col gap-6 p-8 max-w-4xl mx-auto w-full">
      <Card id="cw_profile_level_card" className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-end">
            <span id="txt_profile_level_label" className="text-cw-text-secondary uppercase tracking-widest text-sm">Crafting Level</span>
            <span id="txt_profile_xp_value" className="text-cw-text-primary font-mono">{xp} XP</span>
        </div>
        <div className="flex items-center gap-4">
             <div className="bg-cw-primary/20 rounded-lg p-3">
                <span id="txt_profile_level_value" className="text-4xl font-bold text-cw-primary">{level}</span>
             </div>
             <div className="flex-1 flex flex-col gap-2">
                 <div className="h-4 bg-cw-surface-2 rounded-full overflow-hidden w-full relative">
                     <div id="prg_profile_xp" className="absolute top-0 left-0 h-full bg-cw-primary w-[60%]"></div>
                 </div>
             </div>
        </div>
      </Card>
      
      <div id="cw_profile_stats" className="grid grid-cols-2 gap-4">
          <Card id="row_profile_stat_01" className="p-6 flex items-center justify-between">
              <span className="text-cw-text-secondary">Total Crafts</span>
              <span id="txt_stat_total_crafts" className="text-2xl font-bold text-cw-text-primary">1,432</span>
          </Card>
          <Card id="row_profile_stat_02" className="p-6 flex items-center justify-between">
              <span className="text-cw-text-secondary">Blueprints Owned</span>
              <span id="txt_stat_blueprints_owned" className="text-2xl font-bold text-cw-text-primary">45</span>
          </Card>
      </div>
    </div>
  );

  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
      <div id="cw_root" className="flex flex-col h-full">
        <PlayerTopbar
          benchName={state.bench?.label || state.bench?.name}
          benchType={state.bench?.benchType ? `BENCH: ${state.bench?.benchType}` : undefined}
          onOpenBlueprints={onOpenBlueprints}
          onOpenQueue={onOpenQueue}
          onClose={onClose}
        />

        {/* Tabs */}
        <div id="cw_tabs" className="h-14 border-b border-cw-border flex items-center px-6 gap-8 bg-cw-surface-1/50">
          <button 
            id="tab_craft" 
            onClick={() => setActiveTab('tab_craft')}
            className={cn("h-full border-b-2 px-2 font-medium transition-colors text-sm uppercase tracking-wide", activeTab === 'tab_craft' ? "border-cw-primary text-cw-primary" : "border-transparent text-cw-text-secondary hover:text-cw-text-primary")}
          >
            Crafting
          </button>
          <button 
            id="tab_blueprints" 
             onClick={() => setActiveTab('tab_blueprints')} // Note: This should ideally navigate to the other frame, but for now just visual tab
            className={cn("h-full border-b-2 px-2 font-medium transition-colors text-sm uppercase tracking-wide", activeTab === 'tab_blueprints' ? "border-cw-primary text-cw-primary" : "border-transparent text-cw-text-secondary hover:text-cw-text-primary")}
          >
            Blueprints
          </button>
           <button 
            id="tab_queue" 
             onClick={() => setActiveTab('tab_queue')}
            className={cn("h-full border-b-2 px-2 font-medium transition-colors text-sm uppercase tracking-wide", activeTab === 'tab_queue' ? "border-cw-primary text-cw-primary" : "border-transparent text-cw-text-secondary hover:text-cw-text-primary")}
          >
            Queue
          </button>
           <button 
            id="tab_profile" 
             onClick={() => setActiveTab('tab_profile')}
            className={cn("h-full border-b-2 px-2 font-medium transition-colors text-sm uppercase tracking-wide", activeTab === 'tab_profile' ? "border-cw-primary text-cw-primary" : "border-transparent text-cw-text-secondary hover:text-cw-text-primary")}
          >
            Profile
          </button>
        </div>

        {activeTab === 'tab_profile' ? renderProfile() : (
        /* Main Layout */
        <div id="cw_layout" className="flex-1 flex overflow-hidden">
          
          {/* A) Left Sidebar */}
          <div id="cw_sidebar" className="w-80 flex-shrink-0 border-r border-cw-border flex flex-col bg-cw-surface-1/30">
            <div id="cw_search" className="p-4 border-b border-cw-border flex gap-2">
              <Input id="inp_search_recipes" placeholder="Search recipes..." className="bg-cw-bg" />
              <Button id="btn_clear_search" variant="minimal" size="icon"><XCircle className="w-4 h-4"/></Button>
            </div>
            
            <div id="cw_filters" className="p-4 flex flex-col gap-4 border-b border-cw-border">
               {/* Dropdowns mocked as div with select style for now */}
               <div id="dd_filter_category" className="bg-cw-bg border border-cw-border rounded-lg p-2 text-sm flex justify-between items-center text-cw-text-secondary cursor-pointer hover:border-cw-text-muted">
                  <span>All Categories</span>
                  <ChevronRight className="w-4 h-4 rotate-90" />
               </div>
               <div id="dd_filter_benchType" className="bg-cw-bg border border-cw-border rounded-lg p-2 text-sm flex justify-between items-center text-cw-text-secondary cursor-pointer hover:border-cw-text-muted">
                  <span>Current Bench Only</span>
                  <ChevronRight className="w-4 h-4 rotate-90" />
               </div>
               
               <Toggle id="tgl_filter_craftable_only" label="Craftable Only" labelId="txt_filter_craftable_only" />
               <Toggle id="tgl_filter_has_blueprint" label="Has Blueprint" labelId="txt_filter_has_blueprint" />
            </div>

            <div id="cw_categories" className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
               <span id="txt_categories_title" className="text-xs text-cw-text-muted uppercase font-bold mb-2">Categories</span>
               <div id="lst_categories" className="flex flex-col gap-1">
                  {categories.map((cat: any) => (
                    <div 
                      key={cat.id} 
                      id={`row_category__${cat.id}`} 
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-cw-surface-2 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                         <div id="ico_category" className="w-8 h-8 rounded-full bg-cw-bg flex items-center justify-center text-cw-primary border border-cw-border group-hover:border-cw-primary transition-colors">
                            {/* Map icons dynamically or placeholder */}
                            <Box className="w-4 h-4" />
                         </div>
                         <span id="txt_category_name" className="text-sm font-medium text-cw-text-secondary group-hover:text-cw-text-primary">{cat.name || cat.label}</span>
                      </div>
                      <Badge id="badge_category_count" variant="secondary" className="bg-cw-bg">{cat.count ?? 0}</Badge>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* B) Center List */}
          <div id="cw_recipe_list_panel" className="flex-1 flex flex-col border-r border-cw-border min-w-[400px]">
            <div id="cw_recipe_list_header" className="h-16 border-b border-cw-border flex items-center justify-between px-6 bg-cw-surface-1/30">
               <div>
                  <h2 id="txt_recipes_title" className="text-lg font-bold text-cw-text-primary">Recipes</h2>
                  <p id="txt_recipes_subtitle" className="text-xs text-cw-text-muted">Select a recipe to view details</p>
               </div>
               <div id="dd_sort_recipes" className="flex items-center gap-2 text-sm text-cw-text-secondary cursor-pointer">
                  <span>Sort</span>
                  <ChevronRight className="w-4 h-4 rotate-90" />
               </div>
            </div>

            <div id="lst_recipes" className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-3 content-start">
               {recipes.map((recipe: any) => (
                 <Card 
                   key={recipe.id} 
                   id={`card_recipe__${recipe.id}`} 
                   className={cn(
                     "p-4 flex gap-4 cursor-pointer transition-all border-cw-border hover:border-cw-primary/50",
                     selectedRecipe === recipe.id ? "bg-cw-surface-2 border-cw-primary" : "bg-cw-surface-1"
                   )}
                   onClick={() => setSelectedRecipe(recipe.id)}
                 >
                    <div id="cw_recipe_icon_wrap" className="w-16 h-16 rounded-xl bg-cw-bg border border-cw-border flex items-center justify-center shrink-0">
                       <div id="img_recipe_icon" className="w-10 h-10 bg-cw-surface-2 rounded-lg" />
                    </div>
                    
                    <div id="cw_recipe_meta" className="flex-1 min-w-0 flex flex-col gap-1">
                       <h3 id="txt_recipe_name" className="font-bold text-cw-text-primary truncate">{recipe.name}</h3>
                       <p id="txt_recipe_desc_short" className="text-xs text-cw-text-muted truncate">{recipe.desc}</p>
                       <div id="cw_recipe_chips" className="flex gap-2 mt-1">
                          <Badge id="chip_recipe_category" variant="outline" className="text-[10px] py-0 h-5">{recipe.category || recipe.categoryId}</Badge>
                          {(recipe.level || recipe.levelRequirement || 1) > 1 && <Badge id="badge_level_req" variant="secondary" className="text-[10px] py-0 h-5">LVL {recipe.level || recipe.levelRequirement}</Badge>}
                          {recipe.blueprintRequired && <Badge id="badge_blueprint_req" variant="warning" className="text-[10px] py-0 h-5">BP REQUIRED</Badge>}
                        </div>
                    </div>

                    <div id="cw_recipe_status" className="w-32 flex flex-col justify-between items-end pl-2 border-l border-cw-border/50">
                        <div className="w-full text-right">
                           <span id="txt_materials_status" className="text-[10px] text-cw-text-secondary mb-1 block">{recipe.materialsStatus || ''} materials</span>
                           <div className="h-1.5 w-full bg-cw-bg rounded-full overflow-hidden">
                              <div id="prg_materials" className="h-full bg-cw-success transition-all" style={{ width: `${recipe.materialsProgress || 0}%` }}></div>
                           </div>
                        </div>
                        <Button id="btn_select_recipe" size="sm" variant={selectedRecipe === recipe.id ? "primary" : "minimal"} className="h-7 text-xs px-3">
                           Details
                        </Button>
                    </div>
                 </Card>
               ))}
            </div>
          </div>

          {/* C) Right Detail Panel */}
          <div id="cw_recipe_detail_panel" className="w-[480px] flex-shrink-0 bg-cw-surface-1/50 flex flex-col overflow-y-auto">
             {!selectedRecipe ? (
               <div id="cw_detail_empty_state" className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <div className="w-20 h-20 rounded-full bg-cw-surface-2 mb-4 flex items-center justify-center">
                    <Layers className="w-10 h-10 text-cw-text-muted" />
                  </div>
                  <h3 id="txt_detail_empty_title" className="text-xl font-bold text-cw-text-primary mb-2">No recipe selected</h3>
                  <p id="txt_detail_empty_hint" className="text-cw-text-muted">Choose a recipe from the list to view details.</p>
               </div>
             ) : (
               <div id="cw_detail_content" className="flex flex-col h-full">
                  {/* Header */}
                  <div id="cw_detail_header" className="p-6 border-b border-cw-border bg-gradient-to-b from-cw-surface-2/50 to-transparent">
                     <div className="flex gap-5">
                        <div id="img_detail_icon" className="w-24 h-24 rounded-2xl bg-cw-bg border border-cw-border shadow-lg flex-shrink-0" />
                        <div className="flex flex-col gap-2">
                           <h2 id="txt_detail_recipe_name" className="text-2xl font-bold text-cw-text-primary">{selected?.name}</h2>
                           <p id="txt_detail_recipe_desc" className="text-sm text-cw-text-secondary leading-relaxed">{selected?.desc}</p>
                        </div>
                     </div>
                     <div id="cw_detail_badges" className="flex flex-wrap gap-2 mt-4">
                        <Badge id="badge_detail_level_req" variant="secondary">LEVEL {selected?.level || selected?.levelRequirement || 1} REQUIRED</Badge>
                        {selected?.blueprintRequired && <Badge id="badge_detail_blueprint_req" variant="warning">BLUEPRINT REQUIRED</Badge>}
                        <Badge id="badge_detail_time" variant="outline" className="gap-1"><Clock className="w-3 h-3"/> {selected?.craftTime || 0}s</Badge>
                        <Badge id="badge_detail_xp" variant="primary" className="gap-1"><Zap className="w-3 h-3"/> +{selected?.xpReward || 0} XP</Badge>
                     </div>
                  </div>

                  <div className="p-6 flex flex-col gap-6">
                     {/* Blueprint Card */}
                     <Card id="cw_blueprint_card" className="p-4 flex items-center justify-between border-l-4 border-l-cw-warning bg-cw-warning/5">
                        <div className="flex flex-col">
                           <span id="txt_blueprint_title" className="text-xs uppercase font-bold text-cw-warning tracking-wider">Blueprint</span>
                           <span id="txt_blueprint_status" className="font-bold text-cw-text-primary">Unlocked</span>
                        </div>
                        <Button id="btn_view_blueprint" size="sm" variant="minimal">View</Button>
                     </Card>

                     {/* Ingredients */}
                     <Card id="cw_ingredients_card" className="p-0 overflow-hidden">
                        <div className="px-4 py-3 border-b border-cw-border bg-cw-surface-2/30">
                           <span id="txt_ingredients_title" className="font-bold text-sm uppercase tracking-wide">Ingredients</span>
                        </div>
                        <div id="lst_ingredients" className="divide-y divide-cw-border/50">
                           {ingredients.map((ing: any) => (
                              <div key={ing.id || ing.item} id={`row_ingredient__${ing.id || ing.item}`} className="flex items-center justify-between p-3 hover:bg-cw-surface-2/30">
                                 <div className="flex items-center gap-3">
                                    <div id="img_ingredient_icon" className="w-8 h-8 rounded bg-cw-bg border border-cw-border" />
                                    <div className="flex flex-col">
                                       <span id="txt_ingredient_label" className="text-sm font-medium text-cw-text-primary">{ing.name || ing.item}</span>
                                       <span className="text-[10px] text-cw-text-muted">
                                          <span id="txt_ingredient_required">Required: {ing.required || ing.amount}</span> • <span id="txt_ingredient_have" className={(ing.have || 0) < (ing.required || ing.amount) ? "text-cw-error" : "text-cw-success"}>Have: {ing.have || 0}</span>
                                       </span>
                                    </div>
                                 </div>
                                 <div id="ico_ingredient_status">
                                    {ing.ok ? <CheckCircle className="w-5 h-5 text-cw-success" /> : <XCircle className="w-5 h-5 text-cw-error" />}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </Card>

                     {/* Outputs */}
                     <Card id="cw_outputs_card" className="p-0 overflow-hidden">
                        <div className="px-4 py-3 border-b border-cw-border bg-cw-surface-2/30">
                           <span id="txt_outputs_title" className="font-bold text-sm uppercase tracking-wide">Output</span>
                        </div>
                        <div id="lst_outputs" className="p-3">
                           <div id={`row_output__${selected?.output?.item || 'output'}`} className="flex items-center gap-3">
                               <div id="img_output_icon" className="w-10 h-10 rounded-lg bg-cw-bg border border-cw-border" />
                               <div className="flex flex-col">
                                  <span id="txt_output_label" className="font-bold text-cw-text-primary">{selected?.output?.item || 'Output'}</span>
                                  <span id="txt_output_amount" className="text-xs text-cw-text-secondary">x{selected?.output?.amount || 1}</span>
                               </div>
                           </div>
                        </div>
                     </Card>

                     {/* Craft Controls */}
                     <Card id="cw_craft_controls_card" className="mt-auto p-4 bg-cw-surface-2 border-cw-primary/30 shadow-[0_0_20px_rgba(122,47,251,0.1)]">
                        <div className="flex justify-between items-center mb-4">
                           <span id="txt_craft_controls_title" className="font-bold text-lg text-cw-primary">Craft</span>
                           <span id="txt_craft_time" className="text-sm font-mono text-cw-text-secondary">Time: {selected?.craftTime || 0}s</span>
                        </div>
                        
                        <div id="cw_amount_stepper" className="flex items-center justify-between bg-cw-bg rounded-lg p-1 border border-cw-border mb-4">
                           <Button id="btn_amount_minus" variant="ghost" size="sm" className="h-8 w-8 rounded">-</Button>
                           <span id="txt_amount_value" className="font-mono font-bold text-lg">1</span>
                           <div className="flex gap-1">
                              <Button id="btn_amount_plus" variant="ghost" size="sm" className="h-8 w-8 rounded">+</Button>
                              <Button id="btn_amount_max" variant="minimal" size="sm" className="h-8 text-[10px] px-2 uppercase">Max</Button>
                           </div>
                        </div>

                        <div id="cw_craft_buttons" className="grid grid-cols-2 gap-3 mb-2">
                           <Button id="btn_craft_queue" variant="secondary" className="w-full" onClick={() => selected && actions.queueAdd(selected.id, 1, state.bench?.locationId)}>Add to Queue</Button>
                           <Button id="btn_craft_start" variant="primary" className="w-full shadow-lg shadow-cw-primary/20" onClick={() => selected && actions.craftNow(selected.id, 1, state.bench?.locationId)}>Craft Now</Button>
                        </div>
                        
                        <div className="flex justify-center">
                            <Button id="btn_craft_cancel" variant="ghost" size="sm" disabled className="text-xs text-cw-error hover:bg-cw-error/10">Cancel</Button>
                        </div>

                        <div id="txt_craft_validation" className="mt-3 text-center text-xs text-cw-warning bg-cw-warning/10 py-1 rounded">
                           Warning: Low durability materials
                        </div>
                     </Card>
                  </div>
               </div>
             )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
