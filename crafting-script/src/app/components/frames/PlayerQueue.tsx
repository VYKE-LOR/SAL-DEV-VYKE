import React from 'react';
import { PlayerTopbar } from '../shared/PlayerTopbar';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { QUEUE } from '../../data/mockData';
import { Clock, Play, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PlayerQueueProps {
  frameId: string;
}

export const PlayerQueue: React.FC<PlayerQueueProps> = ({ frameId }) => {
  return (
    <div id={frameId} className="w-full h-full bg-cw-bg text-cw-text-primary overflow-hidden flex flex-col font-sans">
       <div id="cw_queue_root" className="flex flex-col h-full">
         <PlayerTopbar title="CRAFTING QUEUE" subtitle="Current Production" />

         <div id="cw_queue_panel" className="flex-1 flex flex-col p-8 max-w-5xl mx-auto w-full">
             <div className="flex items-center justify-between mb-8">
                 <h2 id="txt_queue_title" className="text-3xl font-bold">Production Line</h2>
                 
                 <div id="cw_queue_summary" className="flex gap-6 bg-cw-surface-1 px-6 py-3 rounded-xl border border-cw-border">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-cw-text-muted uppercase tracking-wider">In Progress</span>
                        <span id="txt_queue_in_progress" className="text-xl font-bold text-cw-primary">2 Item(s)</span>
                    </div>
                    <div className="w-px h-10 bg-cw-border" />
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-cw-text-muted uppercase tracking-wider">Ready to Claim</span>
                        <span id="txt_queue_ready" className="text-xl font-bold text-cw-success">1 Item(s)</span>
                    </div>
                 </div>
             </div>

             <div id="lst_queue" className="flex flex-col gap-4">
                {QUEUE.map(item => (
                   <Card key={item.id} id={`row_queue__${item.id}`} className="p-4 flex items-center gap-6 group hover:border-cw-primary/30 transition-all">
                       <div id="img_queue_item_icon" className="w-16 h-16 rounded-lg bg-cw-surface-2 border border-cw-border flex-shrink-0" />
                       
                       <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                           <div className="col-span-4">
                               <h3 id="txt_queue_recipe_name" className="font-bold text-lg text-cw-text-primary">{item.name}</h3>
                               <span id="txt_queue_amount" className="text-sm text-cw-text-secondary">Amount: x{item.amount}</span>
                           </div>
                           
                           <div className="col-span-4 flex flex-col gap-2">
                               <div className="flex justify-between items-end text-xs">
                                   <Badge 
                                     id="badge_queue_status" 
                                     variant={item.status === 'ready' ? 'success' : item.status === 'progress' ? 'primary' : 'secondary'}
                                     className="uppercase"
                                   >
                                      {item.status === 'progress' ? 'In Progress' : item.status}
                                   </Badge>
                                   <span id="txt_queue_time_left" className="font-mono text-cw-text-muted">{item.time}</span>
                               </div>
                               <div className="h-2 w-full bg-cw-bg rounded-full overflow-hidden border border-cw-border/50">
                                   <div 
                                      id="prg_queue_item" 
                                      className={cn(
                                          "h-full transition-all duration-1000 ease-out",
                                          item.status === 'ready' ? "bg-cw-success" : "bg-cw-primary"
                                      )}
                                      style={{ width: `${item.progress}%` }}
                                   />
                               </div>
                           </div>

                           <div className="col-span-4 flex justify-end gap-2">
                               {item.status === 'ready' ? (
                                   <Button id="btn_queue_claim" variant="primary" className="shadow-lg shadow-cw-success/20 bg-cw-success hover:bg-cw-success/90 text-cw-bg font-bold">
                                       Claim Item
                                   </Button>
                               ) : (
                                   <>
                                     <Button id="btn_queue_details" variant="minimal" size="sm">Details</Button>
                                     <Button id="btn_queue_cancel" variant="danger" size="icon" className="w-9 h-9 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <X className="w-4 h-4" />
                                     </Button>
                                   </>
                               )}
                           </div>
                       </div>
                   </Card>
                ))}
             </div>
         </div>
       </div>
    </div>
  );
};
