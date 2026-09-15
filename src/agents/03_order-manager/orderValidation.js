/**
 * OrderManagerAgent 유효성 검사 함수
 * 빈 슬라이드 감지 등
 */

import { getSlideText, findEmptySlides } from '../../utils/slideUtils.js';

/**
 * 저장 전 검증
 * @param {Array} slides - 슬라이드 배열
 * @returns {Object} { isValid: boolean, emptySlides: Array, message: string|null }
 */
export function validateBeforeSave(slides) {
  const empty = findEmptySlides(slides);

  if (empty.length > 0) {
    return {
      isValid: false,
      emptySlides: empty,
      message: `비어있는 슬라이드가 있습니다: ${empty.join(', ')}번`,
    };
  }

  return {
    isValid: true,
    emptySlides: [],
    message: null,
  };
}

/**
 * 슬라이드 통계 계산
 * @param {Array} slides - 슬라이드 배열
 * @returns {Object} { total: number, empty: number, filled: number }
 */
export function calculateSlideStats(slides) {
  const total = slides.length;
  const empty = findEmptySlides(slides).length;
  const filled = total - empty;

  return { total, empty, filled };
}

/**
 * 슬라이드 상태 요약
 * @param {Array} slides - 슬라이드 배열
 * @returns {string} 상태 텍스트
 */
export function getSlidesSummary(slides) {
  const { total, empty, filled } = calculateSlideStats(slides);
  return `총 ${total}개 슬라이드 (채워진: ${filled}, 빈: ${empty})`;
}

/**
 * 슬라이드 유효성 개별 검사
 * @param {Object} slide - 슬라이드
 * @returns {Object} { isValid: boolean, reason: string|null }
 */
export function validateSlide(slide) {
  if (!slide) {
    return { isValid: false, reason: '슬라이드가 없습니다' };
  }

  const text = getSlideText(slide);
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: '텍스트가 비어있습니다' };
  }

  return { isValid: true, reason: null };
}
