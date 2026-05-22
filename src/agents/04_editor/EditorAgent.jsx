import { Image, RectangleHorizontal, RotateCcw, Settings, Type } from 'lucide-react';
import { useState } from 'react';
import { useWorship } from '../../context/WorshipContext.jsx';

const presetClass = {
  clean: 'preset-clean',
  dark: 'preset-dark',
  photo: 'preset-photo',
  warm: 'preset-warm',
};

export default function EditorAgent({ onAddLyrics, onAddScripture }) {
  const { slides, currentSlideIndex, slideFormat, stylePreset, autoSavedAt, updateState, undo, canUndo } = useWorship();
  const [selectedId, setSelectedId] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const currentSlide = slides[currentSlideIndex] || slides[0];

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
    <section className="editor-page">
      <header className="editor-toolbar">
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
        <span className="autosave">자동저장됨 {autoSavedAt || '방금'}</span>
      </header>

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

      <div className="bottom-filmstrip">
        {slides.slice(Math.max(0, currentSlideIndex - 2), currentSlideIndex + 3).map((slide) => {
          const absoluteIndex = slides.findIndex((item) => item.id === slide.id);
          return (
            <button
              className={`film-thumb ${absoluteIndex === currentSlideIndex ? 'active' : ''}`}
              type="button"
              key={slide.id}
              onClick={() => updateState((state) => ({ ...state, currentSlideIndex: absoluteIndex }))}
            >
              <span>{absoluteIndex + 1}</span>
              <p>{slide.elements.find((element) => element.type === 'text')?.text || '빈 슬라이드'}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SlideElement({ element, selected, onSelect, onUpdate }) {
  const [moving, setMoving] = useState(null);

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
        event.currentTarget.setPointerCapture(event.pointerId);
        setMoving({ offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY });
      }}
      onPointerMove={onPointerMove}
      onPointerUp={() => setMoving(null)}
    >
      {element.type === 'text' && (
        <textarea
          value={element.text}
          style={{ fontSize: element.fontSize }}
          onChange={(event) => onUpdate({ text: event.target.value })}
        />
      )}
      {element.type === 'shape' && <div className="shape-box" />}
      {element.type === 'image' && (
        <input
          value={element.src}
          placeholder="이미지 URL"
          onChange={(event) => onUpdate({ src: event.target.value })}
        />
      )}
      {selected && <span className="position-badge">x {Math.round(element.x)} y {Math.round(element.y)}</span>}
    </div>
  );
}
