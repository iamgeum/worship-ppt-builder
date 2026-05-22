import { getSlideText } from './slideHelpers.js';

const SLIDE_SIZE = {
  '16:9': { layout: 'LAYOUT_WIDE', width: 13.333, height: 7.5 },
  '4:3': { layout: 'LAYOUT_4X3', width: 10, height: 7.5 },
};

const PRESETS = {
  clean: { background: 'FFFFFF', text: '111827', shape: '3B82F6' },
  dark: { background: '111827', text: 'FFFFFF', shape: '3B82F6' },
  photo: { background: '64748B', text: 'FFFFFF', shape: '3B82F6' },
  warm: { background: 'FFF7ED', text: '1F2937', shape: 'F59E0B' },
};

function stripHash(value) {
  return value.replace('#', '').toUpperCase();
}

function getDeckSize(ratio) {
  return SLIDE_SIZE[ratio] || SLIDE_SIZE['16:9'];
}

function percentToInches(element, deckSize) {
  return {
    x: (element.x / 100) * deckSize.width,
    y: (element.y / 100) * deckSize.height,
    w: (element.w / 100) * deckSize.width,
    h: (element.h / 100) * deckSize.height,
  };
}

function addElementToSlide(pptSlide, element, deckSize, theme, ShapeType) {
  const box = percentToInches(element, deckSize);

  if (element.type === 'text') {
    pptSlide.addText(element.text || '', {
      ...box,
      fontFace: 'Malgun Gothic',
      fontSize: element.fontSize || 22,
      color: theme.text,
      align: 'center',
      valign: 'mid',
      fit: 'shrink',
      margin: 0.08,
      breakLine: false,
    });
    return;
  }

  if (element.type === 'shape') {
    pptSlide.addShape(ShapeType.roundRect, {
      ...box,
      rectRadius: 0.08,
      fill: { color: theme.shape },
      line: { color: theme.shape },
    });
    if (element.altText) {
      pptSlide.addText(element.altText, {
        ...box,
        fontFace: 'Malgun Gothic',
        fontSize: Math.min(24, element.fontSize || 18),
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'mid',
        fit: 'shrink',
        margin: 0.08,
      });
    }
    return;
  }

  if (element.type === 'image') {
    if (element.src?.startsWith('data:image/')) {
      pptSlide.addImage({ data: element.src, ...box });
    } else {
      pptSlide.addShape(ShapeType.rect, {
        ...box,
        fill: { color: 'F8FAFC' },
        line: { color: '94A3B8', dash: 'dash' },
      });
      pptSlide.addText(element.altText || '이미지', {
        ...box,
        fontFace: 'Malgun Gothic',
        fontSize: 16,
        color: '475569',
        align: 'center',
        valign: 'mid',
      });
    }
  }
}

export async function exportSlidesToPptx({ slides, slideFormat, stylePreset }) {
  const { default: pptxgen } = await import('pptxgenjs');
  const deckSize = getDeckSize(slideFormat.ratio);
  const theme = PRESETS[stylePreset] || PRESETS.clean;
  const pptx = new pptxgen();
  pptx.layout = deckSize.layout;
  pptx.author = 'Worship PPT Builder';
  pptx.company = 'Worship PPT Builder';
  pptx.subject = 'Worship service slides';
  pptx.title = '예배 PPT';
  pptx.lang = 'ko-KR';
  pptx.theme = {
    headFontFace: 'Malgun Gothic',
    bodyFontFace: 'Malgun Gothic',
    lang: 'ko-KR',
  };

  slides.forEach((appSlide, index) => {
    const pptSlide = pptx.addSlide();
    pptSlide.background = { color: theme.background };
    pptSlide.addNotes(`Worship PPT Builder slide ${index + 1}: ${appSlide.title || ''}`);

    if (!appSlide.elements.length) {
      pptSlide.addText('', { x: 0, y: 0, w: deckSize.width, h: deckSize.height });
    }

    appSlide.elements.forEach((element) => addElementToSlide(pptSlide, element, deckSize, theme, pptx.ShapeType));
  });

  const date = new Date().toISOString().slice(0, 10);
  await pptx.writeFile({ fileName: `worship-ppt-${date}.pptx` });
}

export function inspectSlides(slides) {
  const issues = [];

  slides.forEach((slide, index) => {
    const slideNumber = index + 1;
    const text = getSlideText(slide);
    if (!text && !slide.elements.some((element) => element.altText || element.src)) {
      issues.push({ slideNumber, level: 'warning', message: '빈 슬라이드입니다.' });
    }

    slide.elements.forEach((element) => {
      if ((element.type === 'text' && (element.text || '').length > 260) || (element.altText || '').length > 160) {
        issues.push({ slideNumber, level: 'danger', message: '텍스트가 길어 PPT에서 작게 보일 수 있습니다.' });
      }
      if (element.type === 'image' && element.src && !element.src.startsWith('data:image/')) {
        issues.push({
          slideNumber,
          level: 'warning',
          message: '외부 이미지 URL은 PPTX에 직접 포함되지 않을 수 있습니다.',
        });
      }
      if (element.w < 5 || element.h < 5) {
        issues.push({ slideNumber, level: 'warning', message: '너무 작은 요소가 있습니다.' });
      }
    });
  });

  return issues;
}

export function getPptxPresetColor(stylePreset) {
  const preset = PRESETS[stylePreset] || PRESETS.clean;
  return {
    background: `#${stripHash(preset.background)}`,
    text: `#${stripHash(preset.text)}`,
  };
}
