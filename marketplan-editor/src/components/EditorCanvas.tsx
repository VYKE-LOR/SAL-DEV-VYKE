import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { getActiveFloor, useEditorStore } from '../store/editorStore';
import { isColliding, minDistanceCm } from '../utils/geometry';
import { snapValue } from '../utils/snap';
import { snapToPoints, wallAngleDeg, wallLengthCm } from '../utils/walls';

interface WallDraft {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const EditorCanvas = (): JSX.Element => {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [wallDraft, setWallDraft] = useState<WallDraft | null>(null);

  const {
    present,
    selectedIds,
    selectedWallId,
    selectObject,
    selectWall,
    clearSelection,
    updateObject,
    updateWall,
    setPan,
    addObjectFromTemplate,
    addWall,
    deleteSelected,
    undo,
    redo,
    copySelected,
    pasteClipboard,
  } = useEditorStore();
  const floor = getActiveFloor(present);
  const { pixelsPerCm, zoom, pan, gridSizeCm, tool, wallThicknessCm, snapToGrid } = present.settings;
  const pxPerCm = pixelsPerCm * zoom;

  const wallSnapPoints = useMemo(
    () => floor.walls.flatMap((wall) => [{ x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 }]),
    [floor.walls],
  );

  const toCmPoint = (clientX: number, clientY: number) => {
    const stageBox = stageRef.current?.container().getBoundingClientRect();
    if (!stageBox) return { x: 0, y: 0 };
    let x = (clientX - stageBox.left - pan.x) / pxPerCm;
    let y = (clientY - stageBox.top - pan.y) / pxPerCm;
    if (snapToGrid) {
      x = snapValue(x, gridSizeCm, true);
      y = snapValue(y, gridSizeCm, true);
    }
    return snapToPoints({ x, y }, wallSnapPoints, gridSizeCm / 2);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Delete') deleteSelected();
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        copySelected();
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        pasteClipboard();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [copySelected, deleteSelected, pasteClipboard, redo, undo]);

  useEffect(() => {
    if (!trRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const selectedNodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => Boolean(node));
    trRef.current.nodes(selectedNodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedIds, present.project.updatedAt]);

  const gridLines = useMemo(() => {
    const lines: Array<{ x: number; y: number; width: number; height: number }> = [];
    const gridPx = gridSizeCm * pxPerCm;
    const widthPx = floor.widthCm * pxPerCm;
    const heightPx = floor.heightCm * pxPerCm;
    for (let x = 0; x <= widthPx; x += gridPx) lines.push({ x, y: 0, width: 1, height: heightPx });
    for (let y = 0; y <= heightPx; y += gridPx) lines.push({ x: 0, y, width: widthPx, height: 1 });
    return lines;
  }, [floor.heightCm, floor.widthCm, gridSizeCm, pxPerCm]);

  const renderWallRect = (wall: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    thicknessCm: number;
    color: string;
    id: string;
  }) => {
    const length = wallLengthCm(wall.x1, wall.y1, wall.x2, wall.y2);
    const angle = wallAngleDeg(wall.x1, wall.y1, wall.x2, wall.y2);
    const centerX = ((wall.x1 + wall.x2) / 2) * pxPerCm;
    const centerY = ((wall.y1 + wall.y2) / 2) * pxPerCm;

    return (
      <Rect
        key={wall.id}
        id={wall.id}
        x={centerX - (length * pxPerCm) / 2}
        y={centerY - (wall.thicknessCm * pxPerCm) / 2}
        width={length * pxPerCm}
        height={wall.thicknessCm * pxPerCm}
        rotation={angle}
        offsetX={0}
        offsetY={0}
        fill={wall.color}
        stroke={selectedWallId === wall.id ? '#f8fafc' : '#475569'}
        strokeWidth={selectedWallId === wall.id ? 2 : 1}
        onClick={(event) => {
          event.cancelBubble = true;
          selectWall(wall.id);
        }}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-slate-950"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const raw = event.dataTransfer.getData('application/market-template');
        if (!raw) return;
        const template = JSON.parse(raw);
        const pointer = toCmPoint(event.clientX, event.clientY);
        addObjectFromTemplate(template, pointer.x, pointer.y);
      }}
    >
      <Stage
        width={containerRef.current?.clientWidth ?? window.innerWidth}
        height={containerRef.current?.clientHeight ?? window.innerHeight}
        ref={stageRef}
        draggable={tool !== 'wall'}
        x={pan.x}
        y={pan.y}
        onDragEnd={(event) => setPan(event.target.x(), event.target.y())}
        onMouseDown={(event) => {
          if (tool === 'wall') {
            const pointer = toCmPoint(event.evt.clientX, event.evt.clientY);
            setWallDraft({ x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y });
            return;
          }
          if (event.target === event.target.getStage()) clearSelection();
        }}
        onMouseMove={(event) => {
          if (tool !== 'wall' || !wallDraft) return;
          const pointer = toCmPoint(event.evt.clientX, event.evt.clientY);
          setWallDraft((prev) => (prev ? { ...prev, x2: pointer.x, y2: pointer.y } : null));
        }}
        onMouseUp={() => {
          if (tool !== 'wall' || !wallDraft) return;
          const length = wallLengthCm(wallDraft.x1, wallDraft.y1, wallDraft.x2, wallDraft.y2);
          if (length >= 5) {
            addWall({
              x1: wallDraft.x1,
              y1: wallDraft.y1,
              x2: wallDraft.x2,
              y2: wallDraft.y2,
              thicknessCm: wallThicknessCm,
              color: '#94a3b8',
              material: 'Mauerwerk',
              locked: false,
            });
          }
          setWallDraft(null);
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={floor.widthCm * pxPerCm} height={floor.heightCm * pxPerCm} fill="#0f172a" stroke="#64748b" strokeWidth={2} />
          {gridLines.map((line, index) => (
            <Rect key={index} {...line} fill="#1e293b" opacity={0.6} listening={false} />
          ))}

          {floor.walls.map((wall) => renderWallRect(wall))}

          {floor.walls.flatMap((wall) => {
            if (selectedWallId !== wall.id) return [];
            return [
              <Circle
                key={`${wall.id}-start`}
                x={wall.x1 * pxPerCm}
                y={wall.y1 * pxPerCm}
                radius={5}
                fill="#38bdf8"
                draggable
                onDragMove={(event) => {
                  const x1 = event.target.x() / pxPerCm;
                  const y1 = event.target.y() / pxPerCm;
                  updateWall(wall.id, { x1, y1 });
                }}
              />,
              <Circle
                key={`${wall.id}-end`}
                x={wall.x2 * pxPerCm}
                y={wall.y2 * pxPerCm}
                radius={5}
                fill="#38bdf8"
                draggable
                onDragMove={(event) => {
                  const x2 = event.target.x() / pxPerCm;
                  const y2 = event.target.y() / pxPerCm;
                  updateWall(wall.id, { x2, y2 });
                }}
              />,
            ];
          })}

          {floor.objects.map((object) => {
            const hasCollision = floor.objects.some((candidate) => candidate.id !== object.id && isColliding(object, candidate));
            const nearest = floor.objects
              .filter((candidate) => candidate.id !== object.id)
              .reduce((min, candidate) => Math.min(min, minDistanceCm(object, candidate)), Infinity);
            return (
              <Rect
                key={object.id}
                id={object.id}
                x={object.xCm * pxPerCm}
                y={object.yCm * pxPerCm}
                width={object.widthCm * pxPerCm}
                height={object.depthCm * pxPerCm}
                fill={object.fill}
                opacity={selectedIds.includes(object.id) ? 0.95 : 0.8}
                stroke={hasCollision ? '#ef4444' : selectedIds.includes(object.id) ? '#f8fafc' : '#334155'}
                strokeWidth={selectedIds.includes(object.id) ? 2 : 1}
                rotation={object.rotationDeg}
                draggable={tool !== 'wall'}
                onContextMenu={(event) => {
                  event.evt.preventDefault();
                  selectObject(object.id);
                }}
                onClick={(event) => {
                  event.cancelBubble = true;
                  selectObject(object.id, event.evt.shiftKey);
                }}
                onDragEnd={(event) => {
                  const xCm = event.target.x() / pxPerCm;
                  const yCm = event.target.y() / pxPerCm;
                  updateObject(object.id, { xCm, yCm });
                }}
                onTransformEnd={(event) => {
                  const node = event.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  updateObject(object.id, {
                    xCm: node.x() / pxPerCm,
                    yCm: node.y() / pxPerCm,
                    widthCm: Math.max(20, (node.width() * scaleX) / pxPerCm),
                    depthCm: Math.max(20, (node.height() * scaleY) / pxPerCm),
                    rotationDeg: node.rotation(),
                    metadata: { ...object.metadata, nearestDistanceCm: Number.isFinite(nearest) ? Math.round(nearest) : -1 },
                  });
                }}
              />
            );
          })}

          {wallDraft ? (
            <>
              {renderWallRect({ ...wallDraft, id: 'wall-draft', thicknessCm: wallThicknessCm, color: '#38bdf8' })}
              <Text
                x={(wallDraft.x2 * pxPerCm) + 8}
                y={(wallDraft.y2 * pxPerCm) + 8}
                text={`${wallLengthCm(wallDraft.x1, wallDraft.y1, wallDraft.x2, wallDraft.y2).toFixed(1)} cm | ${wallAngleDeg(wallDraft.x1, wallDraft.y1, wallDraft.x2, wallDraft.y2).toFixed(1)}°`}
                fill="#f8fafc"
                fontSize={12}
              />
            </>
          ) : null}

          <Transformer ref={trRef} rotateEnabled enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />
        </Layer>
      </Stage>

      <div className="absolute bottom-2 left-2 rounded bg-slate-900/90 px-2 py-1 text-xs text-slate-300">
        Tool: {tool === 'wall' ? 'Wandzeichnen' : 'Auswahl'} | Plan: {floor.widthCm} × {floor.heightCm} cm | Wände: {floor.walls.length} | Objekte: {floor.objects.length}
      </div>
    </div>
  );
};
