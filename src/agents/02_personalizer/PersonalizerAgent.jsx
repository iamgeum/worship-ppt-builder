import { RotateCcw } from 'lucide-react';
import { useWorship } from '../../context/WorshipContext.jsx';

const presets = [
  { id: 'clean', name: '기본 흰 배경', colors: ['#ffffff', '#111827'] },
  { id: 'dark', name: '어두운 배경', colors: ['#111827', '#f9fafb'] },
  { id: 'photo', name: '사진 배경', colors: ['#334155', '#ffffff'] },
  { id: 'warm', name: '따뜻한 예배', colors: ['#fff7ed', '#1f2937'] },
];

export default function PersonalizerAgent() {
  const { slideFormat, stylePreset, updateState, undo, canUndo } = useWorship();

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Agent 2</p>
          <h1>슬라이드 개인화</h1>
        </div>
        <button className="secondary-button" type="button" onClick={undo} disabled={!canUndo}>
          <RotateCcw size={18} /> 되돌리기
        </button>
      </header>

      <div className="settings-grid">
        <section className="settings-section">
          <h2>스타일 프리셋</h2>
          <div className="preset-grid">
            {presets.map((preset) => (
              <button
                className={`preset-card ${stylePreset === preset.id ? 'selected' : ''}`}
                type="button"
                key={preset.id}
                onClick={() => updateState((state) => ({ ...state, stylePreset: preset.id }))}
              >
                <span className="swatches">
                  {preset.colors.map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
                {preset.name}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2>규격</h2>
          <label>
            비율
            <select
              value={slideFormat.ratio}
              onChange={(event) =>
                updateState((state) => ({
                  ...state,
                  slideFormat: { ...state.slideFormat, ratio: event.target.value },
                }))
              }
            >
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
            </select>
          </label>
          <label>
            여백 {slideFormat.margin}px
            <input
              type="range"
              min="16"
              max="96"
              value={slideFormat.margin}
              onChange={(event) =>
                updateState((state) => ({
                  ...state,
                  slideFormat: { ...state.slideFormat, margin: Number(event.target.value) },
                }))
              }
            />
          </label>
        </section>
      </div>
    </section>
  );
}
