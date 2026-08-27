# [톤앤매너 개편 계획서] NutriFlow Vitality 디자인 시스템 적용

> **문서 버전**: v2.1.0
> **기준 문서**: [design.md](../design.md) (브랜드 토큰 요약), [code.html](../code.html) (Stitch 시각 목업 — 레이아웃·컴포넌트 구조의 1차 기준)
> **작성 일시**: 2026-08-27
> **목표**: 루트 디자인 자료를 기준으로 전체 사이트의 색상·타이포·컴포넌트·레이아웃 톤앤매너를 일괄 재정비

---

## 0. 디자인 소스 정리 (중요)

루트에 **두 개**의 디자인 자료가 존재하며 내용이 일부 상충한다.

| 자료 | 성격 | 취급 |
|------|------|------|
| `design.md` | 브랜드 토큰·규칙 텍스트 요약 (NutriFlow Vitality) | **브랜드 색/타이포 원칙의 기준** |
| `code.html` | Google Stitch가 생성한 실제 HTML 목업 (NutriEstimator) | **레이아웃·컴포넌트 구조의 시각 기준** |

### 0.1 두 자료의 충돌 지점

| 항목 | design.md | code.html | 조정안(권장) |
|------|-----------|----------------|--------------|
| 제품명 | NutriFlow Vitality | NutriEstimator | 현행 코드의 **"Nutri Snap" 유지** (개편 범위는 톤앤매너, 리브랜딩 아님) — 사용자 확정 필요 |
| Primary 그린 | `#22c55e` | `#22c55e` | ✅ 일치 → `#22c55e` |
| Surface | `#f8f9ff` | `#f8f9ff` | ✅ 일치 |
| Navy/Secondary | `#1e293b` | `#1e293b` (secondary), 본문텍스트 `#0b1c30` | 헤드라인 `#1e293b`, 본문 최상위 `#0b1c30` 허용 |
| Error | `#ef4444` | `#ba1a1a` | **`#ef4444` 채택** (design.md 우선, 밝은 톤과 더 조화) |
| Outline | `#e2e8f0` | `#6d7b6c` / `#bccbb9` | **`#e2e8f0` 채택** (design.md 우선; 목업 값은 탁한 녹회색) |
| 본문 폰트 | Plus Jakarta Sans | 본문 Be Vietnam Pro, 헤드라인만 Plus Jakarta Sans | **Plus Jakarta Sans 단일**(+한글 Noto Sans KR fallback). Be Vietnam Pro 미채택 |
| Display Large | 32px | 48px(display-lg), 32px=headline-lg | 모바일 우선 앱이므로 **32px** 기준, 데스크톱만 40~48px 확대 허용 |
| 컨테이너 폭 | `max-width: 390px` | `max-width: 600px` | **모바일 390 / 데스크톱 `max-w-[600px]` 반응형** (양쪽 절충) |
| 카드 라운드 | `rounded-2xl` (1rem) | `rounded-xl` (0.75rem) | **`rounded-xl`(0.75rem)** — 목업 실측 우선, 버튼/인풋은 `rounded-lg`(0.5rem) |
| 목표 선택 UI | Segmented Control | Pill 버튼 3개 (`rounded-full`) | **Pill 3개** (목업 형태) — 선택 시 `bg-primary text-white` |
| 그림자 | `shadow-sm` | `custom-shadow: 0 10px 30px -10px rgba(11,28,48,.08)` | 카드 = custom-shadow(부드러운 그림자), 나머지 `shadow-sm` |
| 네비게이션 | 언급 없음 | TopAppBar + 모바일 BottomNav + 웹 상단 nav | **범위 밖(P4 옵션)** — History/Profile 기능 미존재. 아래 D5 참고 |

### 0.2 채택 결론(Design Tokens 최종안)

```
--color-primary:            #22c55e   (버튼/강조/선택)
--color-primary-foreground: #ffffff
--color-surface:            #f8f9ff   (페이지 배경)
--color-surface-container:   #ffffff  (카드/입력폼)
--color-surface-container-low: #eff4ff (인풋 배경, 부드러운 구획)
--color-navy:               #1e293b   (헤드라인)
--color-on-surface:         #0b1c30   (본문 최상위 텍스트)
--color-body:               #475569   (본문)
--color-label:              #94a3b8   (라벨/캡션)
--color-outline:            #e2e8f0   (경계선)
--color-error:              #ef4444   (경고/검증 실패)
radius: card = 0.75rem(xl) / button·input = 0.5rem(lg) / pill = full
font-sans: 'Plus Jakarta Sans', var(--font-noto-sans-kr), ui-sans-serif, system-ui, sans-serif
container: mobile max 390px → desktop max 600px, mx-auto, px 20px(gutter)
motion: 버튼 active:scale-95 (transition ~0.1s)
```

---

## 1. 현황 진단 (As-Is)

### 1.1 현재 톤앤매너 — **다크 테마 + 글래스모피즘**

| 항목 | 현재 상태 |
|------|-----------|
| 배경 | `bg-slate-950` + `blur-[120px]` 발광 그라디언트 블롭 2개 |
| 카드 | `bg-slate-900/90` + `backdrop-blur-xl` + `border-slate-800` + `shadow-2xl shadow-black/60` |
| 주요 색 | Emerald + Cyan 혼용, 보조 amber/blue/purple |
| 텍스트 | `text-white` / `text-slate-100/400/600` |
| 에러 색 | `#FF0000` **하드코딩** |
| 라운드 | 버튼·인풋·카드 모두 `rounded-2xl~3xl` |
| 폰트 | `Noto_Sans_KR` 단일, 타입 스케일 규칙 없음 |
| 레이아웃 | 단일 컬럼, `max-w-2xl`(672px), 네비게이션 없음 |

### 1.2 토큰 체계 현황
- `app/globals.css` = **Tailwind v4 CSS-first** (`@theme inline`).
- `--primary` 가 `oklch(0.205 0 0)`(거의 검정) → **브랜드 그린 아님**.
- `.dark` + `@media (prefers-color-scheme: dark)` 무채색 블록 존재.
- **컴포넌트가 토큰을 거의 안 쓰고** `slate-*`/`emerald-*` 유틸을 직접 사용 → 컴포넌트 단위 치환 필수.

### 1.3 영향 범위 파일

| 분류 | 파일 |
|------|------|
| 토큰/폰트 | `app/globals.css`, `app/layout.tsx` |
| 프리미티브 | `components/ui/button.tsx`, `components/ui/sonner.tsx` |
| 메인 폼 | `components/diet-analyzer.tsx` (~600줄, 최다 작업) |
| 결과 화면 | `components/result/summary-panel.tsx`, `share-card.tsx`, `share-actions.tsx` |
| 예외/오버레이 | `components/common/loading-overlay.tsx`, `retry-modal.tsx`, `error-state.tsx` |
| 동작 검증 | `lib/image-export.ts`, `lib/share-handler.ts` |

---

## 2. 선행 결정 사항 — **확정됨 (2026-08-27, 권장안 채택)**

| # | 이슈 | 확정 |
|---|------|------|
| D1 | 컨테이너 폭 | **390→600 반응형** (`max-w-[390px] md:max-w-[600px]`) |
| D2 | 다크 모드 | **완전 제거** (라이트 고정) |
| D3 | 공유 카드(share-card) | **라이트 전면 재디자인** + `html-to-image` 배경색 핀 |
| D4 | 매크로(탄·단·지) 색상 | **탄 `#f59e0b` · 단 `#22c55e` · 지 `#3b82f6`** |
| D5 | 네비게이션 | **로고+타이틀 고정 상단바만**, 하단 탭바 보류 |
| D6 | 제품명 | **"Nutri Snap" 유지** |

---

## 진행 현황 (2026-08-27)

| Phase | 상태 | 비고 |
|-------|------|------|
| P0 파운데이션 | ✅ 완료 | `globals.css` 토큰 전면 교체·다크블록 제거·타입스케일·`custom-shadow`, `layout.tsx` Plus Jakarta Sans + light 고정. 빌드 OK |
| P1 프리미티브 | ✅ 완료 | `button.tsx` default=green/`active:scale-95`, `size="xl"`(h-14), `pill` variant. `sonner.tsx` light 고정 (next-themes 미사용화) |
| P2 메인 폼 | ✅ 완료 | `diet-analyzer.tsx` 전면 라이트화 + 상단바(D5) + 컨테이너 390→600 + pill 목표선택 |
| P3 결과 대시보드 | ✅ 완료 | `summary-panel.tsx` 카드·스탯·매크로 3바(D4 색)·총평·경고·분해 리스트 |
| P4 예외/오버레이 | ✅ 완료 | `loading-overlay` / `retry-modal` / `error-state` 딤 반전 + 라이트 |
| P5 공유 카드 | ✅ 완료 | `share-card.tsx` 그린 헤더밴드+화이트 바디, `image-export.ts` `backgroundColor:'#ffffff'` |
| P6 QA | ⏳ 부분 | 빌드·`tsc --noEmit` 통과, dark 클래스 grep 제로화 완료. **미완: 브라우저 육안(모바일/데스크톱), 공유카드 PNG 실측, `package.json`에서 `next-themes` 제거, `@custom-variant dark` 라인 제거** |

---

## 3. 단계별 실행 계획

### Phase 0 — 파운데이션 (토큰 + 폰트 + 레이아웃 셸)
**파일**: `app/globals.css`, `app/layout.tsx`
- `@theme` 에 §0.2 토큰 전체 반영 (primary·surface·surface-container·surface-container-low·navy·on-surface·body·label·outline·error)
- 기존 `--background/--foreground/--card/--border/--primary` 를 위 값과 정합되게 매핑
- `.dark` + `prefers-color-scheme: dark` 블록 제거 (D2), `next-themes` 사용 지점 light 고정
- `Plus Jakarta Sans` 를 `next/font/google` 추가, `--font-sans` 체인에 Noto Sans KR fallback 유지
- radius 토큰 정리: `--radius` 계열이 카드 0.75rem / 버튼·인풋 0.5rem 로 나오게
- 타입 스케일 유틸/규칙 정의: `display-lg`(32, 데스크톱 40), `headline`(24), `title`(18), `body`(14), `label`(12)
- `layout.tsx`: `viewport.colorScheme='light'`, `themeColor` 라이트 단일, custom-shadow 유틸(`.custom-shadow`) 정의
- **완료 기준**: 빌드 성공, 배경 `#f8f9ff` + Plus Jakarta Sans 적용

### Phase 1 — 프리미티브
**파일**: `components/ui/button.tsx`, `components/ui/sonner.tsx`
- `buttonVariants`:
  - `default` = `bg-primary text-white font-bold rounded-lg` + `active:scale-95 transition-transform`
  - `outline` = `border-outline bg-white text-navy hover:bg-surface`
  - `pill` variant 신설 = `rounded-full` (목표 선택용)
  - size에 `xl` = `h-14` 추가 (design.md primary 명세)
  - dark: 접두 클래스 제거
- `sonner.tsx`: `theme='light'` 고정
- **완료 기준**: primary/outline/pill 3종 라이트 렌더 + `scale-95` 동작

### Phase 2 — 메인 폼 (`components/diet-analyzer.tsx`) — 최다 작업
목업 구조에 맞춰 섹션별 치환:
- 최상위 래퍼: `bg-slate-950 text-slate-100` → `bg-surface text-on-surface`; 발광 블롭 2개 삭제
- (D5-b) 상단 고정바 추가: 로고 + `Nutri Snap` 타이틀, `bg-surface shadow-sm`, `max-w-[600px] mx-auto`
- 컨테이너: `max-w-2xl` → `w-full max-w-[390px] md:max-w-[600px] mx-auto px-5`
- 인트로 카피: `text-3xl` → display-lg 규칙, 본문 label/body 토큰
- 폼 카드: `bg-slate-900/90 backdrop-blur-xl rounded-3xl` → `bg-white rounded-xl p-6 custom-shadow`
- 신체정보 인풋: `bg-slate-950/80 border-slate-800 rounded-2xl` → `bg-surface-container-low border border-outline rounded-lg p-4 focus:ring-1 focus:ring-primary focus:border-primary`; 에러 → `border-error`
- 목표 선택: 3-그리드 세그먼트 → **pill 3개**(`rounded-full`), 선택 `bg-primary text-white`, 미선택 `bg-surface-container border border-outline text-on-surface hover:bg-surface-variant`
- 실시간 권장량 프리뷰: `emerald-950/30` → `bg-primary/5 border border-primary/20 text-primary`
- 텍스트에어리어 + 글자수 카운터: 인풋 규칙 동일, 카운터 임계(≥180)시 `text-error` (목업 JS 로직 참고)
- 사진 업로드: `border-2 border-dashed border-outline rounded-lg py-6`, hover `bg-surface-container-low`
- 제출 버튼: `<Button size="xl">` → `h-14 rounded-lg bg-primary text-white font-bold`; 목업의 sticky 처리 검토
- 결과 placeholder: 분석 전 안내 박스(`bg-surface-container-low border border-dashed border-outline`)
- 안내 문구 / 푸터: `bg-surface-container border-outline text-label`
- **완료 기준**: 폼 전체 라이트, 대비 AA, 기능 회귀 없음(검증·포커스 이동·이미지 프리뷰·카운터)

### Phase 3 — 결과 대시보드 (`components/result/summary-panel.tsx`)
- 패널 카드: `bg-white rounded-xl p-6 custom-shadow border border-outline`
- 총 칼로리 스탯 카드: `bg-slate-950/80` → `bg-surface-container-low`; 숫자 `text-navy`; 그라디언트 바 → `bg-primary` 단색 (초과 시 amber/`bg-error`)
- 매크로 3바: D4 색상, 트랙 `bg-surface-container-low`, 값 텍스트 navy
- `goalLabels` 색상 맵 라이트 팔레트로 재작성 (cyan/purple → green 톤/중립)
- AI 총평 박스: `bg-primary/5 border border-primary/20 text-body`, 제목 `text-primary`
- 경고 배지: `bg-amber-50 border border-amber-200 text-amber-700`
- 음식별 분해 리스트: 구분선 `divide-outline`, 배경 `bg-white`
- **완료 기준**: 대시보드 라이트, 수치 가독성, 진행바 정상

### Phase 4 — 예외 / 오버레이
**파일**: `loading-overlay.tsx`, `retry-modal.tsx`, `error-state.tsx`
- 오버레이 딤: `bg-slate-950/75 backdrop-blur-md` → `bg-navy/40 backdrop-blur-sm`
- 모달/패널 본체: `bg-white rounded-xl custom-shadow border border-outline`, 텍스트 navy/body
- 상태색: 실패 `text-error` / 재시도 amber / 진행 `text-primary`
- `error-state.tsx`: `bg-red-950/20` → `bg-error/5 border border-error/20`, 가이드 박스 `bg-surface-container-low`
- 로딩 카피 "AI 분석 중..." 중앙 정렬 유지 (design.md 명세)
- **완료 기준**: 3개 상태 라이트, 스피너/프로그레스 정상

### Phase 5 — 공유 카드 (`components/result/share-card.tsx`) — D3
- (권장안) 라이트 재디자인: 상단 `bg-primary` 헤더 밴드 + `bg-white` 바디 + `border-outline`
- 발광 블롭 제거, 그라디언트 텍스트 → `text-navy`/`text-primary`
- 매크로 pill 라이트화, 푸터 브랜딩 라이트
- `lib/image-export.ts`: `html-to-image` 옵션에 `backgroundColor: '#ffffff'` 명시
- `share-actions.tsx`: 버튼 `<Button>` variant 정리(primary/outline), 아이콘색 그린 통일
- **완료 기준**: 카드 라이트 + PNG 내보내기(복사/다운로드/웹공유) 배경 정상

### Phase 6 — QA & 마무리
- `npm run build` 통과
- 모바일(390) / 데스크톱(600) 육안 점검
- 대비 검사: navy/on-surface/body/label/primary 버튼 → WCAG AA
- 공유 카드 PNG 스냅샷 실측
- 잔존 `slate-*` / `emerald-*` / `cyan-*` / `#FF0000` grep 제로화
- `design.md` 에 최종 확정값(유틸 클래스명, 매크로 색, radius) 역반영, `code.html` 은 참고 자료로 `docs/` 이동 검토
- 커밋 분할: P0~1 / P2 / P3~4 / P5 / P6

---

## 4. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 두 디자인 자료 상충 | 구현 방향 혼선 | §0 조정안 확정 후 착수 (D1~D6) |
| 컴포넌트 토큰 미사용 → 치환 누락 | 다크 잔재 부분 잔존 | P6 grep 게이트 (`slate-|emerald-|cyan-|#FF0000`) |
| `html-to-image` 라이트 배경 투명화 | 공유 카드 PNG 깨짐 | `backgroundColor` 옵션 + 실측 |
| 목업 네비가 없는 기능 유도(History/Profile) | 사용자 혼란 | D5-b: 시각용 상단바만, 링크 미노출 |
| Plus Jakarta Sans 한글 미지원 | 한글이 fallback 렌더 | `--font-sans` 에 Noto Sans KR fallback 유지 |
| `#94a3b8` 라벨 on `#f8f9ff` 대비 | 접근성 AA 미달 가능 | 라벨은 보조 정보 한정, 본문은 `#475569`+ |

## 5. 예상 산출물
- 변경 파일: §1.3의 11개 + `design.md` 역반영
- 신규: 타입 스케일 유틸 + `.custom-shadow` (globals.css), Button `pill` variant, 상단바
- 다크모드 제거로 globals.css ~70줄 순삭
- 커밋 5분할 예상
