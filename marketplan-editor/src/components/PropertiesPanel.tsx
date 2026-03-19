import { useMemo } from 'react';
import { getActiveFloor, useEditorStore } from '../store/editorStore';
import { cm2ToM2, cm3ToM3, objectAreaCm2, objectVolumeCm3 } from '../utils/geometry';

export const PropertiesPanel = (): JSX.Element => {
  const present = useEditorStore((state) => state.present);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const updateObject = useEditorStore((state) => state.updateObject);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);

  const activeFloor = getActiveFloor(present);
  const selectedObject = useMemo(
    () => activeFloor.objects.find((obj) => obj.id === selectedIds[0]),
    [activeFloor.objects, selectedIds],
  );

  return (
    <aside className="w-80 border-l border-slate-700 bg-panel p-3">
      <h2 className="mb-3 text-sm font-semibold uppercase text-slate-300">Eigenschaften</h2>
      {!selectedObject ? (
        <p className="text-sm text-slate-400">Wähle ein Objekt, um Maße zu bearbeiten.</p>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="font-semibold">{selectedObject.name}</div>
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
      )}
    </aside>
  );
};
