import React from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { Book, Grid, FileText, Hammer, MapPin, Settings } from 'lucide-react';

interface AdminNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const AdminNav: React.FC<AdminNavProps> = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: 'btn_nav_recipes', label: 'Recipes', icon: Book, page: 'recipes' },
    { id: 'btn_nav_categories', label: 'Categories', icon: Grid, page: 'categories' },
    { id: 'btn_nav_blueprints', label: 'Blueprints', icon: FileText, page: 'blueprints' },
    { id: 'btn_nav_benchTypes', label: 'Bench Types', icon: Hammer, page: 'benchTypes' },
    { id: 'btn_nav_benchLocations', label: 'Locations', icon: MapPin, page: 'benchLocations' },
    { id: 'btn_nav_settings', label: 'Settings', icon: Settings, page: 'settings' },
  ];

  return (
    <div id="ad_nav" className="w-64 bg-cw-surface-1 border-r border-cw-border flex flex-col p-4 gap-2 shrink-0">
       {navItems.map(item => (
         <button
           key={item.id}
           id={item.id}
           onClick={() => onNavigate(item.page)}
           className={cn(
             "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
             activePage === item.page 
               ? "bg-cw-primary/10 text-cw-primary border border-cw-primary/20" 
               : "text-cw-text-secondary hover:bg-cw-surface-2 hover:text-cw-text-primary border border-transparent"
           )}
         >
           <item.icon className="w-4 h-4" />
           {item.label}
         </button>
       ))}
    </div>
  );
};
