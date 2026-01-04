import React, { useMemo } from 'react';
import { AdminTopbar } from '../shared/AdminTopbar';
import { AdminNav } from '../shared/AdminNav';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Card } from '../shared/Card';
import { Toggle } from '../shared/Toggle';
import { Badge } from '../shared/Badge';
import { Plus, Trash2, Save, Hammer, ChevronDown } from 'lucide-react';
import { useNui } from '../../state/nuiStore';

interface AdminBenchTypesProps {
  frameId: string;
}

export const AdminBenchTypes: React.FC<AdminBenchTypesProps> = ({ frameId }) => {
  const { state } = useNui();
  const benchTypes = useMemo(() => {
    const snapshotTypes = state.snapshot.benchTypes;
    if (Array.isArray(snapshotTypes)) {
      return snapshotTypes;
    }
    if (snapshotTypes && typeof snapshotTypes === 'object') {
      return Object.values(snapshotTypes);
    }
    return [
      { id: 'workbench', label: 'Workbench' },
      { id: 'ammo_press', label: 'Ammo Press' },
      { id: 'chem_station', label: 'Chem Station' },
    ];
  }, [state.snapshot.benchTypes]);

  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="ad_root" className="flex flex-col h-full">
          <AdminTopbar />
          
          <div className="flex flex-1 overflow-hidden">
             <AdminNav activePage="benchTypes" onNavigate={() => {}} />
             
             <div id="ad_content" className="flex-1 flex p-8 gap-8 overflow-hidden">
                 {/* Left List */}
                 <div className="w-1/3 flex flex-col gap-4">
                     <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg">Bench Types</h2>
                        <Button id="btn_benchType_add" size="sm" variant="primary" className="gap-2"><Plus className="w-3 h-3"/> Add</Button>
                     </div>
                     <Card id="lst_admin_benchTypes" className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                        {benchTypes.map((type: any) => (
                           <div key={type.id} id={`row_benchType__${type.id}`} className="p-3 flex items-center justify-between rounded-lg hover:bg-cw-surface-2 cursor-pointer border border-transparent hover:border-cw-primary/30 transition-all group">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-cw-bg flex items-center justify-center border border-cw-border">
                                      <Hammer className="w-4 h-4 text-cw-text-secondary"/>
                                  </div>
                                  <span className="font-medium capitalize">{type.label || type.id}</span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="w-4 h-4 text-cw-text-muted hover:text-cw-error" />
                              </div>
                           </div>
                        ))}
                     </Card>
                 </div>

                 {/* Right Editor */}
                 <div className="flex-1 flex flex-col justify-center max-w-2xl overflow-y-auto">
                    <Card className="p-8 flex flex-col gap-6">
                        <h3 className="text-xl font-bold border-b border-cw-border pb-4">Edit Bench Type</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">ID</label>
                                <Input id="inp_benchType_id" defaultValue="workbench" disabled className="opacity-70"/>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Label</label>
                                <Input id="inp_benchType_label" defaultValue="Workbench" />
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Prop Model</label>
                                <Input id="inp_benchType_propModel" defaultValue="gr_prop_gr_bench_02a" />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Icon</label>
                                <Input id="inp_benchType_icon" defaultValue="hammer" />
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Access Mode</label>
                                <div id="dd_benchType_accessMode" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer">
                                      <span>job</span>
                                      <ChevronDown className="w-4 h-4"/>
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Job Name</label>
                                <div id="dd_benchType_jobName" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer">
                                      <span>mechanic</span>
                                      <ChevronDown className="w-4 h-4"/>
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Min Grade</label>
                                <Input id="inp_benchType_minGrade" type="number" defaultValue="0" />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Permission Key</label>
                                <Input id="inp_benchType_permissionKey" placeholder="Optional..." />
                             </div>
                        </div>

                        <Toggle id="chk_benchType_portableAllowed" label="Allow Portable Item Usage" checked />

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cw-border">
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Allowed Categories</label>
                                <div id="dd_benchType_allowedCategories" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2 min-h-[44px] cursor-pointer flex flex-wrap gap-1">
                                    <Badge variant="secondary">tools</Badge>
                                    <Badge variant="secondary">repair</Badge>
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Denied Categories</label>
                                <div id="dd_benchType_deniedCategories" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2 min-h-[44px] cursor-pointer">
                                </div>
                             </div>
                        </div>

                        <div className="flex justify-between mt-4 pt-4 border-t border-cw-border">
                            <Button id="btn_benchType_delete" variant="danger" className="gap-2"><Trash2 className="w-4 h-4"/> Delete Type</Button>
                            <Button id="btn_benchType_save" variant="primary" className="gap-2"><Save className="w-4 h-4"/> Save Changes</Button>
                        </div>
                    </Card>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};
