import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ClipboardPaste,
  Copy,
  Download,
  GripVertical,
  Image,
  ListChecks,
  MoveDown,
  MoveUp,
  Plus,
  RectangleHorizontal,
  RotateCcw,
  Settings,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useWorship } from '../../context/WorshipContext.jsx';
import { exportSlidesToPptx, inspectSlides } from '../../utils/pptxExporter.js';
import { getSlideText, makeSlide } from '../../utils/slideHelpers.js';

const presetClass = {
  clean: 'preset-clean',
  dark: 'preset-dark',
  photo: 'preset-photo',
  warm: 'preset-warm',
};

function clampElementBounds(element) {
  return {
    ...element,
    x: Math.max(0, Math.min(100 - element.w, element.x)),
    y: Math.max(0, Math.min(100 - element.h, element.y)),
  };
}

function getSnapValue(value, guides, threshold = 1.4) {
  const matchedGuide = guides.find((guide) => Math.abs(value - guide) <= threshold);
  return matchedGuide ?? value;
}

function getSnappedPosition(element, elements, nextX, nextY) {
  const otherElements = elements.filter((item) => item.id !== element.id);
  const xGuides = [0, 50, 100 - element.w];
  const yGuides = [0, 50, 100 - element.h];

  otherElements.forEach((item) => {
    xGuides.push(item.x, item.x + item.w / 2 - element.w / 2, item.x + item.w - element.w);
    yGuides.push(item.y, item.y + item.h / 2 - element.h / 2, item.y + item.h - element.h);
  });

  return {
    x: Math.max(0, Math.min(100 - element.w, getSnapValue(nextX, xGuides))),
    y: Math.max(0, Math.min(100 - element.h, getSnapValue(nextY, yGuides))),
  };
}

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
  const [copiedElement, setCopiedElement] = useState(null);
  const imageUploadRef = useRef(null);
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const selectedElement = currentSlide?.elements.find((element) => element.id === selectedId);
  const selectedElementIndex = currentSlide?.elements.findIndex((element) => element.id === selectedId) ?? -1;

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const isEditingText = target?.matches?.('textarea, input, select, [contenteditable="true"]');
      if (isEditingText) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && selectedElement) {
        event.preventDefault();
        copySelectedElement();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v' && copiedElement) {
        event.preventDefault();
        pasteCopiedElement();
        return;
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedElement) {
        event.preventDefault();
        deleteSelectedElement();
        return;
      }
      if (selectedElement && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 5 : 1;
        const movement = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        }[event.key];
        moveSelectedElement(movement[0], movement[1]);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ']' && selectedElement) {
        event.preventDefault();
        changeLayerOrder('forward');
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === '[' && selectedElement) {
        event.preventDefault();
        changeLayerOrder('backward');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [copiedElement, selectedElement, undo]);

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

  const addUploadedImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const element = {
        id: crypto.randomUUID(),
        type: 'image',
        text: '',
        altText: '',
        x: 22,
        y: 22,
        w: 56,
        h: 46,
        fontSize: 18,
        src: reader.result,
      };
      updateState((state) => ({
        ...state,
        slides: state.slides.map((slide, index) =>
          index === state.currentSlideIndex ? { ...slide, elements: [...slide.elements, element] } : slide,
        ),
      }));
      setSelectedId(element.id);
      setToast('이미지를 추가했습니다');
    });
    reader.readAsDataURL(file);
  };

  const deleteSelectedElement = () => {
    if (!selectedId) return;
    updateState((state) => ({
      ...state,
      slides: state.slides.map((slide, index) =>
        index === state.currentSlideIndex
          ? { ...slide, elements: slide.elements.filter((element) => element.id !== selectedId) }
          : slide,
      ),
    }));
    setSelectedId(null);
    setToast('요소를 삭제했습니다');
  };

  const copySelectedElement = () => {
    if (!selectedElement) return;
    setCopiedElement({ ...selectedElement });
    setToast('요소를 복사했습니다');
  };

  const pasteCopiedElement = () => {
    if (!copiedElement) return;
    const element = {
      ...copiedElement,
      id: crypto.randomUUID(),
      x: Math.max(0, Math.min(100 - copiedElement.w, copiedElement.x + 3)),
      y: Math.max(0, Math.min(100 - copiedElement.h, copiedElement.y + 3)),
    };
    updateState((state) => ({
      ...state,
      slides: state.slides.map((slide, index) =>
        index === state.currentSlideIndex ? { ...slide, elements: [...slide.elements, element] } : slide,
      ),
    }));
    setSelectedId(element.id);
    setToast('붙여넣었습니다');
  };

  const moveSelectedElement = (deltaX, deltaY) => {
    if (!selectedId) return;
    updateState((state) => ({
      ...state,
      slides: state.slides.map((slide, index) =>
        index === state.currentSlideIndex
          ? {
              ...slide,
              elements: slide.elements.map((element) =>
                element.id === selectedId
                  ? {
                      ...element,
                      x: Math.max(0, Math.min(100 - element.w, element.x + deltaX)),
                      y: Math.max(0, Math.min(100 - element.h, element.y + deltaY)),
                    }
                  : element,
              ),
            }
          : slide,
      ),
    }));
  };

  const changeLayerOrder = (direction) => {
    if (!selectedId) return;
    updateState((state) => ({
      ...state,
      slides: state.slides.map((slide, index) => {
        if (index !== state.currentSlideIndex) return slide;
        const currentIndex = slide.elements.findIndex((element) => element.id === selectedId);
        if (currentIndex < 0) return slide;
        const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= slide.elements.length) return slide;
        const nextElements = [...slide.elements];
        const [moving] = nextElements.splice(currentIndex, 1);
        nextElements.splice(targetIndex, 0, moving);
        return { ...slide, elements: nextElements };
      }),
    }));
    setToast(direction === 'forward' ? '앞으로 보냈습니다' : '뒤로 보냈습니다');
  };

  const alignSelectedElement = (alignment) => {
    if (!selectedId) return;
    updateState((state) => ({
      ...state,
      slides: state.slides.map((slide, index) =>
        index === state.currentSlideIndex
          ? {
              ...slide,
              elements: slide.elements.map((element) => {
                if (element.id !== selectedId) return element;
                const aligned = { ...element };
                if (alignment === 'left') aligned.x = 0;
                if (alignment === 'centerX') aligned.x = (100 - element.w) / 2;
                if (alignment === 'right') aligned.x = 100 - element.w;
                if (alignment === 'top') aligned.y = 0;
                if (alignment === 'centerY') aligned.y = (100 - element.h) / 2;
                if (alignment === 'bottom') aligned.y = 100 - element.h;
                return clampElementBounds(aligned);
              }),
            }
          : slide,
      ),
    }));
    setToast('정렬했습니다');
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
            <button className="icon-text-button" type="button" onClick={() => imageUploadRef.current?.click()}>
              <Upload size={18} /> 업로드
            </button>
            <span className="toolbar-divider" />
            <button className="icon-text-button" type="button" onClick={copySelectedElement} disabled={!selectedElement}>
              <Copy size={18} /> 요소 복사
            </button>
            <button className="icon-text-button" type="button" onClick={pasteCopiedElement} disabled={!copiedElement}>
              <ClipboardPaste size={18} /> 붙여넣기
            </button>
            <button
              className="danger-tool-button"
              type="button"
              onClick={deleteSelectedElement}
              disabled={!selectedElement}
            >
              <Trash2 size={18} /> 요소 삭제
            </button>
            <span className="toolbar-divider" />
            <button
              className="icon-button"
              type="button"
              onClick={() => changeLayerOrder('backward')}
              disabled={!selectedElement || selectedElementIndex <= 0}
              aria-label="뒤로 보내기"
              title="뒤로 보내기"
            >
              <MoveDown size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => changeLayerOrder('forward')}
              disabled={!selectedElement || selectedElementIndex >= currentSlide.elements.length - 1}
              aria-label="앞으로 보내기"
              title="앞으로 보내기"
            >
              <MoveUp size={18} />
            </button>
            <span className="toolbar-divider" />
            <button
              className="icon-button"
              type="button"
              onClick={() => alignSelectedElement('left')}
              disabled={!selectedElement}
              aria-label="왼쪽 정렬"
              title="왼쪽 정렬"
            >
              <AlignStartVertical size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => alignSelectedElement('centerX')}
              disabled={!selectedElement}
              aria-label="가운데 정렬"
              title="가운데 정렬"
            >
              <AlignCenterVertical size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => alignSelectedElement('right')}
              disabled={!selectedElement}
              aria-label="오른쪽 정렬"
              title="오른쪽 정렬"
            >
              <AlignEndVertical size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => alignSelectedElement('top')}
              disabled={!selectedElement}
              aria-label="위쪽 정렬"
              title="위쪽 정렬"
            >
              <AlignStartHorizontal size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => alignSelectedElement('centerY')}
              disabled={!selectedElement}
              aria-label="중앙 정렬"
              title="중앙 정렬"
            >
              <AlignCenterHorizontal size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => alignSelectedElement('bottom')}
              disabled={!selectedElement}
              aria-label="아래쪽 정렬"
              title="아래쪽 정렬"
            >
              <AlignEndHorizontal size={18} />
            </button>
            <input
              ref={imageUploadRef}
              className="hidden-file-input"
              type="file"
              accept="image/*"
              onChange={(event) => {
                addUploadedImage(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
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
                  siblingElements={currentSlide.elements}
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

function SlideElement({ element, siblingElements, selected, onSelect, onUpdate }) {
  const [moving, setMoving] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [editingInnerText, setEditingInnerText] = useState(false);

  useEffect(() => {
    if (!resizing) return undefined;

    const onPointerMove = (event) => {
      const deltaX = ((event.clientX - resizing.startX) / resizing.parent.width) * 100;
      const deltaY = ((event.clientY - resizing.startY) / resizing.parent.height) * 100;
      const next = {
        x: resizing.start.x,
        y: resizing.start.y,
        w: resizing.start.w,
        h: resizing.start.h,
      };

      if (resizing.corner.includes('e')) next.w = Math.max(5, resizing.start.w + deltaX);
      if (resizing.corner.includes('s')) next.h = Math.max(5, resizing.start.h + deltaY);
      if (resizing.corner.includes('w')) {
        const candidateWidth = Math.max(5, resizing.start.w - deltaX);
        next.x = Math.min(resizing.start.x + resizing.start.w - 5, resizing.start.x + deltaX);
        next.w = candidateWidth;
      }
      if (resizing.corner.includes('n')) {
        const candidateHeight = Math.max(5, resizing.start.h - deltaY);
        next.y = Math.min(resizing.start.y + resizing.start.h - 5, resizing.start.y + deltaY);
        next.h = candidateHeight;
      }

      next.x = Math.max(0, Math.min(95, next.x));
      next.y = Math.max(0, Math.min(95, next.y));
      next.w = Math.min(100 - next.x, next.w);
      next.h = Math.min(100 - next.y, next.h);
      onUpdate(next);
    };

    const onPointerUp = () => setResizing(null);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onUpdate, resizing]);

  const onPointerMove = (event) => {
    if (!moving) return;
    const parent = event.currentTarget.parentElement.getBoundingClientRect();
    const nextX = ((event.clientX - parent.left - moving.offsetX) / parent.width) * 100;
    const nextY = ((event.clientY - parent.top - moving.offsetY) / parent.height) * 100;
    onUpdate(getSnappedPosition(element, siblingElements, nextX, nextY));
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
      {selected &&
        ['nw', 'ne', 'sw', 'se'].map((corner) => (
          <button
            className={`resize-handle ${corner}`}
            type="button"
            key={corner}
            aria-label={`${corner} 크기 조절`}
            onPointerDown={(event) => {
              event.stopPropagation();
              const parent = event.currentTarget.closest('.editor-slide').getBoundingClientRect();
              setMoving(null);
              setResizing({
                corner,
                startX: event.clientX,
                startY: event.clientY,
                parent,
                start: { x: element.x, y: element.y, w: element.w, h: element.h },
              });
            }}
          />
        ))}
    </div>
  );
}
