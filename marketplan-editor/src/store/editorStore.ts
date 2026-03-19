import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { OBJECT_LIBRARY } from '../data/objectLibrary';
import type { EditorDocument, EditorTool, FloorPlan, ObjectTemplate, PlanObject, Wall } from '../types/editor';
import { clampToFloor } from '../utils/geometry';
import { loadDocument, saveDocument } from '../utils/storage';
import { snapValue } from '../utils/snap';
import { endpointFromLengthAngle, updateWallMetrics } from '../utils/walls';

interface EditorState {
  past: EditorDocument[];
  present: EditorDocument;
  future: EditorDocument[];
  selectedIds: string[];
  selectedWallId: string | null;
  clipboard: PlanObject[];
  initialize: () => void;
  createNewProject: (name: string, widthCm: number, heightCm: number) => void;
  addObjectFromTemplate: (template: ObjectTemplate, xCm: number, yCm: number) => void;
  updateObject: (id: string, patch: Partial<PlanObject>) => void;
  moveSelected: (dxCm: number, dyCm: number) => void;
  selectObject: (id: string, additive?: boolean) => void;
  selectWall: (id: string | null) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  addWall: (wallInput: Omit<Wall, 'id' | 'type' | 'lengthCm' | 'angleDeg' | 'createdAt' | 'updatedAt'>) => void;
  updateWall: (id: string, patch: Partial<Wall>) => void;
  duplicateSelectedWall: () => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setGridSize: (gridSizeCm: number) => void;
  toggleSnap: () => void;
  setTool: (tool: EditorTool) => void;
  setWallThickness: (thicknessCm: number) => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
  importDocument: (doc: EditorDocument) => void;
  copySelected: () => void;
  pasteClipboard: () => void;
}

const now = () => new Date().toISOString();

const initialFloorPlan: FloorPlan = {
  id: nanoid(),
  name: 'Etage 1',
  widthCm: 2500,
  heightCm: 1600,
  objects: [],
  walls: [],
};

const initialDocument: EditorDocument = {
  project: {
    id: nanoid(),
    name: 'Neues Marktprojekt',
    createdAt: now(),
    updatedAt: now(),
    floorPlans: [initialFloorPlan],
    activeFloorPlanId: initialFloorPlan.id,
  },
  settings: {
    gridSizeCm: 25,
    snapToGrid: true,
    zoom: 0.5,
    pan: { x: 70, y: 70 },
    pixelsPerCm: 0.4,
    tool: 'select',
    wallThicknessCm: 11.5,
  },
};

const migrateDocument = (doc: EditorDocument): EditorDocument => ({
  ...doc,
  settings: {
    ...doc.settings,
    tool: doc.settings.tool ?? 'select',
    wallThicknessCm: doc.settings.wallThicknessCm ?? 11.5,
  },
  project: {
    ...doc.project,
    floorPlans: doc.project.floorPlans.map((floor) => ({
      ...floor,
      walls: floor.walls ?? [],
    })),
  },
});

const pushHistory = (state: EditorState, nextPresent: EditorDocument): Partial<EditorState> => ({
  past: [...state.past, state.present],
  present: nextPresent,
  future: [],
});

const mapActivePlan = (document: EditorDocument, mapFn: (floor: FloorPlan) => FloorPlan): EditorDocument => ({
  ...document,
  project: {
    ...document.project,
    updatedAt: now(),
    floorPlans: document.project.floorPlans.map((floor) =>
      floor.id === document.project.activeFloorPlanId ? mapFn(floor) : floor,
    ),
  },
});

export const useEditorStore = create<EditorState>((set, get) => ({
  past: [],
  present: initialDocument,
  future: [],
  selectedIds: [],
  selectedWallId: null,
  clipboard: [],

  initialize: () => {
    const loaded = loadDocument();
    if (loaded) {
      set({ present: migrateDocument(loaded) });
    }
  },

  createNewProject: (name, widthCm, heightCm) => {
    const floor: FloorPlan = { id: nanoid(), name: 'Etage 1', widthCm, heightCm, objects: [], walls: [] };
    const next: EditorDocument = {
      project: {
        id: nanoid(),
        name,
        createdAt: now(),
        updatedAt: now(),
        floorPlans: [floor],
        activeFloorPlanId: floor.id,
      },
      settings: get().present.settings,
    };
    set((state) => ({ ...pushHistory(state, next), selectedIds: [], selectedWallId: null }));
  },

  addObjectFromTemplate: (template, xCm, yCm) => {
    set((state) => {
      const floor = state.present.project.floorPlans.find((f) => f.id === state.present.project.activeFloorPlanId);
      if (!floor) return state;
      const object: PlanObject = {
        id: nanoid(),
        templateId: template.id,
        name: template.name,
        category: template.category,
        widthCm: template.widthCm,
        depthCm: template.depthCm,
        heightCm: template.heightCm,
        xCm: snapValue(xCm, state.present.settings.gridSizeCm, state.present.settings.snapToGrid),
        yCm: snapValue(yCm, state.present.settings.gridSizeCm, state.present.settings.snapToGrid),
        rotationDeg: 0,
        fill: template.fill,
      };
      const next = mapActivePlan(state.present, (activeFloor) => ({
        ...activeFloor,
        objects: [...activeFloor.objects, clampToFloor(object, activeFloor.widthCm, activeFloor.heightCm)],
      }));
      return { ...pushHistory(state, next), selectedIds: [object.id], selectedWallId: null };
    });
  },

  addWall: (wallInput) => {
    set((state) => {
      const wall = updateWallMetrics({
        ...wallInput,
        id: nanoid(),
        type: 'wall',
        createdAt: now(),
        updatedAt: now(),
      });
      const next = mapActivePlan(state.present, (floor) => ({ ...floor, walls: [...floor.walls, wall] }));
      return { ...pushHistory(state, next), selectedIds: [], selectedWallId: wall.id };
    });
  },

  updateObject: (id, patch) => {
    set((state) => {
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        objects: floor.objects.map((object) => {
          if (object.id !== id) return object;
          const merged = { ...object, ...patch };
          return clampToFloor(merged, floor.widthCm, floor.heightCm);
        }),
      }));
      return pushHistory(state, next);
    });
  },

  updateWall: (id, patch) => {
    set((state) => {
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        walls: floor.walls.map((wall) => {
          if (wall.id !== id) return wall;
          return updateWallMetrics({
            ...wall,
            ...patch,
            updatedAt: now(),
          });
        }),
      }));
      return pushHistory(state, next);
    });
  },

  moveSelected: (dxCm, dyCm) => {
    set((state) => {
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        objects: floor.objects.map((object) => {
          if (!state.selectedIds.includes(object.id)) return object;
          const nextX = snapValue(object.xCm + dxCm, state.present.settings.gridSizeCm, state.present.settings.snapToGrid);
          const nextY = snapValue(object.yCm + dyCm, state.present.settings.gridSizeCm, state.present.settings.snapToGrid);
          return clampToFloor({ ...object, xCm: nextX, yCm: nextY }, floor.widthCm, floor.heightCm);
        }),
        walls: floor.walls.map((wall) => {
          if (wall.id !== state.selectedWallId) return wall;
          return updateWallMetrics({
            ...wall,
            x1: wall.x1 + dxCm,
            y1: wall.y1 + dyCm,
            x2: wall.x2 + dxCm,
            y2: wall.y2 + dyCm,
            updatedAt: now(),
          });
        }),
      }));
      return pushHistory(state, next);
    });
  },

  selectObject: (id, additive = false) => {
    set((state) => ({
      selectedIds: additive ? Array.from(new Set([...state.selectedIds, id])) : [id],
      selectedWallId: null,
      present: { ...state.present, settings: { ...state.present.settings, tool: 'select' } },
    }));
  },

  selectWall: (id) => {
    set((state) => ({
      selectedWallId: id,
      selectedIds: [],
      present: { ...state.present, settings: { ...state.present.settings, tool: 'select' } },
    }));
  },

  clearSelection: () => set({ selectedIds: [], selectedWallId: null }),

  deleteSelected: () => {
    set((state) => {
      if (!state.selectedIds.length && !state.selectedWallId) return state;
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        objects: floor.objects.filter((object) => !state.selectedIds.includes(object.id)),
        walls: floor.walls.filter((wall) => wall.id !== state.selectedWallId),
      }));
      return { ...pushHistory(state, next), selectedIds: [], selectedWallId: null };
    });
  },

  duplicateSelected: () => {
    set((state) => {
      const selected = state.present.project.floorPlans
        .find((f) => f.id === state.present.project.activeFloorPlanId)
        ?.objects.filter((obj) => state.selectedIds.includes(obj.id));
      if (!selected?.length) return state;
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        objects: [
          ...floor.objects,
          ...selected.map((obj) =>
            clampToFloor(
              {
                ...obj,
                id: nanoid(),
                xCm: obj.xCm + state.present.settings.gridSizeCm,
                yCm: obj.yCm + state.present.settings.gridSizeCm,
              },
              floor.widthCm,
              floor.heightCm,
            ),
          ),
        ],
      }));
      return pushHistory(state, next);
    });
  },

  duplicateSelectedWall: () => {
    set((state) => {
      if (!state.selectedWallId) return state;
      const floor = getActiveFloor(state.present);
      const wall = floor.walls.find((entry) => entry.id === state.selectedWallId);
      if (!wall) return state;
      const dx = state.present.settings.gridSizeCm;
      const nextWall = updateWallMetrics({
        ...wall,
        id: nanoid(),
        x1: wall.x1 + dx,
        y1: wall.y1 + dx,
        x2: wall.x2 + dx,
        y2: wall.y2 + dx,
        createdAt: now(),
        updatedAt: now(),
      });
      const next = mapActivePlan(state.present, (activeFloor) => ({
        ...activeFloor,
        walls: [...activeFloor.walls, nextWall],
      }));
      return { ...pushHistory(state, next), selectedWallId: nextWall.id };
    });
  },

  undo: () => {
    set((state) => {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        selectedIds: [],
        selectedWallId: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.present],
        present: next,
        future: rest,
        selectedIds: [],
        selectedWallId: null,
      };
    });
  },

  setZoom: (zoom) => {
    set((state) => ({
      present: { ...state.present, settings: { ...state.present.settings, zoom: Math.min(3, Math.max(0.1, zoom)) } },
    }));
  },

  setPan: (x, y) => {
    set((state) => ({ present: { ...state.present, settings: { ...state.present.settings, pan: { x, y } } } }));
  },

  setGridSize: (gridSizeCm) => {
    set((state) => ({
      present: { ...state.present, settings: { ...state.present.settings, gridSizeCm: Math.max(5, gridSizeCm) } },
    }));
  },

  toggleSnap: () => {
    set((state) => ({
      present: { ...state.present, settings: { ...state.present.settings, snapToGrid: !state.present.settings.snapToGrid } },
    }));
  },

  setTool: (tool) => {
    set((state) => ({
      present: { ...state.present, settings: { ...state.present.settings, tool } },
      selectedIds: tool === 'wall' ? [] : state.selectedIds,
      selectedWallId: tool === 'wall' ? null : state.selectedWallId,
    }));
  },

  setWallThickness: (thicknessCm) => {
    set((state) => ({
      present: {
        ...state.present,
        settings: { ...state.present.settings, wallThicknessCm: Math.max(3, Number(thicknessCm) || 3) },
      },
    }));
  },

  saveToLocal: () => saveDocument(get().present),

  loadFromLocal: () => {
    const loaded = loadDocument();
    if (!loaded) return;
    set((state) => ({ ...pushHistory(state, migrateDocument(loaded)), selectedIds: [], selectedWallId: null }));
  },

  importDocument: (doc) => {
    set((state) => ({ ...pushHistory(state, migrateDocument(doc)), selectedIds: [], selectedWallId: null }));
  },

  copySelected: () => {
    const state = get();
    const floor = state.present.project.floorPlans.find((f) => f.id === state.present.project.activeFloorPlanId);
    if (!floor) return;
    set({ clipboard: floor.objects.filter((obj) => state.selectedIds.includes(obj.id)) });
  },

  pasteClipboard: () => {
    set((state) => {
      if (!state.clipboard.length) return state;
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        objects: [
          ...floor.objects,
          ...state.clipboard.map((obj) =>
            clampToFloor(
              {
                ...obj,
                id: nanoid(),
                xCm: obj.xCm + state.present.settings.gridSizeCm,
                yCm: obj.yCm + state.present.settings.gridSizeCm,
              },
              floor.widthCm,
              floor.heightCm,
            ),
          ),
        ],
      }));
      return pushHistory(state, next);
    });
  },
}));

export const getActiveFloor = (document: EditorDocument): FloorPlan =>
  document.project.floorPlans.find((floor) => floor.id === document.project.activeFloorPlanId) ??
  document.project.floorPlans[0];

export const getDefaultTemplates = () => OBJECT_LIBRARY;

export const getWallById = (document: EditorDocument, wallId: string | null): Wall | undefined => {
  if (!wallId) return undefined;
  return getActiveFloor(document).walls.find((wall) => wall.id === wallId);
};

export const updateWallByLengthAngle = (wall: Wall, lengthCm: number, angleDeg: number): Wall => {
  const endpoint = endpointFromLengthAngle(wall.x1, wall.y1, lengthCm, angleDeg);
  return updateWallMetrics({ ...wall, x2: endpoint.x, y2: endpoint.y });
};
