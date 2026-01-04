import React, { useMemo } from 'react';
import { AdminTopbar } from '../shared/AdminTopbar';
import { AdminNav } from '../shared/AdminNav';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Plus, RefreshCw, X, MapPin, Edit, Trash2, Crosshair } from 'lucide-react';
import { useNui } from '../../state/nuiStore';

interface AdminBenchLocationsProps {
  frameId: string;
}

export const AdminBenchLocations: React.FC<AdminBenchLocationsProps> = ({ frameId }) => {
  const { state } = useNui();
  const benchLocations = useMemo(() => {
    const snapshotLocations = state.snapshot.benchLocations;
    if (Array.isArray(snapshotLocations)) {
      return snapshotLocations;
    }
    if (snapshotLocations && typeof snapshotLocations === 'object') {
      return Object.values(snapshotLocations);
    }
    return [];
  }, [state.snapshot.benchLocations]);

  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="ad_root" className="flex flex-col h-full">
          <AdminTopbar />
          
          <div className="flex flex-1 overflow-hidden">
             <AdminNav activePage="benchLocations" onNavigate={() => {}} />
             
             <div id="ad_content" className="flex-1 flex p-8 gap-8 overflow-hidden">
                 {/* Left List Panel */}
                 <div className="flex-1 flex flex-col gap-6">
                     <div className="flex justify-between items-center">
                        <h2 id="txt_benchLocations_title" className="font-bold text-2xl">Bench Locations Manager</h2>
                        <div className="flex gap-2">
                           <Button id="btn_benchLocation_add" size="sm" variant="primary" className="gap-2"><Plus className="w-4 h-4"/> Add New</Button>
                           <Button id="btn_benchLocation_reload" size="sm" variant="secondary" className="gap-2"><RefreshCw className="w-4 h-4"/> Reload</Button>
                           <Button id="btn_benchLocation_close" size="sm" variant="minimal" className="gap-2"><X className="w-4 h-4"/> Close</Button>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <Input id="inp_benchLocation_search" placeholder="Search locations by type or coords..." />
                     </div>
                     
                     <Card id="lst_benchLocations" className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-cw-surface-1/30">
                        {benchLocations.map((location: any) => (
                           <div key={location.id} id={`row_benchLocation__${location.id}`} className="bg-cw-surface-1 p-4 rounded-xl border border-cw-border flex items-center justify-between hover:border-cw-primary/50 transition-colors">
                              <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-3">
                                      <span id="txt_location_benchType" className="font-bold text-cw-text-primary">{location.benchType}</span>
                                      <Badge id="badge_location_portable" variant={location.portable ? "success" : "secondary"}>{location.portable ? "Portable" : "Static"}</Badge>
                                  </div>
                                  <div className="flex gap-4 text-xs text-cw-text-secondary font-mono">
                                     <span id="txt_location_coords">vector3({location.coords?.x}, {location.coords?.y}, {location.coords?.z})</span>
                                     <span id="txt_location_heading">h: {location.heading}</span>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                  <Button id="btn_location_teleport" size="sm" variant="minimal" className="gap-1"><Crosshair className="w-3 h-3"/> TP</Button>
                                  <Button id="btn_location_edit" size="icon" variant="ghost"><Edit className="w-4 h-4"/></Button>
                                  <Button id="btn_location_remove" size="icon" variant="ghost" className="text-cw-error hover:text-cw-error"><Trash2 className="w-4 h-4"/></Button>
                              </div>
                           </div>
                        ))}
                     </Card>
                 </div>

                 {/* Right Map Preview */}
                 <div className="w-[400px] flex flex-col">
                    <Card id="ad_map_preview_card" className="h-[400px] flex flex-col overflow-hidden bg-cw-surface-2 p-0">
                        <div className="p-4 border-b border-cw-border bg-cw-surface-1">
                           <span id="txt_map_preview_title" className="font-bold uppercase tracking-wider text-xs">Preview</span>
                        </div>
                        <div className="flex-1 relative flex items-center justify-center bg-cw-bg/50">
                            <div id="img_map_preview" className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                            <MapPin className="w-8 h-8 text-cw-primary absolute z-10 drop-shadow-[0_0_10px_rgba(122,47,251,0.8)] animate-bounce" />
                        </div>
                    </Card>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};
