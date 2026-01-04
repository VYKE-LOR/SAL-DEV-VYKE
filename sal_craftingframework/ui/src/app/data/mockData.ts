export const CATEGORIES = [
  { id: 'weapons', name: 'Weapons', count: 12, icon: 'sword' },
  { id: 'ammo', name: 'Ammo', count: 5, icon: 'disc' },
  { id: 'tools', name: 'Tools', count: 8, icon: 'hammer' },
  { id: 'medical', name: 'Medical', count: 4, icon: 'plus' },
  { id: 'electronics', name: 'Electronics', count: 15, icon: 'cpu' },
];

export const RECIPES = [
  {
    id: 'assault_rifle',
    name: 'Assault Rifle',
    desc: 'Standard issue automatic rifle. Reliable and accurate.',
    category: 'weapons',
    benchType: 'weapon_bench',
    level: 3,
    bpRequired: true,
    materialsStatus: '3/5',
    materialsProgress: 60,
    time: '45s',
    xp: '+120 XP',
  },
  {
    id: 'pistol_ammo',
    name: '9mm Ammo Box',
    desc: 'Box of 50 rounds for standard pistols.',
    category: 'ammo',
    benchType: 'ammo_press',
    level: 1,
    bpRequired: false,
    materialsStatus: '5/5',
    materialsProgress: 100,
    time: '12s',
    xp: '+10 XP',
  },
  {
    id: 'lockpick',
    name: 'Advanced Lockpick',
    desc: 'High durability lockpick for tougher locks.',
    category: 'tools',
    benchType: 'workbench',
    level: 2,
    bpRequired: false,
    materialsStatus: '2/4',
    materialsProgress: 50,
    time: '20s',
    xp: '+25 XP',
  },
];

export const INGREDIENTS = [
  { id: 'steel_ingot', name: 'Steel Ingot', required: 10, have: 12, ok: true },
  { id: 'weapon_parts', name: 'Weapon Parts', required: 5, have: 2, ok: false },
  { id: 'plastic', name: 'Plastic', required: 8, have: 20, ok: true },
  { id: 'gunpowder', name: 'Gunpowder', required: 50, have: 120, ok: true },
];

export const QUEUE = [
  { id: 'q1', name: 'Pistol Ammo', amount: 5, status: 'ready', progress: 100, time: '0s' },
  { id: 'q2', name: 'Bandage', amount: 2, status: 'progress', progress: 45, time: '12s' },
  { id: 'q3', name: 'Lockpick', amount: 1, status: 'queued', progress: 0, time: '20s' },
];

export const BLUEPRINTS = [
  { id: 'bp_ar', name: 'Assault Rifle BP', desc: 'Schematics for AR manufacturing', rarity: 'rare', owned: true },
  { id: 'bp_smg', name: 'SMG BP', desc: 'Schematics for SMG manufacturing', rarity: 'epic', owned: false },
];
