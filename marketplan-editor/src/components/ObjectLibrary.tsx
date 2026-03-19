import { getDefaultTemplates, useEditorStore } from '../store/editorStore';

export const ObjectLibrary = (): JSX.Element => {
  const addObjectFromTemplate = useEditorStore((state) => state.addObjectFromTemplate);
  const templates = getDefaultTemplates();

  return (
    <aside className="w-72 border-r border-slate-700 bg-panel p-3">
      <h2 className="mb-3 text-sm font-semibold uppercase text-slate-300">Objektbibliothek</h2>
      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            className="flex w-full items-center justify-between"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('application/market-template', JSON.stringify(template));
            }}
            onClick={() => addObjectFromTemplate(template, 100, 100)}
          >
            <span>{template.name}</span>
            <span className="text-xs text-slate-400">
              {template.widthCm}×{template.depthCm} cm
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};
