import { useMemo } from 'react';
import { getActiveFloor, getWallById, updateWallByLengthAngle, useEditorStore } from '../store/editorStore';
import { cm2ToM2, cm3ToM3, objectAreaCm2, objectVolumeCm3 } from '../utils/geometry';
import { wallAreaCm2 } from '../utils/walls';

export const PropertiesPanel = (): JSX.Element => {
  const present = useEditorStore((state) => state.present);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const selectedWallId = useEditorStore((state) => state.selectedWallId);
  const updateObject = useEditorStore((state) => state.updateObject);
  const updateWall = useEditorStore((state) => state.updateWall);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const duplicateSelectedWall = useEditorStore((state) => state.duplicateSelectedWall);

  const activeFloor = getActiveFloor(present);
  const selectedObject = useMemo(
    () => activeFloor.objects.find((obj) => obj.id === selectedIds[0]),
    [activeFloor.objects, selectedIds],
  );
  const selectedWall = getWallById(present, selectedWallId);

  return (
    <aside className="w-80 border-l border-slate-700 bg-panel p-3">
      <h2 className="mb-3 text-sm font-semibold uppercase text-slate-300">Eigenschaften</h2>
      {!selectedObject && !selectedWall ? (
        <p className="text-sm text-slate-400">Wähle ein Objekt oder eine Wand, um Maße zu bearbeiten.</p>
      ) : null}

      {selectedObject ? (
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Objekt: {selectedObject.name}</div>
          {([
            ['xCm', 'X (cm)'],
            ['yCm', 'Y (cm)'],
            ['widthCm', 'Breite (cm)'],
            ['depthCm', 'Tiefe (cm)'],
            ['heightCm', 'Höhe (cm)'],
            ['rotationDeg', 'Rotation (°)'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-2">
              <span>{label}</span>
              <input
                className="w-28"
                type="number"
                value={selectedObject[key]}
                onChange={(event) => updateObject(selectedObject.id, { [key]: Number(event.target.value) })}
              />
            </label>
          ))}
          <div className="mt-2 rounded bg-slate-800 p-2">
            <div>Fläche: {objectAreaCm2(selectedObject).toFixed(0)} cm²</div>
            <div>Fläche: {cm2ToM2(objectAreaCm2(selectedObject)).toFixed(2)} m²</div>
            <div>Volumen: {objectVolumeCm3(selectedObject).toFixed(0)} cm³</div>
            <div>Volumen: {cm3ToM3(objectVolumeCm3(selectedObject)).toFixed(2)} m³</div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={duplicateSelected}>Duplizieren</button>
            <button onClick={deleteSelected}>Löschen</button>
          </div>
        </div>
      ) : null}

      {selectedWall ? (
        <div className="mt-3 space-y-2 border-t border-slate-700 pt-3 text-sm">
          <div className="font-semibold">Wand</div>
          {([
            ['x1', 'Start X (cm)'],
            ['y1', 'Start Y (cm)'],
            ['x2', 'Ende X (cm)'],
            ['y2', 'Ende Y (cm)'],
            ['thicknessCm', 'Stärke (cm)'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-2">
              <span>{label}</span>
              <input
                className="w-28"
                type="number"
                step={0.5}
                value={selectedWall[key]}
                onChange={(event) => updateWall(selectedWall.id, { [key]: Number(event.target.value) })}
              />
            </label>
          ))}
          <label className="flex items-center justify-between gap-2">
            <span>Länge (cm)</span>
            <input
              className="w-28"
              type="number"
              step={0.5}
              value={selectedWall.lengthCm.toFixed(1)}
              onChange={(event) => {
                const next = updateWallByLengthAngle(selectedWall, Number(event.target.value), selectedWall.angleDeg);
                updateWall(selectedWall.id, { x2: next.x2, y2: next.y2 });
              }}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Winkel (°)</span>
            <input
              className="w-28"
              type="number"
              step={0.5}
              value={selectedWall.angleDeg.toFixed(1)}
              onChange={(event) => {
                const next = updateWallByLengthAngle(selectedWall, selectedWall.lengthCm, Number(event.target.value));
                updateWall(selectedWall.id, { x2: next.x2, y2: next.y2 });
              }}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Material</span>
            <input
              className="w-28"
              value={selectedWall.material ?? ''}
              onChange={(event) => updateWall(selectedWall.id, { material: event.target.value })}
            />
          </label>
          <div className="mt-2 rounded bg-slate-800 p-2">
            <div>Länge: {selectedWall.lengthCm.toFixed(1)} cm</div>
            <div>Wandfläche: {wallAreaCm2(selectedWall).toFixed(1)} cm²</div>
            <div>Wandfläche: {cm2ToM2(wallAreaCm2(selectedWall)).toFixed(3)} m²</div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={duplicateSelectedWall}>Duplizieren</button>
            <button onClick={deleteSelected}>Löschen</button>
          </div>
        </div>
      ) : null}
    </aside>
  );
};
