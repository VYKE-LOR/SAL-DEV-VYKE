import React from 'react';
import { AdminTopbar } from '../shared/AdminTopbar';
import { AdminNav } from '../shared/AdminNav';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Plus, RefreshCw, MapPin } from 'lucide-react';

interface AdminDashboardProps {
  frameId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ frameId }) => {
  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="ad_root" className="flex flex-col h-full">
          <AdminTopbar />
          
          <div className="flex flex-1 overflow-hidden">
             <AdminNav activePage="dashboard" onNavigate={() => {}} />
             
             <div id="ad_content" className="flex-1 p-8 overflow-y-auto">
                 <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                 
                 <div className="grid grid-cols-3 gap-6 mb-8">
                     <Card id="ad_card_recipes_count" className="p-6 bg-gradient-to-br from-cw-surface-1 to-cw-surface-2 border-l-4 border-l-cw-primary">
                        <span className="text-cw-text-secondary uppercase tracking-wider text-xs font-bold">Total Recipes</span>
                        <div id="txt_recipes_count" className="text-4xl font-bold text-cw-primary mt-2">142</div>
                     </Card>
                     <Card id="ad_card_blueprints_count" className="p-6 bg-gradient-to-br from-cw-surface-1 to-cw-surface-2 border-l-4 border-l-cw-secondary">
                        <span className="text-cw-text-secondary uppercase tracking-wider text-xs font-bold">Active Blueprints</span>
                        <div id="txt_blueprints_count" className="text-4xl font-bold text-cw-secondary mt-2">38</div>
                     </Card>
                     <Card id="ad_card_benches_count" className="p-6 bg-gradient-to-br from-cw-surface-1 to-cw-surface-2 border-l-4 border-l-cw-success">
                        <span className="text-cw-text-secondary uppercase tracking-wider text-xs font-bold">Placed Benches</span>
                        <div id="txt_benches_count" className="text-4xl font-bold text-cw-success mt-2">85</div>
                     </Card>
                 </div>

                 <h3 className="text-lg font-bold mb-4 text-cw-text-secondary">Quick Actions</h3>
                 <div className="flex gap-4">
                     <Button id="btn_quick_add_recipe" variant="primary" className="gap-2">
                        <Plus className="w-4 h-4" /> Add Recipe
                     </Button>
                     <Button id="btn_quick_add_benchLocation" variant="secondary" className="gap-2">
                        <MapPin className="w-4 h-4" /> Add Bench Location
                     </Button>
                     <Button id="btn_quick_reload_cache" variant="minimal" className="gap-2 ml-auto">
                        <RefreshCw className="w-4 h-4" /> Reload Cache
                     </Button>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};
