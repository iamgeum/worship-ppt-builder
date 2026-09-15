/**
 * 텍스트 파싱 및 슬라이드 자동 분할 함수
 * TextEditorAgent에서 사용
 */

/**
 * 텍스트를 페이지별로 분할 (엔터 2번 기준)
 * @param {string} text - 입력 텍스트
 * @returns {Array} 페이지별 텍스트 배열
 * 
 * @example
 * const pages = splitTextByPageBreak("가사1\n\n가사2\n\n가사3");
 * // ["가사1", "가사2", "가사3"]
 */
export function splitTextByPageBreak(text) {
  if (!text || typeof text !== 'string') return [];
  
  // 엔터 2번 이상을 페이지 구분자로 인식
  return text
    .split(/\n\n+/) // 엔터 2번 이상을 기준으로 분할
    .map((page) => page.trim())
    .filter((page) => page.length > 0); // 빈 페이지 제거
}

/**
 * 페이지별 텍스트 배열을 슬라이드 배열로 변환
 * @param {Array} pages - 페이지별 텍스트 배열
 * @param {string} slideTitle - 슬라이드 제목 (기본값: '')
 * @returns {Array} 슬라이드 배열
 * 
 * @example
 * const slides = pagesToSlides(["가사1", "가사2"], "찬양");
 */
export function pagesToSlides(pages, slideTitle = '') {
  return pages.map((text) => ({
    id: crypto.randomUUID(),
    title: slideTitle,
    elements: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        text: text.trim(),
        x: 5,
        y: 5,
        w: 90,
        h: 90,
        fontSize: 22, // 기본값, 나중에 fontSizer로 조정됨
      },
    ],
  }));
}

/**
 * 텍스트를 페이지로 분할하고 슬라이드로 변환
 * @param {string} text - 입력 텍스트
 * @param {string} slideTitle - 슬라이드 제목
 * @returns {Object} { pages: Array, slides: Array }
 */
export function parseTextToSlides(text, slideTitle = '') {
  const pages = splitTextByPageBreak(text);
  const slides = pagesToSlides(pages, slideTitle);
  return { pages, slides };
}

/**
 * 현재 페이지 카운트 계산
 * @param {string} text - 입력 텍스트
 * @returns {number} 예상 페이지 수
 */
export function countPages(text) {
  return splitTextByPageBreak(text).length;
}

/**
 * 텍스트에서 페이지 구분선 표시
 * UI에서 "현재 N페이지 생성 예정" 표시용
 * @param {string} text - 입력 텍스트
 * @returns {string} 페이지 구분선이 시각화된 텍스트
 */
export function visualizePageBreaks(text) {
  return text.replace(/\n\n+/g, '\n\n--- 페이지 나뉨 ---\n\n');
}

/**
 * 페이지 구분선 제거 (저장 시 정규화)
 * @param {string} text - 페이지 구분선을 포함한 텍스트
 * @returns {string} 정규화된 텍스트
 */
export function normalizeText(text) {
  return text
    .replace(/--- 페이지 나뉨 ---/g, '') // 구분선 제거
    .replace(/\n\n\n+/g, '\n\n'); // 3개 이상의 연속 엔터를 2개로 통일
}

/**
 * 성경 구절을 파싱하여 슬라이드로 변환
 * @param {string} bibleText - 성경 텍스트 (예: "창 1:1 태초에...")
 * @param {string} version - 역본명 (예: "개역개정")
 * @returns {Object} 슬라이드 객체
 */
export function bibleToSlide(bibleText, version = '개역개정') {
  return {
    id: crypto.randomUUID(),
    title: `말씀 - ${version}`,
    elements: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        text: bibleText.trim(),
        x: 5,
        y: 5,
        w: 90,
        h: 90,
        fontSize: 20,
      },
    ],
  };
}

/**
 * 여러 성경 구절을 하나의 텍스트로 합치기
 * @param {Array} verses - 성경 구절 배열
 * @returns {string} 합쳐진 텍스트
 */
export function mergeVerses(verses) {
  return verses
    .filter((v) => v && v.text)
    .map((v) => `${v.reference || ''}\n${v.text}`)
    .join('\n\n');
}

/**
 * 텍스트 유효성 검사
 * @param {string} text - 검사할 텍스트
 * @param {number} maxPages - 최대 페이지 수 (기본값: 100)
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateText(text, maxPages = 100) {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: '텍스트가 비어있습니다' };
  }

  const pages = countPages(text);
  if (pages > maxPages) {
    return {
      isValid: false,
      error: `페이지가 너무 많습니다 (${pages}/${maxPages})`,
    };
  }

  if (pages === 0) {
    return { isValid: false, error: '내용이 없습니다' };
  }

  return { isValid: true, error: null };
}
