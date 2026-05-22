export function makeSlide(title = '새 슬라이드', text = '') {
  return {
    id: crypto.randomUUID(),
    title,
    elements: text
      ? [
          {
            id: crypto.randomUUID(),
            type: 'text',
            text,
            x: 18,
            y: 26,
            w: 64,
            h: 42,
            fontSize: getAutoFontSize(text),
          },
        ]
      : [],
  };
}

export function getSlideText(slide) {
  return slide.elements
    .filter((element) => element.type === 'text')
    .map((element) => element.text)
    .join('\n')
    .trim();
}

export function splitPages(value) {
  return value
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((page) => page.trim())
    .filter(Boolean);
}

export function getAutoFontSize(text) {
  if (text.length > 180) return 10;
  if (text.length > 120) return 14;
  if (text.length > 70) return 18;
  return 22;
}

export function hasOverflowWarning(text) {
  return text.length > 260;
}
