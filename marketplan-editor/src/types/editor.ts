export type Category =
  | 'Kühlmöbel'
  | 'Regale'
  | 'Kassen'
  | 'Waschbecken'
  | 'Truhen'
  | 'Tische'
  | 'Bedientheken'
  | 'Aktionsflächen'
  | 'Palettenstellplätze'
  | 'Backstationen'
  | 'Obst- und Gemüseinseln'
  | 'Leergutbereich'
  | 'Lagerelemente';

export interface Size3D {
  widthCm: number;
  depthCm: number;
  heightCm: number;
}

export interface PlanObject extends Size3D {
  id: string;
  templateId: string;
  name: string;
  category: Category;
  xCm: number;
  yCm: number;
  rotationDeg: number;
  fill: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ObjectTemplate extends Size3D {
  id: string;
  name: string;
  category: Category;
  fill: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  objects: PlanObject[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  floorPlans: FloorPlan[];
  activeFloorPlanId: string;
}

export interface EditorSettings {
  gridSizeCm: number;
  snapToGrid: boolean;
  zoom: number;
  pan: { x: number; y: number };
  pixelsPerCm: number;
}

export interface EditorDocument {
  project: Project;
  settings: EditorSettings;
}

export interface HistoryState {
  past: EditorDocument[];
  present: EditorDocument;
  future: EditorDocument[];
}
