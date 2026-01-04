import React, { useMemo } from 'react';
import { AdminTopbar } from '../shared/AdminTopbar';
import { AdminNav } from '../shared/AdminNav';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Card } from '../shared/Card';
import { Plus, Trash2, Save, Box } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';
import { useNui } from '../../state/nuiStore';

interface AdminCategoriesProps {
  frameId: string;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ frameId }) => {
  const { state } = useNui();
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

  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="ad_root" className="flex flex-col h-full">
          <AdminTopbar />
          
          <div className="flex flex-1 overflow-hidden">
             <AdminNav activePage="categories" onNavigate={() => {}} />
             
             <div id="ad_content" className="flex-1 flex p-8 gap-8 overflow-hidden">
                 {/* Left List */}
                 <div className="w-1/3 flex flex-col gap-4">
                     <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg">Categories</h2>
                        <Button id="btn_category_add" size="sm" variant="primary" className="gap-2"><Plus className="w-3 h-3"/> Add</Button>
                     </div>
                     <Card id="lst_admin_categories" className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                        {categories.map((cat: any) => (
                           <div key={cat.id} id={`row_category__${cat.id}`} className="p-3 flex items-center justify-between rounded-lg hover:bg-cw-surface-2 cursor-pointer border border-transparent hover:border-cw-primary/30 transition-all group">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-cw-bg flex items-center justify-center border border-cw-border">
                                      <Box className="w-4 h-4 text-cw-text-secondary"/>
                                  </div>
                                  <span className="font-medium">{cat.name || cat.label}</span>
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
                        <h3 className="text-xl font-bold border-b border-cw-border pb-4">Edit Category</h3>
                        
                        <div>
                            <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">ID</label>
                            <Input id="inp_category_id" defaultValue="weapons" disabled className="opacity-70"/>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Label</label>
                            <Input id="inp_category_label" defaultValue="Weapons" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Icon Key</label>
                                <Input id="inp_category_icon" defaultValue="sword" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Sort Order</label>
                                <Input id="inp_category_sortOrder" type="number" defaultValue="1" />
                            </div>
                        </div>

                        <div className="flex justify-between mt-4 pt-4 border-t border-cw-border">
                            <Button id="btn_category_delete" variant="danger" className="gap-2"><Trash2 className="w-4 h-4"/> Delete Category</Button>
                            <Button id="btn_category_save" variant="primary" className="gap-2"><Save className="w-4 h-4"/> Save Changes</Button>
                        </div>
                    </Card>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};
