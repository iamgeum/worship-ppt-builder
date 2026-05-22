import { useState } from 'react';
import MenuAgent from './agents/01_menu/MenuAgent.jsx';
import PersonalizerAgent from './agents/02_personalizer/PersonalizerAgent.jsx';
import EditorAgent from './agents/04_editor/EditorAgent.jsx';
import TextEditorAgent from './agents/06_text-editor/TextEditorAgent.jsx';
import UxBenchmarkAgent from './agents/07_ux-benchmark/UxBenchmarkAgent.jsx';
import ToastMessage from './components/ToastMessage.jsx';
import { useWorship } from './context/WorshipContext.jsx';

export default function App() {
  const [activeView, setActiveView] = useState('order');
  const [textEditorMode, setTextEditorMode] = useState(null);
  const { toast, setToast } = useWorship();

  return (
    <div className="app-shell">
      <MenuAgent activeView={activeView} onNavigate={setActiveView} />
      <main className="workspace">
        {(activeView === 'order' || activeView === 'editor') && (
          <EditorAgent
            title={activeView === 'order' ? '순서페이지 관리' : 'PPT 만들기'}
            onAddLyrics={() => setTextEditorMode('lyrics')}
            onAddScripture={() => setTextEditorMode('scripture')}
          />
        )}
        {activeView === 'personalizer' && <PersonalizerAgent />}
        {activeView === 'benchmark' && <UxBenchmarkAgent />}
      </main>
      {textEditorMode && <TextEditorAgent mode={textEditorMode} onClose={() => setTextEditorMode(null)} />}
      <ToastMessage message={toast} onDone={() => setToast('')} />
    </div>
  );
}
