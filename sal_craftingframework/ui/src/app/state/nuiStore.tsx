import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CATEGORIES, RECIPES, QUEUE, BLUEPRINTS } from '../data/mockData';

type Snapshot = {
  recipes?: any[];
  categories?: any[];
  blueprints?: any[];
  benchTypes?: Record<string, any>;
  benchLocations?: Record<string, any>;
  queue?: any[];
  player?: { xp?: number; level?: number };
};

type NuiState = {
  token: string | null;
  open: boolean;
  snapshot: Snapshot;
  bench?: any;
  player?: any;
};

type NuiActions = {
  close: () => void;
  craftNow: (recipeId: string, amount: number, locationId?: string) => void;
  queueAdd: (recipeId: string, amount: number, locationId?: string) => void;
  queueClaim: (queueId: string) => void;
  queueCancel: (queueId: string) => void;
  adminSave: (type: string, data: any) => void;
  adminDelete: (type: string, id: string) => void;
};

type NuiContextType = {
  state: NuiState;
  actions: NuiActions;
};

const defaultSnapshot: Snapshot = {
  categories: CATEGORIES,
  recipes: RECIPES,
  queue: QUEUE,
  blueprints: BLUEPRINTS,
  player: { xp: 0, level: 1 },
};

const NuiContext = createContext<NuiContextType | null>(null);

const getResourceName = () => {
  if (typeof (window as any).GetParentResourceName === 'function') {
    return (window as any).GetParentResourceName();
  }
  return 'sal_craftingframework';
};

const fetchNui = async (event: string, data: any = {}) => {
  const resource = getResourceName();
  return fetch(`https://${resource}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  });
};

export const NuiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NuiState>({
    token: null,
    open: false,
    snapshot: defaultSnapshot,
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { action, data } = event.data || {};
      if (!action) return;

      if (action === 'sal_crafting:open') {
        setState(prev => ({
          ...prev,
          open: true,
          token: data.token,
          bench: data.bench,
          player: data.player,
          snapshot: { ...prev.snapshot, ...(data.snapshot || {}) },
        }));
        fetchNui('ui_ready', { token: data.token });
      }

      if (action === 'sal_crafting:updateSnapshot') {
        setState(prev => ({
          ...prev,
          snapshot: { ...prev.snapshot, ...(data.snapshotPartial || {}) },
        }));
      }

      if (action === 'sal_crafting:close') {
        setState(prev => ({ ...prev, open: false }));
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const actions = useMemo<NuiActions>(() => ({
    close: () => {
      if (!state.token) return;
      fetchNui('close', { token: state.token });
      setState(prev => ({ ...prev, open: false }));
    },
    craftNow: (recipeId, amount, locationId) => {
      if (!state.token) return;
      fetchNui('craft_now', { token: state.token, recipeId, amount, locationId });
    },
    queueAdd: (recipeId, amount, locationId) => {
      if (!state.token) return;
      fetchNui('queue_add', { token: state.token, recipeId, amount, locationId });
    },
    queueClaim: (queueId) => {
      if (!state.token) return;
      fetchNui('queue_claim', { token: state.token, queueId });
    },
    queueCancel: (queueId) => {
      if (!state.token) return;
      fetchNui('queue_cancel', { token: state.token, queueId });
    },
    adminSave: (type, data) => {
      if (!state.token) return;
      fetchNui(`admin_save_${type}`, { token: state.token, [`${type}Data`]: data });
    },
    adminDelete: (type, id) => {
      if (!state.token) return;
      fetchNui(`admin_delete_${type}`, { token: state.token, [`${type}Id`]: id });
    },
  }), [state.token]);

  return (
    <NuiContext.Provider value={{ state, actions }}>
      {children}
    </NuiContext.Provider>
  );
};

export const useNui = () => {
  const context = useContext(NuiContext);
  if (!context) {
    throw new Error('useNui must be used within NuiProvider');
  }
  return context;
};
