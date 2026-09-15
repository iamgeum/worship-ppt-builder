# 🔧 리팩토링 진행상황 추적

> **목표**: MVP 스타일의 한덩어리 코드 → **모듈형 아키텍처**로 변환
> 
> **핵심 원칙**: 메인 파일은 함수 호출만, 각 Agent는 독립적 로직 담당

---

## 📋 전체 로드맵

```
Phase 1: 기본 구조 정립 ✅ 완료!
├─ ✅ Utils 함수 분리 (4개 파일)
├─ ✅ OrderManager 로직 분리 (2개 파일)
├─ ✅ 진행상황 추적 문서
└─ ✅ EditorAgent 검토 완료

Phase 2: 각 에이전트 구현 🔴 진행 중
├─ ⏳ TextEditorAgent 로직 분리
├─ ⏳ EditorAgent 로직 분리
└─ ⏳ MenuAgent 마무리

Phase 3: 통합 & 테스트 (예정)
├─ ⏳ 전체 라우팅 정리 (App.jsx)
└─ ⏳ 모든 기능 작동 확인

Phase 4: PPT 내보내기 (예정)
├─ ⏳ pptxExporter 개선
└─ ⏳ PPTX 다운로드 완성
```

---

## ✅ 완료된 작업 (Phase 1 + 일부 Phase 2)

### Phase 1-1: Utils 함수 분리 ✅ 100%

생성된 파일들:

| 파일명 | 함수 개수 | 목적 | 상태 |
|--------|----------|------|------|
| `slideUtils.js` | 12개 | 슬라이드 배열 조작 | ✅ 완료 |
| `textParser.js` | 11개 | 텍스트 파싱 & 페이지 분할 | ✅ 완료 |
| `fontSizer.js` | 7개 | 자동 폰트 크기 조정 | ✅ 완료 |
| `bibleSearch.js` | 8개 | 성경 검색 & 캐싱 | ✅ 완료 |

**총 38개의 순수 함수 생성**

### Phase 2-1: OrderManagerAgent 로직 분리 ✅ 70%

생성된 파일들:

| 파일명 | 함수 개수 | 목적 | 상태 |
|--------|----------|------|------|
| `orderActions.js` | 6개 | 슬라이드 추가/삭제/순서 변경 | ✅ 완료 |
| `orderValidation.js` | 5개 | 슬라이드 유효성 검사 | ✅ 완료 |

**다음 단계**: OrderManagerAgent.jsx 컴포넌트에서 이 함수들을 import하도록 리팩토링

---

## 🔴 현재 진행 중

### Phase 2-2: TextEditorAgent 로직 분리 (0%)

**예상 분리 대상**:
- [ ] TextEditorAgent.jsx 검토 (크기, 로직 식별)
- [ ] textEditorActions.js 생성 (텍스트 저장, 입력 처리)
- [ ] BibleSelector 분리 (성경 선택 UI + 로직)
- [ ] TextEditorAgent.jsx 리팩토링

### Phase 2-3: EditorAgent 로직 분리 (10%)

**검토 완료**: 
- ✅ 파일 크기: 944줄 (매우 큼)
- ✅ 로직 식별: 캐러셀, Snapping, 요소 편집 분리 가능

**예상 분리 대상**:
- [ ] editorActions.js (요소 추가/삭제/복사/붙여넣기)
- [ ] snappingEngine.js (Snapping 알고리즘)
- [ ] carouselHandler.js (슬라이드 이동 로직)
- [ ] EditorAgent.jsx 리팩토링

### Phase 2-4: MenuAgent 마무리 (90%)

**예상 작업**:
- [ ] menuConfig.js 생성 (메뉴 항목 배열 추출)
- [ ] MenuAgent.jsx 최소 정리

---

## 📊 현재 진행률

### Phase별 진행률

| Phase | 진행률 | 상태 | 설명 |
|-------|--------|------|------|
| **Phase 1** | ✅ 100% | **완료** | Utils 4개 파일 완성 |
| **Phase 2** | 🟡 30% | 진행 중 | OrderManager 2개 파일 완성, 나머지 진행 필요 |
| **Phase 3** | ⚪ 0% | 미시작 | App.jsx 라우팅 정리 |
| **Phase 4** | ⚪ 0% | 미시작 | PPT 내보내기 완성 |
| **전체** | 🟡 **35%** | 진행 중 | 총 13회 중 약 5회 완료 |

### 파일별 생성 현황

```
총 생성된 파일: 6개
├─ src/utils/ (4개)
│  ├─ slideUtils.js ✅
│  ├─ textParser.js ✅
│  ├─ fontSizer.js ✅
│  └─ bibleSearch.js ✅
│
└─ src/agents/03_order-manager/ (2개)
   ├─ orderActions.js ✅
   └─ orderValidation.js ✅
```

---

## 🎯 다음 단계 (우선순위)

### 즉시 해야 할 일

1. **OrderManagerAgent.jsx 리팩토링** (1회)
   - `orderActions.js` & `orderValidation.js`의 함수들을 import
   - 컴포넌트에서 중복되는 로직 제거
   - 함수 호출 방식으로 변경

2. **TextEditorAgent 검토** (1회)
   - 파일 크기 확인
   - 분리 가능한 로직 식별

3. **TextEditorAgent 로직 분리** (2~3회)
   - textEditorActions.js 생성
   - BibleSelector.jsx 추출
   - TextEditorAgent.jsx 리팩토링

4. **EditorAgent 로직 분리** (3~4회)
   - editorActions.js 생성
   - snappingEngine.js 생성
   - carouselHandler.js 생성
   - EditorAgent.jsx 리팩토링

5. **App.jsx 라우팅 정리** (1회)
   - 모든 에이전트 view 타입 처리
   - OrderManagerAgent 추가

6. **전체 통합 테스트** (1회)
   - 모든 기능 작동 확인
   - 콘솔 에러 확인

---

## 📝 코드 스타일 가이드

### 생성된 파일 네이밍 규칙

```
액션/로직 파일: {agentName}Actions.js
                {agentName}Validation.js
                {agentName}Utils.js

UI 컴포넌트: {ComponentName}.jsx

유틸 함수: {domainName}.js (slideUtils.js, fontSizer.js)
```

### 함수 작성 규칙

```javascript
/**
 * 한글 설명 (1줄)
 * 
 * @param {Type} paramName - [설명]
 * @returns {ReturnType} [설명]
 */
export function functionName(paramName) {
  // 구현
}
```

---

## 🔗 생성된 파일 상세 정보

### Utils 함수 (src/utils/)

**slideUtils.js** (12개 함수)
- makeSlide() — 새 슬라이드 생성
- getSlideText() — 텍스트 추출
- addSlide(), deleteSlide(), reorderSlides() — 배열 조작
- findEmptySlides() — 빈 슬라이드 찾기
- addElementToSlide(), removeElementFromSlide(), updateElementInSlide()
- updateSlideInList()

**textParser.js** (11개 함수)
- splitTextByPageBreak() — 엔터 2번 기준 분할
- pagesToSlides() — 페이지→슬라이드 변환
- parseTextToSlides() — 통합 처리
- countPages(), visualizePageBreaks(), normalizeText()
- bibleToSlide(), mergeVerses(), validateText()

**fontSizer.js** (7개 함수)
- calculateOptimalFontSize() — 최적 폰트 크기 계산
- fitTextInSlide() — 오버플로우 확인 및 조정
- countLines(), isTextOverflow(), getRecommendedCharLimit()
- truncateTextByFontSize()

**bibleSearch.js** (8개 함수)
- initializeBibleCache() — 성경 DB 초기화
- searchBible() — 역본/권/장/절 검색
- searchBibleRange() — 범위 검색
- parseShortcutBible() — "창 1:1" 형식 파싱
- getAvailableBooks(), getAvailableVersions()
- saveBibleHistory(), getBibleHistory(), clearBibleHistory()

### Agent 로직 함수 (src/agents/03_order-manager/)

**orderActions.js** (6개 함수)
- handleAddSlide() — 슬라이드 추가
- handleDeleteSlide() — 슬라이드 삭제
- handleReorderSlides() — 순서 변경
- handleJumpToSlide() — 특정 슬라이드로 이동
- handleSelectSlide() — 슬라이드 선택

**orderValidation.js** (5개 함수)
- validateBeforeSave() — 저장 전 검증
- calculateSlideStats() — 슬라이드 통계
- getSlidesSummary() — 상태 요약
- validateSlide() — 개별 슬라이드 검증

---

## 🎓 학습 포인트

### 모듈화의 이점

1. **테스트 가능성**: 순수 함수는 독립적 테스트 가능
2. **재사용성**: 다른 컴포넌트에서도 같은 함수 사용 가능
3. **유지보수성**: 버그 수정이 한 곳에서만 필요
4. **가독성**: 메인 컴포넌트가 훨씬 깔끔함

### 다음 개발자를 위한 팁

- **모든 함수는 JSDoc 주석 포함**: `@param`, `@returns` 필수
- **순수 함수 원칙**: 외부 상태 변경 없음 (side effects 최소화)
- **State 업데이트**: `updateState(state => ({...state, ...}))` 패턴 사용
- **Toast 메시지**: 사용자 피드백을 위해 `setToast()` 활용

---

## 📞 추적 정보

| 항목 | 값 |
|------|-----|
| 마지막 업데이트 | 2026-09-15 |
| 현재 Phase | Phase 2-1 완료, 2-2/2-3 진행 중 |
| 다음 타겟 | TextEditorAgent 로직 분리 |
| 예상 완료 | 2026-09-22 |

---

## ✅ 체크리스트

### Phase 1 체크리스트 ✅ 완료
- [x] slideUtils.js 생성
- [x] textParser.js 생성
- [x] fontSizer.js 생성
- [x] bibleSearch.js 생성
- [x] 진행상황 문서 생성

### Phase 2 진행 중 체크리스트
- [x] orderActions.js 생성
- [x] orderValidation.js 생성
- [ ] OrderManagerAgent.jsx 리팩토링
- [ ] TextEditorAgent 로직 분리 (3 파일)
- [ ] EditorAgent 로직 분리 (3 파일)
- [ ] MenuAgent 마무리 (1 파일)

### Phase 3 시작 전 체크
- [ ] 모든 Agent 로직이 분리되었는가?
- [ ] App.jsx에서 모든 view 타입이 처리되는가?
- [ ] 모든 에이전트가 독립적으로 작동하는가?

### 배포 전 체크
- [ ] 전체 기능이 작동하는가?
- [ ] 콘솔 에러가 없는가?
- [ ] 토스트 메시지가 제대로 표시되는가?

---

이제 Phase 2-2 (TextEditorAgent 검토)로 진행하시겠습니까?
