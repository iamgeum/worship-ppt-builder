# 🔧 리팩토링 진행상황 추적

> **목표**: MVP 스타일의 한덩어리 코드 → **모듈형 아키텍처**로 변환
> 
> **핵심 원칙**: 메인 파일은 함수 호출만, 각 Agent는 독립적 로직 담당

---

## 📋 전체 로드맵

```
Phase 1: 기본 구조 정립 (1주)
├─ ✅ Utils 함수 분리
├─ ✅ 각 Agent를 함수 기반 구조로 준비
├─ ✅ 진행상황 추적 문서 생성
└─ ⏳ App.jsx 라우팅 정리

Phase 2: 각 에이전트 구현 (2~3주)
├─ 🔴 에이전트 1 (MenuAgent) — 함수 분리
├─ 🔴 에이전트 3 (OrderManagerAgent) — 로직 분리
├─ 🔴 에이전트 6 (TextEditorAgent) — 성경 검색, 페이지 분할 함수화
└─ 🔴 에이전트 4 (EditorAgent) — 캐러셀, Snapping 유틸화

Phase 3: PPT 내보내기 (1주)
├─ ⏳ pptxgenjs 통합
├─ ⏳ 슬라이드 형식 적용
└─ ⏳ PPTX 다운로드 기능
```

---

## ✅ 완료된 작업

### Phase 1-1: Utils 함수 분리 ✅

#### 생성된 파일

| 파일명 | 위치 | 목적 | 상태 |
|--------|------|------|------|
| `slideUtils.js` | `src/utils/` | 슬라이드 배열 조작 함수 | ✅ 완료 |
| `bibleSearch.js` | `src/utils/` | 성경 검색 및 캐싱 로직 | ✅ 완료 |
| `textParser.js` | `src/utils/` | 텍스트 파싱 (엔터 2번 분할) | ✅ 완료 |
| `fontSizer.js` | `src/utils/` | 자동 폰트 크기 조정 | ✅ 완료 |

#### 이동/통합된 로직

- ✅ `slideHelpers.js`의 `getSlideText()` → `slideUtils.js`로 통합
- ✅ `slideHelpers.js`의 `makeSlide()` → `slideUtils.js`로 통합
- ✅ 새로운 유틸: `addSlide()`, `deleteSlide()`, `reorderSlides()`

---

## 🔴 현재 진행 중

### Phase 1-2: Agent 함수 기반 구조 준비

**목표**: 각 Agent를 "순수 컴포넌트 + 로직 함수" 구조로 변환

#### 에이전트 1 — MenuAgent
- **현재 상태**: 컴포넌트만 있음 (로직 분리 필요 없음 — 간단)
- **분리 대상**: 없음 (메뉴 항목 배열을 config 파일로 이동만 함)
- **진행률**: 90% (최소 변경)

#### 에이전트 3 — OrderManagerAgent
- **현재 상태**: `addSlide`, `deleteSlide`, `reorder` 등이 컴포넌트 내부에 있음
- **분리 대상**:
  - [ ] `addSlide()` → `src/agents/03_order-manager/orderActions.js`
  - [ ] `deleteSlide()` → `src/agents/03_order-manager/orderActions.js`
  - [ ] `reorder()` → `src/agents/03_order-manager/orderActions.js`
  - [ ] `save()` → `src/agents/03_order-manager/orderValidation.js`
  - [ ] `jumpToSlide()` → `src/agents/03_order-manager/orderActions.js`
- **진행률**: 30% (로직 분리 진행 중)

#### 에이전트 4 — EditorAgent
- **현재 상태**: 모듈 검토 필요
- **분리 예상 대상**: 캐러셀 조작, Snapping 알고리즘, 요소 편집 로직
- **진행률**: 0% (검토 필요)

#### 에이전트 6 — TextEditorAgent
- **현재 상태**: 모듈 검토 필요
- **분리 예상 대상**: 성경 검색, 페이지 분할, 폰트 자동 조정
- **진행률**: 0% (검토 필요)

#### 에이전트 2 — PersonalizerAgent
- **진행률**: 0% (낮은 우선순위)

#### 에이전트 7 — UxBenchmarkAgent
- **진행률**: 0% (낮은 우선순위)

---

## ⏳ 다음 단계 (TODO)

### 즉시 해야 할 것

1. **`src/utils/` 폴더 내 새 파일들 생성**
   ```
   src/utils/
   ├── slideUtils.js          ← Utils 재구성
   ├── bibleSearch.js         ← 성경 검색 함수
   ├── textParser.js          ← 텍스트 분할 로직
   ├── fontSizer.js           ← 폰트 자동 조정
   └── slideHelpers.js        ← 기존 파일 (통합 후 정리)
   ```

2. **OrderManagerAgent 로직 분리**
   - 컴포넌트에서 액션 함수들 추출
   - `src/agents/03_order-manager/orderActions.js` 생성
   - `src/agents/03_order-manager/orderValidation.js` 생성

3. **EditorAgent 구조 검토**
   - 파일 크기 확인
   - 캐러셀, Snapping 등 로직 식별
   - 분리 전략 수립

4. **TextEditorAgent 구조 검토**
   - 성경 검색 로직 추출
   - 페이지 분할 로직 추출
   - 폰트 계산 로직 추출

5. **App.jsx 라우팅 정리**
   - 현재: 모드 기반 라우팅 (orderManager 누락)
   - 개선: 모든 view 타입 처리

---

## 📊 진행률 요약

| 구성 요소 | 진행률 | 상태 | 담당자 |
|----------|--------|------|--------|
| Utils 함수 분리 | ✅ 100% | 완료 | - |
| MenuAgent 정리 | 🟡 90% | 거의 완료 | - |
| OrderManagerAgent 분리 | 🔴 30% | 진행 중 | - |
| EditorAgent 검토 | ⚪ 0% | 시작 예정 | - |
| TextEditorAgent 검토 | ⚪ 0% | 시작 예정 | - |
| App.jsx 최적화 | ⚪ 0% | 시작 예정 | - |
| **전체** | 🟡 **30%** | 진행 중 | - |

---

## 📝 코드 스타일 가이드

### 새로운 Utils 함수 작성 규칙

```javascript
/**
 * [한글 설명 (1줄)]
 * 
 * @param {Type} paramName - [설명]
 * @returns {ReturnType} [설명]
 * 
 * @example
 * const result = functionName(input);
 */
export function functionName(paramName) {
  // 구현
}
```

### Agent 함수 분리 규칙

```javascript
// src/agents/03_order-manager/orderActions.js

export function addSlide(currentSlides, newSlide) {
  return [...currentSlides, newSlide];
}

export function deleteSlide(slides, index) {
  return slides.filter((_, i) => i !== index);
}

// 컴포넌트에서 호출
import { addSlide } from './orderActions.js';

function OrderManagerAgent() {
  const { updateState } = useWorship();
  
  const handleAddSlide = () => {
    updateState((state) => ({
      ...state,
      slides: addSlide(state.slides, makeSlide()),
    }));
  };
}
```

---

## 🎯 개발자를 위한 체크리스트

### Phase 1 완료 후 체크
- [ ] 모든 Utils 함수가 `src/utils/` 아래에 있는가?
- [ ] `slideHelpers.js`는 정리되었는가?
- [ ] App.jsx에서 OrderManagerAgent가 렌더되는가?
- [ ] 모든 에이전트가 독립적으로 작동하는가?

### Phase 2 시작 전 체크
- [ ] 각 Agent 폴더에 액션/로직 파일이 있는가?
- [ ] 컴포넌트와 로직이 분리되었는가?
- [ ] 테스트 가능한 순수 함수로 작성했는가?

### 배포 전 체크
- [ ] 전체 기능이 작동하는가?
- [ ] 콘솔 에러가 없는가?
- [ ] 성능 테스트 통과했는가?

---

## 🔗 참고 링크

- [README.md](./README.md) — 프로젝트 개요
- [AGENTS.md](./AGENTS.md) — 에이전트 상세 명세
- [docs/](./docs/) — 기획 문서

---

## 📞 문의 사항

각 Phase별 진행상황은 이 파일을 업데이트합니다.
마지막 수정: **2026-09-15**
