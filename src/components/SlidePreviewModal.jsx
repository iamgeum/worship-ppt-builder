import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

export default function SlidePreviewModal({ pages, onClose }) {
  const [index, setIndex] = useState(0);
  const current = pages[index] || '';

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="preview-modal">
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
        <div className="preview-stage">
          <button
            className="icon-button"
            type="button"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            aria-label="이전"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="slide-preview-large">
            <p>{current}</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setIndex(Math.min(pages.length - 1, index + 1))}
            disabled={index === pages.length - 1}
            aria-label="다음"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="preview-count">
          {index + 1} / {pages.length}
        </div>
      </section>
    </div>
  );
}
