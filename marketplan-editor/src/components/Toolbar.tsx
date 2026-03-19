import { useRef } from 'react';
import { useEditorStore } from '../store/editorStore';

export const Toolbar = (): JSX.Element => {
  const {
    undo,
    redo,
    saveToLocal,
    loadFromLocal,
    createNewProject,
    present,
    setGridSize,
    toggleSnap,
    setZoom,
    importDocument,
  } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(present, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `${present.project.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex items-center gap-2 border-b border-slate-700 bg-panel p-2">
      <button onClick={() => createNewProject('Neues Marktprojekt', 2500, 1600)}>Neues Projekt</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={saveToLocal}>Speichern</button>
      <button onClick={loadFromLocal}>Laden</button>
      <button onClick={exportJson}>Export JSON</button>
      <button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept="application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          file.text().then((text) => {
            importDocument(JSON.parse(text));
          });
        }}
      />
      <div className="ml-auto flex items-center gap-2">
        <label>Raster cm</label>
        <input
          className="w-20"
          type="number"
          value={present.settings.gridSizeCm}
          onChange={(event) => setGridSize(Number(event.target.value))}
        />
        <button onClick={toggleSnap}>{present.settings.snapToGrid ? 'Snap: ON' : 'Snap: OFF'}</button>
        <button onClick={() => setZoom(present.settings.zoom - 0.1)}>-</button>
        <span>{Math.round(present.settings.zoom * 100)}%</span>
        <button onClick={() => setZoom(present.settings.zoom + 0.1)}>+</button>
      </div>
    </div>
  );
};
