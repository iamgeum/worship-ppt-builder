/**
 * 폰트 자동 조정 함수
 * TextEditorAgent, EditorAgent에서 사용
 */

/**
 * 텍스트 길이에 따라 최적 폰트 크기 계산
 * @param {string} text - 텍스트 내용
 * @param {number} maxFontSize - 최대 폰트 크기 (기본값: 22pt)
 * @param {number} minFontSize - 최소 폰트 크기 (기본값: 10pt)
 * @returns {number} 계산된 폰트 크기
 */
export function calculateOptimalFontSize(text, maxFontSize = 22, minFontSize = 10) {
  if (!text || typeof text !== 'string') return maxFontSize;

  const textLength = text.length;
  
  let fontSize = maxFontSize;
  
  if (textLength > 300) {
    fontSize = minFontSize;
  } else if (textLength > 200) {
    fontSize = minFontSize + 2;
  } else if (textLength > 100) {
    fontSize = maxFontSize - 4;
  } else if (textLength > 50) {
    fontSize = maxFontSize - 2;
  }

  return Math.max(minFontSize, Math.min(maxFontSize, fontSize));
}

/**
 * 슬라이드 내에 텍스트가 맞는지 확인하고 필요시 폰트 크기 조정
 */
export function fitTextInSlide(text, width, height, currentFontSize = 22) {
  if (!text || typeof text !== 'string') {
    return { fontSize: currentFontSize, overflow: false, warning: null };
  }

  const textLength = text.length;
  const lineCount = text.split('\n').length;
  
  const estimatedHeight = (currentFontSize / 16) * lineCount * 1.5;
  const estimatedWidth = (currentFontSize / 16) * textLength / 20;
  
  const overflowHeight = estimatedHeight > height * 0.9;
  const overflowWidth = estimatedWidth > width * 0.9;
  
  let fontSize = currentFontSize;
  let warning = null;

  if (overflowHeight || overflowWidth) {
    fontSize = calculateOptimalFontSize(text);
    
    if (fontSize === 10) {
      warning = '이 페이지 내용이 너무 많습니다. 직접 줄이세요';
    }
  }

  return {
    fontSize,
    overflow: overflowHeight || overflowWidth,
    warning,
  };
}

/**
 * 여러 줄 텍스트의 라인 수 계산
 */
export function countLines(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.split('\n').length;
}

/**
 * 텍스트가 주어진 폰트 크기에서 오버플로우되는지 확인
 */
export function isTextOverflow(text, fontSize, maxWidth, maxHeight) {
  if (!text || typeof text !== 'string') return false;

  const lineCount = countLines(text);
  const estimatedLineHeight = fontSize * 1.5;
  const totalHeight = lineCount * estimatedLineHeight;

  const avgCharsPerLine = Math.floor(maxWidth / (fontSize * 0.5));
  const totalChars = text.replace(/\n/g, '').length;
  const estimatedLinesNeeded = Math.ceil(totalChars / avgCharsPerLine);
  const estimatedHeight = estimatedLinesNeeded * estimatedLineHeight;

  return estimatedHeight > maxHeight || totalHeight > maxHeight;
}

/**
 * 폰트 크기별 권장 최대 글자 수
 */
export function getRecommendedCharLimit(fontSize) {
  if (fontSize >= 22) return 150;
  if (fontSize >= 18) return 180;
  if (fontSize >= 14) return 250;
  if (fontSize >= 12) return 320;
  return 400;
}

/**
 * 텍스트를 권장 글자 수 내로 잘라내기
 */
export function truncateTextByFontSize(text, fontSize = 22) {
  if (!text || typeof text !== 'string') {
    return { truncatedText: '', isTruncated: false, removedChars: 0 };
  }

  const limit = getRecommendedCharLimit(fontSize);
  const cleanText = text.replace(/\n/g, '').trim();

  if (cleanText.length <= limit) {
    return { truncatedText: text, isTruncated: false, removedChars: 0 };
  }

  const truncated = cleanText.slice(0, limit) + '...';
  return {
    truncatedText: truncated,
    isTruncated: true,
    removedChars: cleanText.length - limit,
  };
}
