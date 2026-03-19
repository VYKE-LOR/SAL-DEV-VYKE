import { useEffect, useMemo, useRef } from 'react';
import { Layer, Rect, Stage, Transformer } from 'react-konva';
import Konva from 'konva';
import { getActiveFloor, useEditorStore } from '../store/editorStore';
import { isColliding, minDistanceCm } from '../utils/geometry';

export const EditorCanvas = (): JSX.Element => {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    present,
    selectedIds,
    selectObject,
    clearSelection,
    updateObject,
    setPan,
    addObjectFromTemplate,
    deleteSelected,
    undo,
    redo,
    copySelected,
    pasteClipboard,
  } = useEditorStore();
  const floor = getActiveFloor(present);
  const { pixelsPerCm, zoom, pan, gridSizeCm } = present.settings;
  const pxPerCm = pixelsPerCm * zoom;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        deleteSelected();
      }
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
        const stageBox = stageRef.current?.container().getBoundingClientRect();
        if (!stageBox) return;
        const pointerX = (event.clientX - stageBox.left - pan.x) / pxPerCm;
        const pointerY = (event.clientY - stageBox.top - pan.y) / pxPerCm;
        addObjectFromTemplate(template, pointerX, pointerY);
      }}
    >
      <Stage
        width={containerRef.current?.clientWidth ?? window.innerWidth}
        height={containerRef.current?.clientHeight ?? window.innerHeight}
        ref={stageRef}
        onMouseDown={(event) => {
          const clickedOnEmpty = event.target === event.target.getStage();
          if (clickedOnEmpty) clearSelection();
        }}
        draggable
        x={pan.x}
        y={pan.y}
        onDragEnd={(event) => setPan(event.target.x(), event.target.y())}
      >
        <Layer>
          <Rect x={0} y={0} width={floor.widthCm * pxPerCm} height={floor.heightCm * pxPerCm} fill="#0f172a" stroke="#64748b" strokeWidth={2} />
          {gridLines.map((line, index) => (
            <Rect key={index} {...line} fill="#1e293b" opacity={0.6} listening={false} />
          ))}
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
                draggable
                onContextMenu={(event) => {
                  event.evt.preventDefault();
                  selectObject(object.id);
                }}
                onClick={(event) => selectObject(object.id, event.evt.shiftKey)}
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
          <Transformer ref={trRef} rotateEnabled enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />
        </Layer>
      </Stage>

      <div className="absolute bottom-2 left-2 rounded bg-slate-900/90 px-2 py-1 text-xs text-slate-300">
        Plan: {floor.widthCm} × {floor.heightCm} cm | Objekte: {floor.objects.length}
      </div>
    </div>
  );
};
