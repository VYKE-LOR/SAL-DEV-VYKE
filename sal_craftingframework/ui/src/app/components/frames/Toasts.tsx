import React from 'react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { CheckCircle, AlertTriangle, XCircle, X, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastsProps {
  frameId: string;
}

export const Toasts: React.FC<ToastsProps> = ({ frameId }) => {
  const examples = [
    { type: 'success', title: 'Crafting Complete', body: 'Successfully crafted 1x Assault Rifle', icon: CheckCircle },
    { type: 'warning', title: 'Low Materials', body: 'You are running low on Steel Ingots', icon: AlertTriangle },
    { type: 'error', title: 'Crafting Failed', body: 'Inventory full. Cannot claim item.', icon: XCircle },
    { type: 'info', title: 'New Blueprint', body: 'You unlocked: SMG Blueprint', icon: Info },
  ];

  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary p-8 font-sans flex items-center justify-center bg-opacity-50">
        <div id="cmp_toast_container" className="flex flex-col gap-4 w-[350px]">
           {examples.map((toast) => (
               <div 
                  key={toast.type} 
                  id={`toast__${toast.type}`}
                  className={cn(
                      "relative overflow-hidden rounded-lg shadow-lg border-l-4 p-4 flex gap-3 bg-cw-surface-1",
                      toast.type === 'success' ? "border-l-cw-success" :
                      toast.type === 'warning' ? "border-l-cw-warning" :
                      toast.type === 'error' ? "border-l-cw-error" :
                      "border-l-cw-primary"
                  )}
               >
                   <div id="ico_toast" className={cn(
                       "mt-0.5",
                       toast.type === 'success' ? "text-cw-success" :
                       toast.type === 'warning' ? "text-cw-warning" :
                       toast.type === 'error' ? "text-cw-error" :
                       "text-cw-primary"
                   )}>
                       <toast.icon className="w-5 h-5" />
                   </div>
                   <div className="flex-1 pr-6">
                       <h4 id="txt_toast_title" className="font-bold text-sm mb-1">{toast.title}</h4>
                       <p id="txt_toast_body" className="text-xs text-cw-text-secondary">{toast.body}</p>
                   </div>
                   <Button id="btn_toast_close" size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-cw-text-muted hover:text-cw-text-primary">
                       <X className="w-3 h-3" />
                   </Button>
               </div>
           ))}
        </div>
    </div>
  );
};
