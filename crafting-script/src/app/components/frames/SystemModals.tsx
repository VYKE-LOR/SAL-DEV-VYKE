import React from 'react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Input } from '../shared/Input';
import { FileText, X, AlertTriangle, AlertCircle, Shield, ChevronDown } from 'lucide-react';

interface SystemModalsProps {
  frameId: string;
}

export const SystemModals: React.FC<SystemModalsProps> = ({ frameId }) => {
  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary p-8 overflow-y-auto flex flex-wrap gap-8 font-sans items-start justify-center content-start">
        {/* A) Modal Confirm */}
        <Card id="mdl_confirm" className="w-[400px] p-6 flex flex-col gap-4 shadow-2xl border-cw-primary/30 relative">
            <h3 id="txt_confirm_title" className="text-xl font-bold">Confirm Action</h3>
            <p id="txt_confirm_body" className="text-cw-text-secondary">Are you sure you want to delete this recipe? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
                <Button id="btn_confirm_no" variant="minimal">Cancel</Button>
                <Button id="btn_confirm_yes" variant="primary">Confirm</Button>
            </div>
        </Card>

        {/* B) Modal Error */}
        <Card id="mdl_error" className="w-[400px] p-6 flex flex-col gap-4 shadow-2xl border-cw-error relative bg-cw-surface-1">
            <div className="flex items-center gap-3 text-cw-error">
                <AlertCircle className="w-6 h-6" />
                <h3 id="txt_error_title" className="text-xl font-bold">System Error</h3>
            </div>
            <p id="txt_error_body" className="text-cw-text-secondary">Failed to save changes. Network request timed out. Please try again.</p>
            <div className="flex justify-end mt-4">
                <Button id="btn_error_ok" variant="danger" className="w-full">Dismiss</Button>
            </div>
        </Card>

        {/* C) Modal Recipe Details (Blueprints) */}
        <Card id="mdl_bp_details" className="w-[500px] p-0 flex flex-col shadow-2xl border-cw-border relative overflow-hidden">
             <div className="h-32 bg-cw-surface-2 relative">
                 <div id="img_bp_details_icon" className="absolute -bottom-8 left-6 w-24 h-24 bg-cw-bg rounded-xl border border-cw-border shadow-lg z-10" />
                 <Button id="btn_bp_details_close" size="icon" variant="ghost" className="absolute top-4 right-4 text-cw-text-primary bg-black/20 hover:bg-black/40"><X className="w-4 h-4"/></Button>
             </div>
             <div className="pt-10 px-6 pb-6 flex flex-col gap-3">
                 <div className="flex justify-between items-start">
                    <h3 id="txt_bp_details_title" className="text-2xl font-bold">Assault Rifle BP</h3>
                    <Badge id="badge_bp_details_status" variant="success">OWNED</Badge>
                 </div>
                 <p id="txt_bp_details_desc" className="text-cw-text-secondary">
                     High quality schematic allowing the manufacturing of standard issue Assault Rifles at any advanced workbench.
                 </p>
                 <div className="mt-4 pt-4 border-t border-cw-border flex gap-4 text-sm">
                     <div className="flex flex-col">
                         <span className="text-cw-text-muted text-xs uppercase">Rarity</span>
                         <span className="font-bold text-blue-400">Rare</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-cw-text-muted text-xs uppercase">Uses</span>
                         <span className="font-bold">Unlimited</span>
                     </div>
                 </div>
             </div>
        </Card>

        {/* D) Modal Access Rules */}
        <Card id="mdl_access_rules" className="w-[450px] p-6 flex flex-col gap-6 shadow-2xl border-cw-border relative">
             <div className="flex items-center gap-2 pb-4 border-b border-cw-border">
                 <Shield className="w-5 h-5 text-cw-primary" />
                 <h3 className="text-lg font-bold">Access Configuration</h3>
             </div>
             
             <div className="flex flex-col gap-4">
                 <div>
                    <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Access Mode</label>
                    <div id="dd_access_mode" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer">
                          <span>Job Restricted</span>
                          <ChevronDown className="w-4 h-4"/>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Job</label>
                    <div id="dd_access_job" className="bg-cw-surface-1 border border-cw-border rounded-xl p-2.5 flex justify-between items-center text-sm cursor-pointer">
                          <span>police</span>
                          <ChevronDown className="w-4 h-4"/>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Min Grade</label>
                    <Input id="inp_access_minGrade" type="number" defaultValue="2" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-cw-text-secondary uppercase mb-1 block">Specific Permission</label>
                    <Input id="inp_access_permissionKey" placeholder="police.armory.access" />
                 </div>
             </div>
             
             <div className="flex justify-end gap-3 mt-2">
                 <Button id="btn_access_cancel" variant="minimal">Cancel</Button>
                 <Button id="btn_access_save" variant="primary">Save Configuration</Button>
             </div>
        </Card>
    </div>
  );
};
