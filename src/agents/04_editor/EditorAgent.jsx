import {
  Download,
  GripVertical,
  Image,
  ListChecks,
  Plus,
  RectangleHorizontal,
  RotateCcw,
  Settings,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWorship } from '../../context/WorshipContext.jsx';
import { exportSlidesToPptx, inspectSlides } from '../../utils/pptxExporter.js';
import { getSlideText, makeSlide } from '../../utils/slideHelpers.js';

const presetClass = {
  clean: 'preset-clean',
  dark: 'preset-dark',
  photo: 'preset-photo',
  warm: 'preset-warm',
};

export default function EditorAgent({ title = 'PPT 만들기', onAddLyrics, onAddScripture }) {
  const { slides, currentSlideIndex, slideFormat, stylePreset, autoSavedAt, updateState, undo, canUndo, setToast } =
    useWorship();
  const [selectedId, setSelectedId] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [qualityIssues, setQualityIssues] = useState(null);
  const [exporting, setExporting] = useState(false);
  const currentSlide = slides[currentSlideIndex] || slides[0];

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo]);

  const updateElement = (elementId, patch) => {
    updateState((state) => ({
      ...state,
      slides: state.slides.map((slide, slideIndex) =>
        slideIndex === state.currentSlideIndex
          ? {
              ...slide,
              elements: slide.elements.map((element) =>
                element.id === elementId ? { ...element, ...patch } : element,
              ),
            }
          : slide,
      ),
    }));
  };

  const addElement = (type) => {
    const element = {
      id: crypto.randomUUID(),
      type,
      text: type === 'text' ? '새 텍스트' : '',
      altText: '',
      x: type === 'shape' ? 35 : 24,
      y: type === 'shape' ? 34 : 28,
      w: type === 'shape' ? 30 : 44,
      h: type === 'shape' ? 20 : 18,
      fontSize: 22,
      src: '',
    };
    updateState((state) => ({
      ...state,
      slides: state.slides.map((slide, index) =>
        index === state.currentSlideIndex ? { ...slide, elements: [...slide.elements, element] } : slide,
      ),
    }));
    setSelectedId(element.id);
  };

  const addSlide = () => {
    updateState((state) => ({
      ...state,
      slides: [...state.slides, makeSlide()],
      currentSlideIndex: state.slides.length,
    }));
    setSelectedId(null);
    setToast('슬라이드를 추가했습니다');
  };

  const deleteSlide = (index = currentSlideIndex) => {
    if (!window.confirm('정말 삭제하시겠어요?')) return;
    updateState((state) => {
      const nextSlides = state.slides.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...state,
        slides: nextSlides.length ? nextSlides : [makeSlide()],
        currentSlideIndex: Math.max(0, Math.min(index, nextSlides.length - 1)),
      };
    });
    setSelectedId(null);
    setToast('삭제되었습니다');
  };

  const reorderSlides = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    updateState((state) => {
      const next = [...state.slides];
      const [moving] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moving);
      return { ...state, slides: next, currentSlideIndex: targetIndex };
    });
  };

  const finishDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
    setDragPreview(null);
  };

  const runQualityCheck = () => {
    const issues = inspectSlides(slides);
    setQualityIssues(issues);
    setToast(issues.length ? `점검할 항목 ${issues.length}개가 있습니다` : '품질 점검 통과 ✓');
  };

  const downloadPptx = async () => {
    setExporting(true);
    try {
      await exportSlidesToPptx({ slides, slideFormat, stylePreset });
      setToast('PPTX 다운로드를 시작했습니다');
    } catch (error) {
      console.error(error);
      setToast('PPTX 내보내기에 실패했습니다');
    } finally {
      setExporting(false);
    }
  };

  const moveBySwipe = (deltaX) => {
    const rawSteps = Math.max(-4, Math.min(4, Math.round(deltaX / 110)));
    if (!rawSteps) return;
    updateState((state) => ({
      ...state,
      currentSlideIndex: Math.max(0, Math.min(state.slides.length - 1, state.currentSlideIndex - rawSteps)),
    }));
  };

  const handlePointerDown = (event) => {
    if (event.target.closest('.slide-element')) return;
    setDragStart(event.clientX);
  };

  const handlePointerUp = (event) => {
    if (dragStart === null) return;
    moveBySwipe(event.clientX - dragStart);
    setDragStart(null);
  };

  return (
    <section className="editor-page combined-workspace">
      <header className="editor-toolbar">
        <div className="editor-title-block">
          <p className="eyebrow">Agent 3</p>
          <h1>{title}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={undo} disabled={!canUndo}>
          <RotateCcw size={18} /> 되돌리기
        </button>
        <button className="secondary-button" type="button">
          <Settings size={18} /> 슬라이드 규격 설정
        </button>
        <button className="primary-button" type="button" onClick={onAddLyrics}>
          가사 추가
        </button>
        <button className="primary-button" type="button" onClick={onAddScripture}>
          말씀 추가
        </button>
        <button className="secondary-button" type="button" onClick={addSlide}>
          <Plus size={18} /> 추가
        </button>
        <button className="danger-button" type="button" onClick={() => deleteSlide(currentSlideIndex)}>
          <Trash2 size={18} /> 삭제
        </button>
        <button className="secondary-button" type="button" onClick={runQualityCheck}>
          <ListChecks size={18} /> 품질 점검
        </button>
        <button className="export-button" type="button" onClick={downloadPptx} disabled={exporting}>
          <Download size={18} /> {exporting ? '내보내는 중' : 'PPTX 다운로드'}
        </button>
        <span className="autosave">자동저장됨 {autoSavedAt || '방금'}</span>
      </header>

      <div className="editor-layout">
        <aside className="order-rail" onDragEnd={finishDrag}>
          {slides.map((slide, index) => (
            <div className="rail-row" key={slide.id}>
              <button className="rail-grip" type="button" aria-label="순서 이동">
                <GripVertical size={18} />
              </button>
              <button
                className={`rail-card ${currentSlideIndex === index ? 'active' : ''} ${
                  dragIndex === index ? 'dragging' : ''
                } ${dropIndex === index && dragIndex !== index ? 'drop-before' : ''}`}
                type="button"
                draggable
                onClick={() => {
                  updateState((state) => ({ ...state, currentSlideIndex: index }));
                  setSelectedId(null);
                }}
                onDragStart={(event) => {
                  setDragIndex(index);
                  setDropIndex(index);
                  setDragPreview({ x: event.clientX, y: event.clientY, text: getSlideText(slide) || '빈 슬라이드' });
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropIndex(index);
                  setDragPreview((value) =>
                    value ? { ...value, x: event.clientX, y: event.clientY } : value,
                  );
                }}
                onDrop={() => {
                  reorderSlides(index);
                  finishDrag();
                }}
              >
                <strong>{index + 1}</strong>
                <p>{getSlideText(slide) || '빈 슬라이드'}</p>
              </button>
              <button className="rail-delete" type="button" onClick={() => deleteSlide(index)} aria-label="삭제">
                <X size={16} />
              </button>
            </div>
          ))}
        </aside>

        <div className="editor-main">
          <div className="insert-toolbar">
            <button className="icon-text-button" type="button" onClick={() => addElement('text')}>
              <Type size={18} /> 텍스트
            </button>
            <button className="icon-text-button" type="button" onClick={() => addElement('shape')}>
              <RectangleHorizontal size={18} /> 도형
            </button>
            <button className="icon-text-button" type="button" onClick={() => addElement('image')}>
              <Image size={18} /> 이미지
            </button>
          </div>

          <div className="editor-stage-wrap">
            <div
              className={`editor-slide ${presetClass[stylePreset] || presetClass.clean}`}
              style={{ aspectRatio: slideFormat.ratio.replace(':', ' / ') }}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              <div className="margin-guide" style={{ inset: slideFormat.margin / 6 }} />
              {currentSlide.elements.map((element) => (
                <SlideElement
                  key={element.id}
                  element={element}
                  selected={selectedId === element.id}
                  onSelect={() => setSelectedId(element.id)}
                  onUpdate={(patch) => updateElement(element.id, patch)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {dragPreview && (
        <div className="drag-preview" style={{ left: dragPreview.x + 16, top: dragPreview.y + 16 }}>
          {dragPreview.text}
        </div>
      )}

      {qualityIssues && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <section className="small-modal quality-modal">
            <header className="quality-header">
              <h2>품질 점검</h2>
              <button className="icon-button" type="button" onClick={() => setQualityIssues(null)} aria-label="닫기">
                <X size={18} />
              </button>
            </header>
            {qualityIssues.length === 0 ? (
              <p className="success-copy">바로 내보내도 괜찮습니다.</p>
            ) : (
              <div className="quality-list">
                {qualityIssues.map((issue, index) => (
                  <button
                    className={`quality-item ${issue.level}`}
                    type="button"
                    key={`${issue.slideNumber}-${issue.message}-${index}`}
                    onClick={() => {
                      updateState((state) => ({ ...state, currentSlideIndex: issue.slideNumber - 1 }));
                      setQualityIssues(null);
                    }}
                  >
                    <strong>{issue.slideNumber}번</strong>
                    <span>{issue.message}</span>
                  </button>
                ))}
              </div>
            )}
            <footer className="modal-actions">
              <button className="export-button" type="button" onClick={downloadPptx} disabled={exporting}>
                <Download size={18} /> PPTX 다운로드
              </button>
              <button className="secondary-button" type="button" onClick={() => setQualityIssues(null)}>
                닫기
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

function SlideElement({ element, selected, onSelect, onUpdate }) {
  const [moving, setMoving] = useState(null);
  const [editingInnerText, setEditingInnerText] = useState(false);

  const onPointerMove = (event) => {
    if (!moving) return;
    const parent = event.currentTarget.parentElement.getBoundingClientRect();
    const nextX = ((event.clientX - parent.left - moving.offsetX) / parent.width) * 100;
    const nextY = ((event.clientY - parent.top - moving.offsetY) / parent.height) * 100;
    const snappedX = Math.abs(nextX - 50) < 2 ? 50 : Math.max(0, Math.min(92, nextX));
    const snappedY = Math.abs(nextY - 50) < 2 ? 50 : Math.max(0, Math.min(88, nextY));
    onUpdate({ x: snappedX, y: snappedY });
  };

  return (
    <div
      className={`slide-element ${selected ? 'selected' : ''} ${element.type}`}
      style={{ left: `${element.x}%`, top: `${element.y}%`, width: `${element.w}%`, height: `${element.h}%` }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
        if (event.target.matches('textarea, input')) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setMoving({ offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY });
      }}
      onPointerMove={onPointerMove}
      onPointerUp={() => setMoving(null)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (element.type !== 'text') setEditingInnerText(true);
      }}
    >
      {element.type === 'text' && (
        <textarea
          value={element.text}
          style={{ fontSize: element.fontSize }}
          onChange={(event) => onUpdate({ text: event.target.value })}
        />
      )}
      {element.type === 'shape' && (
        <div className="shape-box">
          {(editingInnerText || element.altText) && (
            <textarea
              autoFocus={editingInnerText}
              value={element.altText}
              placeholder="텍스트 입력"
              onBlur={() => setEditingInnerText(false)}
              onChange={(event) => onUpdate({ altText: event.target.value })}
            />
          )}
        </div>
      )}
      {element.type === 'image' && (
        <div className="image-box">
          <input
            value={element.src}
            placeholder="이미지 URL"
            onChange={(event) => onUpdate({ src: event.target.value })}
          />
          {element.src && <img src={element.src} alt="" />}
          {(editingInnerText || element.altText) && (
            <textarea
              autoFocus={editingInnerText}
              value={element.altText}
              placeholder="텍스트 입력"
              onBlur={() => setEditingInnerText(false)}
              onChange={(event) => onUpdate({ altText: event.target.value })}
            />
          )}
        </div>
      )}
      {selected && <span className="position-badge">x {Math.round(element.x)} y {Math.round(element.y)}</span>}
    </div>
  );
}
