import { Save } from 'lucide-react';
import { useState } from 'react';

export default function UxBenchmarkAgent() {
  const [url, setUrl] = useState('https://linear.app');

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Agent 7</p>
          <h1>UI/UX 벤치마킹</h1>
        </div>
      </header>
      <div className="benchmark-box">
        <label>
          레퍼런스 URL
          <input value={url} onChange={(event) => setUrl(event.target.value)} />
        </label>
        <button className="primary-button" type="button">
          <Save size={18} /> 분석 결과 저장
        </button>
        <div className="token-preview">
          <code>--surface: #ffffff;</code>
          <code>--sidebar-width: 248px;</code>
          <code>--radius-card: 8px;</code>
        </div>
      </div>
    </section>
  );
}
