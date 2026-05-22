import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'worship-ppt-builder-state-v1';

const defaultSlides = [
  {
    id: crypto.randomUUID(),
    title: '예배 시작',
    elements: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        text: '주일 예배',
        x: 34,
        y: 38,
        w: 32,
        h: 14,
        fontSize: 34,
      },
    ],
  },
  { id: crypto.randomUUID(), title: '찬양', elements: [] },
  { id: crypto.randomUUID(), title: '말씀', elements: [] },
];

const defaultState = {
  slides: defaultSlides,
  currentSlideIndex: 0,
  slideFormat: { ratio: '16:9', margin: 40 },
  stylePreset: 'clean',
  autoSavedAt: '',
};

const WorshipContext = createContext(null);

function readSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

function getNowLabel() {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function WorshipProvider({ children }) {
  const [state, setState] = useState(readSavedState);
  const [toast, setToast] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const next = { ...state, autoSavedAt: getNowLabel() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [state.slides, state.currentSlideIndex, state.slideFormat, state.stylePreset]);

  const updateState = (updater) => {
    setHistory((items) => [state, ...items].slice(0, 30));
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...next, autoSavedAt: getNowLabel() };
    });
  };

  const undo = () => {
    setHistory((items) => {
      if (!items.length) return items;
      const [previous, ...rest] = items;
      setState(previous);
      setToast('되돌렸습니다');
      return rest;
    });
  };

  const value = useMemo(
    () => ({
      ...state,
      toast,
      setToast,
      updateState,
      undo,
      canUndo: history.length > 0,
    }),
    [state, toast, history.length],
  );

  return <WorshipContext.Provider value={value}>{children}</WorshipContext.Provider>;
}

export function useWorship() {
  const context = useContext(WorshipContext);
  if (!context) throw new Error('useWorship must be used inside WorshipProvider');
  return context;
}
