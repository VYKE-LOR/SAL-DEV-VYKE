import { useRef } from 'react';
import { useEditorStore } from '../store/editorStore';

const WALL_THICKNESSES = [5, 7.5, 10, 11.5, 17.5, 24];

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
    setTool,
    setWallThickness,
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
          file.text().then((text) => importDocument(JSON.parse(text)));
        }}
      />

      <div className="ml-3 flex items-center gap-2 border-l border-slate-700 pl-3">
        <button
          className={present.settings.tool === 'select' ? 'bg-accent text-slate-900 hover:bg-sky-400' : ''}
          onClick={() => setTool('select')}
        >
          Auswahl
        </button>
        <button
          className={present.settings.tool === 'wall' ? 'bg-accent text-slate-900 hover:bg-sky-400' : ''}
          onClick={() => setTool('wall')}
        >
          Wand
        </button>
        <label>Wandstärke</label>
        <select
          value={WALL_THICKNESSES.includes(present.settings.wallThicknessCm) ? present.settings.wallThicknessCm : 'custom'}
          onChange={(event) => {
            const value = event.target.value;
            if (value === 'custom') return;
            setWallThickness(Number(value));
          }}
        >
          {WALL_THICKNESSES.map((value) => (
            <option key={value} value={value}>
              {value} cm
            </option>
          ))}
          <option value="custom">frei</option>
        </select>
        <input
          className="w-20"
          type="number"
          min={3}
          step={0.5}
          value={present.settings.wallThicknessCm}
          onChange={(event) => setWallThickness(Number(event.target.value))}
        />
      </div>

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
