import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import FloatingActionButton from '../../components/FloatingActionButton.jsx';
import { useWorship } from '../../context/WorshipContext.jsx';
import { getSlideText, makeSlide } from '../../utils/slideHelpers.js';

export default function OrderManagerAgent({ onOpenEditor }) {
  const { slides, currentSlideIndex, updateState, setToast } = useWorship();
  const [dragIndex, setDragIndex] = useState(null);
  const [emptySlides, setEmptySlides] = useState([]);

  const addSlide = () => {
    updateState((state) => ({
      ...state,
      slides: [...state.slides, makeSlide()],
      currentSlideIndex: state.slides.length,
    }));
    setToast('슬라이드를 추가했습니다');
  };

  const deleteSlide = (index) => {
    if (!window.confirm('정말 삭제하시겠어요?')) return;
    updateState((state) => {
      const nextSlides = state.slides.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...state,
        slides: nextSlides.length ? nextSlides : [makeSlide()],
        currentSlideIndex: Math.max(0, Math.min(state.currentSlideIndex, nextSlides.length - 1)),
      };
    });
    setToast('삭제되었습니다');
  };

  const reorder = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    updateState((state) => {
      const next = [...state.slides];
      const [moving] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moving);
      return { ...state, slides: next, currentSlideIndex: targetIndex };
    });
    setDragIndex(null);
  };

  const save = () => {
    const empty = slides
      .map((slide, index) => (getSlideText(slide) ? null : index + 1))
      .filter(Boolean);
    if (empty.length) {
      setEmptySlides(empty);
      return;
    }
    setToast('저장되었습니다 ✓');
  };

  const jumpToSlide = (slideNumber) => {
    updateState((state) => ({ ...state, currentSlideIndex: slideNumber - 1 }));
    setEmptySlides([]);
    onOpenEditor();
  };

  return (
    <section className="page-panel order-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Agent 3</p>
          <h1>순서페이지 관리</h1>
        </div>
        <button className="primary-button" type="button" onClick={save}>
          <Save size={18} /> 저장
        </button>
      </header>

      <div className="slide-list">
        {slides.map((slide, index) => (
          <article
            className={`slide-row ${currentSlideIndex === index ? 'active' : ''}`}
            key={slide.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => reorder(index)}
          >
            <button className="drag-handle" type="button" aria-label="순서 이동">
              <GripVertical size={20} />
            </button>
            <button
              className="thumbnail"
              type="button"
              onClick={() => {
                updateState((state) => ({ ...state, currentSlideIndex: index }));
                onOpenEditor();
              }}
            >
              <span>{index + 1}</span>
              <p>{getSlideText(slide) || '빈 슬라이드'}</p>
            </button>
            <button
              className="inside-plus"
              type="button"
              onClick={() => {
                updateState((state) => ({ ...state, currentSlideIndex: index }));
                onOpenEditor();
              }}
              aria-label="편집 열기"
            >
              <Plus size={19} />
            </button>
            <button className="delete-outside" type="button" onClick={() => deleteSlide(index)} aria-label="삭제">
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>

      <div className="floating-actions">
        <FloatingActionButton onClick={addSlide}>
          <Plus size={22} /> 추가
        </FloatingActionButton>
      </div>

      {emptySlides.length > 0 && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <section className="small-modal">
            <h2>비어있는 슬라이드가 있습니다</h2>
            <p>{emptySlides.join(', ')}번</p>
            <div className="number-buttons">
              {emptySlides.map((number) => (
                <button type="button" key={number} onClick={() => jumpToSlide(number)}>
                  {number}
                </button>
              ))}
            </div>
            <button className="secondary-button" type="button" onClick={() => setEmptySlides([])}>
              닫기
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
