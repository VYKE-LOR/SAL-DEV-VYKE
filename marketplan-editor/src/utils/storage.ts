import type { EditorDocument } from '../types/editor';

const STORAGE_KEY = 'marketplan-editor-document-v1';

export const saveDocument = (document: EditorDocument): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
};

export const loadDocument = (): EditorDocument | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as EditorDocument;
};
