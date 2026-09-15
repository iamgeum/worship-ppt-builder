/**
 * 슬라이드 배열 조작 함수들
 * OrderManagerAgent와 EditorAgent에서 사용
 */

/**
 * 새로운 빈 슬라이드 생성
 * @param {string} title - 슬라이드 제목 (기본값: '')
 * @returns {Object} 새로운 슬라이드 객체
 */
export function makeSlide(title = '') {
  return {
    id: crypto.randomUUID(),
    title,
    elements: [],
  };
}

/**
 * 슬라이드에서 텍스트 추출
 * @param {Object} slide - 슬라이드 객체
 * @returns {string} 슬라이드의 모든 텍스트를 공백으로 연결
 */
export function getSlideText(slide) {
  if (!slide || !slide.elements) return '';
  return slide.elements
    .filter((el) => el.type === 'text' && el.text)
    .map((el) => el.text)
    .join(' ')
    .trim();
}

/**
 * 슬라이드 목록에 새 슬라이드 추가
 * @param {Array} slides - 현재 슬라이드 배열
 * @param {Object} newSlide - 추가할 슬라이드
 * @param {number} index - 삽입 위치 (기본값: 맨 뒤)
 * @returns {Array} 새로운 슬라이드 배열
 */
export function addSlide(slides, newSlide, index = -1) {
  if (index === -1 || index >= slides.length) {
    return [...slides, newSlide];
  }
  return [...slides.slice(0, index + 1), newSlide, ...slides.slice(index + 1)];
}

/**
 * 슬라이드 목록에서 특정 슬라이드 삭제
 * @param {Array} slides - 현재 슬라이드 배열
 * @param {number} index - 삭제할 슬라이드 인덱스
 * @returns {Array} 삭제된 새로운 슬라이드 배열
 */
export function deleteSlide(slides, index) {
  return slides.filter((_, i) => i !== index);
}

/**
 * 슬라이드 순서 변경 (드래그&드롭)
 * @param {Array} slides - 현재 슬라이드 배열
 * @param {number} fromIndex - 이동할 슬라이드 인덱스
 * @param {number} toIndex - 대상 위치 인덱스
 * @returns {Array} 재정렬된 슬라이드 배열
 */
export function reorderSlides(slides, fromIndex, toIndex) {
  const result = [...slides];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * 빈 슬라이드 인덱스 찾기
 * @param {Array} slides - 슬라이드 배열
 * @returns {Array} 빈 슬라이드의 1-based 인덱스 배열 (사용자 표시용)
 */
export function findEmptySlides(slides) {
  return slides
    .map((slide, index) => (getSlideText(slide) ? null : index + 1))
    .filter(Boolean);
}

/**
 * 슬라이드 요소 추가
 * @param {Object} slide - 대상 슬라이드
 * @param {Object} element - 추가할 요소 (type, text, x, y, w, h, fontSize 등)
 * @returns {Object} 요소가 추가된 새로운 슬라이드
 */
export function addElementToSlide(slide, element) {
  return {
    ...slide,
    elements: [
      ...slide.elements,
      {
        ...element,
        id: element.id || crypto.randomUUID(),
      },
    ],
  };
}

/**
 * 슬라이드에서 특정 요소 제거
 * @param {Object} slide - 대상 슬라이드
 * @param {string} elementId - 제거할 요소 ID
 * @returns {Object} 요소가 제거된 새로운 슬라이드
 */
export function removeElementFromSlide(slide, elementId) {
  return {
    ...slide,
    elements: slide.elements.filter((el) => el.id !== elementId),
  };
}

/**
 * 슬라이드의 특정 요소 업데이트
 * @param {Object} slide - 대상 슬라이드
 * @param {string} elementId - 업데이트할 요소 ID
 * @param {Object} updates - 업데이트할 속성들
 * @returns {Object} 요소가 업데이트된 새로운 슬라이드
 */
export function updateElementInSlide(slide, elementId, updates) {
  return {
    ...slide,
    elements: slide.elements.map((el) =>
      el.id === elementId ? { ...el, ...updates } : el
    ),
  };
}

/**
 * 전체 슬라이드 배열에서 특정 슬라이드 업데이트
 * @param {Array} slides - 슬라이드 배열
 * @param {number} slideIndex - 업데이트할 슬라이드 인덱스
 * @param {Object} updates - 업데이트할 속성들
 * @returns {Array} 업데이트된 새로운 슬라이드 배열
 */
export function updateSlideInList(slides, slideIndex, updates) {
  return slides.map((slide, index) =>
    index === slideIndex ? { ...slide, ...updates } : slide
  );
}
