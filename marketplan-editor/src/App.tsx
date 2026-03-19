import { useEffect } from 'react';
import { EditorCanvas } from './components/EditorCanvas';
import { ObjectLibrary } from './components/ObjectLibrary';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Toolbar } from './components/Toolbar';
import { useEditorStore } from './store/editorStore';

const App = (): JSX.Element => {
  const initialize = useEditorStore((state) => state.initialize);
  const moveSelected = useEditorStore((state) => state.moveSelected);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const onArrows = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 10 : 2;
      if (event.key === 'ArrowUp') moveSelected(0, -step);
      if (event.key === 'ArrowDown') moveSelected(0, step);
      if (event.key === 'ArrowLeft') moveSelected(-step, 0);
      if (event.key === 'ArrowRight') moveSelected(step, 0);
    };
    window.addEventListener('keydown', onArrows);
    return () => window.removeEventListener('keydown', onArrows);
  }, [moveSelected]);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <ObjectLibrary />
        <main className="min-h-0 flex-1">
          <EditorCanvas />
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
};

export default App;
