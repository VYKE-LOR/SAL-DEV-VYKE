import React from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Hammer, HelpCircle, List, FileText, X } from 'lucide-react';

interface PlayerTopbarProps {
  title?: string;
  subtitle?: string;
  benchName?: string;
  benchType?: string;
  benchAccess?: string;
  onClose?: () => void;
  onHelp?: () => void;
  onOpenQueue?: () => void;
  onOpenBlueprints?: () => void;
}

export const PlayerTopbar: React.FC<PlayerTopbarProps> = ({
  title = "CRAFTING",
  subtitle = "Blueprint • Benches • Progression",
  benchName = "Workbench",
  benchType = "BENCH: workbench",
  benchAccess = "Access: Public / Job / Grade",
  onClose,
  onHelp,
  onOpenQueue,
  onOpenBlueprints,
}) => {
  return (
    <div id="cw_topbar" className="h-20 border-b border-cw-border bg-cw-bg flex items-center justify-between px-6 shrink-0 relative z-10">
      {/* Left */}
      <div id="cw_topbar_left" className="flex flex-col">
        <h1 id="txt_app_title" className="text-2xl font-bold tracking-wider text-cw-text-primary">{title}</h1>
        <span id="txt_app_subtitle" className="text-xs text-cw-text-muted uppercase tracking-widest">{subtitle}</span>
      </div>

      {/* Center - Bench Info */}
      <div id="cw_bench_info" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Hammer id="ico_bench" className="w-4 h-4 text-cw-primary" />
          <span id="txt_bench_name" className="text-lg font-semibold text-cw-text-primary">{benchName}</span>
          <div id="chip_bench_type" className="px-2 py-0.5 rounded-full bg-cw-surface-2 border border-cw-border text-[10px] text-cw-text-secondary uppercase">
            {benchType}
          </div>
        </div>
        <span id="txt_bench_access" className="text-xs text-cw-text-muted">{benchAccess}</span>
      </div>

      {/* Right Actions */}
      <div id="cw_topbar_actions" className="flex items-center gap-2">
        <Button id="btn_open_blueprints" variant="minimal" onClick={onOpenBlueprints} className="gap-2">
          <FileText className="w-4 h-4" />
          <span className="hidden xl:inline">Blueprints</span>
        </Button>
        <Button id="btn_open_queue" variant="minimal" onClick={onOpenQueue} className="gap-2">
          <List className="w-4 h-4" />
          <span className="hidden xl:inline">Queue</span>
        </Button>
        <div className="w-px h-8 bg-cw-border mx-2" />
        <Button id="btn_help" variant="ghost" size="icon" onClick={onHelp}>
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button id="btn_close" variant="danger" size="icon" onClick={onClose} className="bg-cw-error/10 text-cw-error hover:bg-cw-error hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
