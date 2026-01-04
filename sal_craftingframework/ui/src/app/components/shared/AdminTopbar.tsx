import React from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';

interface AdminTopbarProps {
  onClose?: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onClose }) => {
  return (
    <div id="ad_topbar" className="h-16 bg-cw-surface-1 border-b border-cw-border flex items-center justify-between px-6 shrink-0">
       <span id="txt_admin_title" className="font-bold text-cw-text-primary tracking-widest">CRAFTING ADMIN</span>
       <Button id="btn_admin_close" variant="danger" size="icon" onClick={onClose} className="w-8 h-8">
          <X className="w-4 h-4" />
       </Button>
    </div>
  );
};
