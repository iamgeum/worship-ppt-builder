/**
 * OrderManagerAgent 액션 함수
 * 슬라이드 추가, 삭제, 순서 변경 로직
 */

import { makeSlide, deleteSlide, reorderSlides } from '../../utils/slideUtils.js';

/**
 * 슬라이드 추가 액션
 * @param {Object} state - 현재 상태
 * @param {Function} updateState - 상태 업데이트 함수
 * @param {Function} setToast - 토스트 메시지 표시 함수
 */
export function handleAddSlide(state, updateState, setToast) {
  updateState((currentState) => ({
    ...currentState,
    slides: [...currentState.slides, makeSlide()],
    currentSlideIndex: currentState.slides.length,
  }));
  setToast('슬라이드를 추가했습니다');
}

/**
 * 슬라이드 삭제 액션
 * @param {Object} state - 현재 상태
 * @param {number} index - 삭제할 슬라이드 인덱스
 * @param {Function} updateState - 상태 업데이트 함수
 * @param {Function} setToast - 토스트 메시지 표시 함수
 */
export function handleDeleteSlide(state, index, updateState, setToast) {
  if (!window.confirm('정말 삭제하시겠어요?')) return;

  updateState((currentState) => {
    const nextSlides = deleteSlide(currentState.slides, index);
    return {
      ...currentState,
      slides: nextSlides.length ? nextSlides : [makeSlide()],
      currentSlideIndex: Math.max(0, Math.min(currentState.currentSlideIndex, nextSlides.length - 1)),
    };
  });
  setToast('삭제되었습니다');
}

/**
 * 슬라이드 순서 변경 액션 (드래그&드롭)
 * @param {Object} state - 현재 상태
 * @param {number} fromIndex - 이동할 슬라이드 인덱스
 * @param {number} toIndex - 대상 위치 인덱스
 * @param {Function} updateState - 상태 업데이트 함수
 */
export function handleReorderSlides(state, fromIndex, toIndex, updateState) {
  if (fromIndex === null || fromIndex === toIndex) return;

  updateState((currentState) => ({
    ...currentState,
    slides: reorderSlides(currentState.slides, fromIndex, toIndex),
    currentSlideIndex: toIndex,
  }));
}

/**
 * 특정 슬라이드로 이동
 * @param {number} slideNumber - 슬라이드 번호 (1-based)
 * @param {Function} updateState - 상태 업데이트 함수
 */
export function handleJumpToSlide(slideNumber, updateState) {
  updateState((currentState) => ({
    ...currentState,
    currentSlideIndex: slideNumber - 1,
  }));
}

/**
 * 슬라이드 선택 (클릭)
 * @param {number} index - 선택할 슬라이드 인덱스
 * @param {Function} updateState - 상태 업데이트 함수
 * @param {Function} onOpenEditor - 에디터 열기 콜백
 */
export function handleSelectSlide(index, updateState, onOpenEditor) {
  updateState((currentState) => ({
    ...currentState,
    currentSlideIndex: index,
  }));
  onOpenEditor();
}
