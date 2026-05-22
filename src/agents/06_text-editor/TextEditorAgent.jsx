import { Eye, Save, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import SlidePreviewModal from '../../components/SlidePreviewModal.jsx';
import { useWorship } from '../../context/WorshipContext.jsx';
import bible from '../../data/bible/kairos.json';
import { hasOverflowWarning, makeSlide, splitPages } from '../../utils/slideHelpers.js';

export default function TextEditorAgent({ mode, onClose }) {
  const { updateState, setToast } = useWorship();
  const [text, setText] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [search, setSearch] = useState('창 1:1');
  const [history, setHistory] = useState([]);
  const pages = useMemo(() => splitPages(text), [text]);

  const appendScripture = (items) => {
    if (!items.length) return;
    const scripture = items.map((item) => `${item.book} ${item.chapter}:${item.verse} ${item.text}`).join('\n');
    setText((value) => `${value.trim()}\n\n${scripture}\n\n`.trimStart());
    setHistory((itemsHistory) => [scripture, ...itemsHistory.filter((item) => item !== scripture)].slice(0, 10));
  };

  const searchScripture = () => {
    const matched = search.match(/^([가-힣]+)\s*(\d+):(\d+)(?:-(\d+))?$/);
    if (!matched) return;
    const [, bookCode, chapter, startVerse, endVerse] = matched;
    const results = bible.filter(
      (item) =>
        (item.bookCode === bookCode || item.book === bookCode) &&
        item.chapter === Number(chapter) &&
        item.verse >= Number(startVerse) &&
        item.verse <= Number(endVerse || startVerse),
    );
    appendScripture(results);
  };

  const save = () => {
    const normalizedPages = pages.map((page) => page.replace(/\n{3,}/g, '\n\n'));
    updateState((state) => ({
      ...state,
      slides: [...state.slides, ...normalizedPages.map((page, index) => makeSlide(`추가 ${index + 1}`, page))],
      currentSlideIndex: state.slides.length,
    }));
    setToast('저장되었습니다 ✓');
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="text-editor-modal">
        <header className="text-editor-header">
          <div>
            <p className="eyebrow">Agent 6</p>
            <h1>{mode === 'scripture' ? '말씀 추가' : '가사 추가'}</h1>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </header>

        {mode === 'scripture' && (
          <section className="scripture-panel">
            <div className="scripture-tabs">
              <button className="active" type="button">한 절</button>
              <button type="button">여러 절</button>
            </div>
            <div className="scripture-search">
              <select defaultValue="개역개정">
                <option>개역개정</option>
              </select>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="창 1:1-10" />
              <button className="primary-button" type="button" onClick={searchScripture}>
                <Search size={18} /> 검색
              </button>
            </div>
            <div className="scripture-selects">
              <select defaultValue="창세기">
                <option>창세기</option>
                <option>요한복음</option>
                <option>로마서</option>
                <option>시편</option>
              </select>
              <select defaultValue="1">
                <option>1장</option>
                <option>3장</option>
                <option>8장</option>
                <option>23장</option>
              </select>
              <select defaultValue="1">
                <option>1절</option>
                <option>2절</option>
                <option>16절</option>
                <option>28절</option>
              </select>
            </div>
            {history.length > 0 && (
              <div className="history-list">
                {history.map((item) => (
                  <button type="button" key={item} onClick={() => setText((value) => `${value}\n\n${item}`)}>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="page-count">현재 {pages.length || 0}페이지 생성 예정</div>
        <textarea
          className="notepad"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={'가사나 말씀을 붙여넣으세요.\n\n엔터를 두 번 누르면 새 페이지로 나뉩니다.'}
        />
        <div className="divider-preview">
          {text.includes('\n\n') && <span>--- 페이지 나뉨 ---</span>}
          {pages.some(hasOverflowWarning) && <strong>이 페이지 내용이 너무 많습니다. 직접 줄이세요</strong>}
        </div>
        <footer className="modal-actions">
          <button className="primary-button" type="button" onClick={save} disabled={!pages.length}>
            <Save size={18} /> 저장
          </button>
          <button className="secondary-button" type="button" onClick={() => setPreviewOpen(true)} disabled={!pages.length}>
            <Eye size={18} /> 미리보기
          </button>
          <button className="secondary-button" type="button" onClick={onClose}>
            취소
          </button>
        </footer>
      </section>
      {previewOpen && <SlidePreviewModal pages={pages} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
