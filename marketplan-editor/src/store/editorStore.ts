import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { OBJECT_LIBRARY } from '../data/objectLibrary';
import type { EditorDocument, FloorPlan, ObjectTemplate, PlanObject } from '../types/editor';
import { clampToFloor } from '../utils/geometry';
import { loadDocument, saveDocument } from '../utils/storage';
import { snapValue } from '../utils/snap';

interface EditorState {
  past: EditorDocument[];
  present: EditorDocument;
  future: EditorDocument[];
  selectedIds: string[];
  clipboard: PlanObject[];
  initialize: () => void;
  createNewProject: (name: string, widthCm: number, heightCm: number) => void;
  addObjectFromTemplate: (template: ObjectTemplate, xCm: number, yCm: number) => void;
  updateObject: (id: string, patch: Partial<PlanObject>) => void;
  moveSelected: (dxCm: number, dyCm: number) => void;
  selectObject: (id: string, additive?: boolean) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setGridSize: (gridSizeCm: number) => void;
  toggleSnap: () => void;
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
  },
};

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
  clipboard: [],

  initialize: () => {
    const loaded = loadDocument();
    if (loaded) {
      set({ present: loaded });
    }
  },

  createNewProject: (name, widthCm, heightCm) => {
    const floor: FloorPlan = { id: nanoid(), name: 'Etage 1', widthCm, heightCm, objects: [] };
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
    set((state) => ({ ...pushHistory(state, next), selectedIds: [] }));
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
      return { ...pushHistory(state, next), selectedIds: [object.id] };
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

  moveSelected: (dxCm, dyCm) => {
    set((state) => {
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        objects: floor.objects.map((object) => {
          if (!state.selectedIds.includes(object.id)) {
            return object;
          }
          const nextX = snapValue(object.xCm + dxCm, state.present.settings.gridSizeCm, state.present.settings.snapToGrid);
          const nextY = snapValue(object.yCm + dyCm, state.present.settings.gridSizeCm, state.present.settings.snapToGrid);
          return clampToFloor({ ...object, xCm: nextX, yCm: nextY }, floor.widthCm, floor.heightCm);
        }),
      }));
      return pushHistory(state, next);
    });
  },

  selectObject: (id, additive = false) => {
    set((state) => ({ selectedIds: additive ? Array.from(new Set([...state.selectedIds, id])) : [id] }));
  },

  clearSelection: () => set({ selectedIds: [] }),

  deleteSelected: () => {
    set((state) => {
      if (!state.selectedIds.length) return state;
      const next = mapActivePlan(state.present, (floor) => ({
        ...floor,
        objects: floor.objects.filter((object) => !state.selectedIds.includes(object.id)),
      }));
      return { ...pushHistory(state, next), selectedIds: [] };
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

  undo: () => {
    set((state) => {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        selectedIds: [],
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
      };
    });
  },

  setZoom: (zoom) => {
    set((state) => ({
      present: {
        ...state.present,
        settings: {
          ...state.present.settings,
          zoom: Math.min(3, Math.max(0.1, zoom)),
        },
      },
    }));
  },

  setPan: (x, y) => {
    set((state) => ({
      present: {
        ...state.present,
        settings: {
          ...state.present.settings,
          pan: { x, y },
        },
      },
    }));
  },

  setGridSize: (gridSizeCm) => {
    set((state) => ({
      present: {
        ...state.present,
        settings: {
          ...state.present.settings,
          gridSizeCm: Math.max(5, gridSizeCm),
        },
      },
    }));
  },

  toggleSnap: () => {
    set((state) => ({
      present: {
        ...state.present,
        settings: {
          ...state.present.settings,
          snapToGrid: !state.present.settings.snapToGrid,
        },
      },
    }));
  },

  saveToLocal: () => saveDocument(get().present),

  loadFromLocal: () => {
    const loaded = loadDocument();
    if (!loaded) return;
    set((state) => ({ ...pushHistory(state, loaded), selectedIds: [] }));
  },

  importDocument: (doc) => {
    set((state) => ({ ...pushHistory(state, doc), selectedIds: [] }));
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
