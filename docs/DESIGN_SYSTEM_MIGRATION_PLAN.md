# [톤앤매너 개편 계획서] NutriFlow Vitality 디자인 시스템 적용

> **문서 버전**: v1.0.0
> **기준 문서**: [design.md](../design.md), [PRD.md](../PRD.md)
> **작성 일시**: 2026-08-27
> **목표**: 루트 `design.md`의 "NutriFlow Vitality" 디자인 시스템을 기준으로 전체 사이트의 색상·타이포·컴포넌트 스타일을 일괄 재정비

---

## 1. 현황 진단 (As-Is)

### 1.1 현재 톤앤매너
현재 사이트는 **다크 테마 + 글래스모피즘** 기반이다.

| 항목 | 현재 상태 |
|------|-----------|
| 배경 | `bg-slate-950` (거의 검정), 상단/우측에 `blur-[120px]` 발광 그라디언트 블롭 2개 |
| 카드 | `bg-slate-900/90` + `backdrop-blur-xl` + `border-slate-800` + `shadow-2xl shadow-black/60` |
| 주요 색상 | Emerald(`emerald-500/400/300`) + Cyan(`cyan-500/400`) 혼용, 보조로 amber/blue/purple |
| 텍스트 | `text-white` / `text-slate-100` / `text-slate-400` / `text-slate-600` |
| 에러 색 | `#FF0000` **하드코딩** (input, 카운터, 검증 메시지) |
| 라운드 | 버튼·인풋·카드 모두 `rounded-2xl` ~ `rounded-3xl` 로 크게 |
| 폰트 | `Noto_Sans_KR` 단일 (layout.tsx) |
| 타입 스케일 | 규칙 없음. `text-3xl/4xl` 헤더, 나머지 대부분 `text-xs` |

### 1.2 토큰 체계 현황
- `app/globals.css` 는 **Tailwind v4 CSS-first** (`@import 'tailwindcss'` + `@theme inline`).
- `:root` 에 라이트 계열 회색 토큰이 정의돼 있으나 `--primary` 가 `oklch(0.205 0 0)` (거의 검정)로 **브랜드 그린이 아님**.
- `.dark` 블록 + `@media (prefers-color-scheme: dark)` 블록이 모두 **무채색**으로 존재.
- **컴포넌트가 토큰(`bg-primary`, `text-foreground`)을 거의 쓰지 않고** `slate-*` / `emerald-*` 유틸리티 클래스를 직접 사용 → 토큰만 바꿔도 화면은 안 바뀜. 컴포넌트 단위 치환 필수.

### 1.3 영향 범위 파일
| 분류 | 파일 |
|------|------|
| 토큰/폰트 | `app/globals.css`, `app/layout.tsx` |
| 프리미티브 | `components/ui/button.tsx`, `components/ui/sonner.tsx` |
| 메인 폼 | `components/diet-analyzer.tsx` (약 600줄, 최다 작업) |
| 결과 화면 | `components/result/summary-panel.tsx`, `components/result/share-card.tsx`, `components/result/share-actions.tsx` |
| 예외/오버레이 | `components/common/loading-overlay.tsx`, `components/common/retry-modal.tsx`, `components/common/error-state.tsx` |
| 검증 대상(스타일 X, 동작 확인) | `lib/image-export.ts`, `lib/share-handler.ts` |

---

## 2. 목표 정의 (To-Be)

### 2.1 design.md 요약
| 토큰 | 값 | 용도 |
|------|-----|------|
| Primary (Vibrant Green) | `#22c55e` | 핵심 액션, 선택 상태, 강조 |
| Secondary (Deep Navy) | `#1e293b` | 헤드라인, 데이터 텍스트 |
| Surface | `#f8f9ff` | 전체 배경 |
| Surface-Container | `#ffffff` | 카드/입력폼 배경 |
| Outline | `#e2e8f0` | 경계선/디바이더 |
| Error | `#ef4444` | 경고/검증 실패 |
| Body 텍스트 | `#475569` | 본문 |
| Label 텍스트 | `#94a3b8` | 캡션/라벨 |

- **폰트**: `Plus Jakarta Sans`, sans-serif (한글은 fallback 필요)
- **타입 스케일**: Display Large 32/Bold/navy · Title Medium 18/SemiBold/navy · Body Medium 14/Regular/`#475569` · Label Small 12/Medium/`#94a3b8`
- **버튼**: primary = `bg-primary text-white rounded-lg h-14 font-bold`; 세그먼트 컨트롤 선택 = `bg-primary text-white`, 미선택 = 뮤트
- **인풋**: `border-outline rounded-lg p-4 focus:border-primary`; 사진 업로드 = dashed border
- **카드/레이아웃**: 카드 = `bg-white rounded-2xl shadow-sm p-6`; 컨테이너 = `max-width: 390px`, `mx-auto`
- **모션**: 버튼 클릭 `scale-95` 트랜지션; 로딩 시 오버레이 스피너 + "AI 분석 중..." 중앙 배치

### 2.2 핵심 변화 요약
1. **다크 → 라이트 전면 반전** (가장 큰 작업). 발광 블롭·글래스 블러·검정 그림자 제거.
2. 라운드 표준화: 버튼·인풋 `rounded-lg`, 카드 `rounded-2xl`.
3. 색상 팔레트: emerald/cyan 혼용 → **그린 단일 + 네이비 텍스트** 로 정리.
4. `#FF0000` → `#ef4444` 로 교체.
5. `Plus Jakarta Sans` 도입 + 타입 스케일 규칙화.
6. 컴포넌트를 시맨틱 토큰(`bg-surface`, `text-navy`, `bg-primary` 등) 기반으로 리팩터.

---

## 3. 선행 결정 사항 (사용자 확인 필요)

| # | 이슈 | 옵션 | 권장안 |
|---|------|------|--------|
| D1 | **컨테이너 폭** — design.md는 `max-width: 390px` (모바일 기준). 현재는 `max-w-2xl`(672px). | (a) 390px 고정 (b) 모바일 390 + 데스크톱 `max-w-md`(448) 반응형 (c) 현행 폭 유지 | **(b)** — 모바일 퍼스트 원칙 지키되 데스크톱에서 과도하게 좁지 않게 |
| D2 | **다크 모드** — design.md는 라이트 전용. 현재 `.dark` + `prefers-color-scheme` 블록 존재. | (a) v1에서 완전 제거, 라이트 고정 (b) 다크 변형 유지·재설계 | **(a)** — 브랜드 시스템이 명시적으로 라이트. `next-themes`/`sonner` 테마도 light 고정 |
| D3 | **공유 카드(share-card)** — 현재 다크 그라디언트 카드(내보내기 이미지용으로 임팩트 있게 설계됨). | (a) 라이트로 전면 재디자인(그린 헤더 밴드 + 화이트 바디) (b) 의도적 대비로 다크 카드 유지 | **(a)** — 사이트 전체 톤과 일치. `html-to-image` 배경색 핀 고정 확인 병행 |
| D4 | **매크로(탄·단·지) 색상** — design.md 미정의. 현재 탄=amber, 단=green, 지=cyan. | (a) 탄 `#f59e0b` / 단 `#22c55e` / 지 `#3b82f6` 로 정리 후 토큰화 (b) 현행 유지 | **(a)** — cyan 제거, 브랜드와 충돌 없는 3색 고정 |

> D1~D4는 Phase 0 착수 전 확정 권장. 미확정 시 권장안으로 진행.

---

## 4. 단계별 실행 계획

### Phase 0 — 파운데이션 (토큰 + 폰트)
**파일**: `app/globals.css`, `app/layout.tsx`
- `@theme` 에 브랜드 토큰 추가/치환:
  - `--color-primary: #22c55e`, `--color-primary-foreground: #ffffff`
  - `--color-surface: #f8f9ff`, `--color-surface-container: #ffffff`
  - `--color-outline: #e2e8f0`, `--color-error: #ef4444`
  - `--color-navy: #1e293b` (headline), `--color-body: #475569`, `--color-label: #94a3b8`
  - 기존 `--background`/`--foreground`/`--card`/`--border` 를 위 값과 정합되게 매핑
- `.dark` + `@media (prefers-color-scheme: dark)` 블록 제거(또는 라이트값으로 고정) — D2 결정 따름
- `Plus Jakarta Sans` 를 `next/font/google` 로 추가, `--font-sans: 'Plus Jakarta Sans', var(--font-noto-sans-kr), ui-sans-serif, system-ui, sans-serif`
- `layout.tsx`: `viewport.colorScheme = 'light'`, `themeColor` 라이트 단일, `<html>` 클래스 정리
- 타입 스케일 유틸 클래스 or 문서화된 규칙 정의 (`.text-display`, `.text-title`, 본문/라벨은 기본값)
- **완료 기준**: 빌드 성공, 배경이 `#f8f9ff` 로 바뀌고 폰트가 적용됨(레이아웃 깨짐은 이후 단계에서 정리)

### Phase 1 — 프리미티브
**파일**: `components/ui/button.tsx`, `components/ui/sonner.tsx`
- `buttonVariants`:
  - `default` = `bg-primary text-white font-bold` + `active:scale-95 transition-transform`
  - `outline` = `border-outline bg-white text-navy hover:bg-surface`
  - 라운드 기본값 `rounded-lg`, dark: 관련 클래스 제거
  - size에 `xl`(또는 default 조정) 추가: `h-14` (design.md 명세)
- `sonner.tsx`: `theme` 고정 `'light'`, 토큰 클래스 유지(자동 반영)
- **완료 기준**: 버튼 3종(primary/outline/ghost) 라이트 렌더 + 클릭 시 scale-95

### Phase 2 — 메인 폼 (`components/diet-analyzer.tsx`)
가장 큰 작업. 섹션별로 치환:
- 최상위 래퍼: `bg-slate-950 text-slate-100` → `bg-surface text-body`; 발광 블롭 `<div>` 2개 삭제; `selection:*` 그린 유지
- 컨테이너: `max-w-2xl` → D1 결정값 (`mx-auto w-full max-w-md` 등)
- 헤더: 배지/타이틀/서브카피를 navy·green·label 토큰으로; `text-3xl` → Display Large 규칙
- 폼 카드: `bg-slate-900/90 backdrop-blur-xl ... rounded-3xl` → `bg-white rounded-2xl shadow-sm p-6 border border-outline`
- 신체정보 인풋: `bg-slate-950/80 border-slate-800 rounded-2xl` → `bg-white border-outline rounded-lg p-4 focus:border-primary focus:ring-1 focus:ring-primary`; 에러 상태 `#FF0000` → `border-error`
- 목표 세그먼트 컨트롤: 선택 = `bg-primary text-white`, 미선택 = `bg-surface text-label border-outline hover:border-primary/40`
- 실시간 권장량 프리뷰 박스: `emerald-950/30` → `bg-primary/5 border-primary/20 text-primary`
- 텍스트에어리어 / 글자수 카운터: 인풋과 동일 규칙, 카운터 초과색 `text-error`
- 사진 업로드: dashed `border-outline`, hover `border-primary/50 bg-surface`; 미리보기 카드 라이트화
- 제출 버튼: `<Button>` 로 일원화 → `h-14 rounded-lg bg-primary text-white font-bold`
- 안내 문구 / 푸터: `bg-surface-container border-outline text-label`
- **완료 기준**: 폼 전체가 라이트, 대비(AA) 통과, 기능 회귀 없음(검증/포커스 이동/이미지 프리뷰)

### Phase 3 — 결과 대시보드 (`components/result/summary-panel.tsx`)
- 패널 카드 라이트화(`bg-white rounded-2xl shadow-sm border-outline`)
- 총 칼로리 스탯 카드: `bg-slate-950/80` → `bg-surface`; 숫자 `text-navy`; 그라디언트 바 → `bg-primary` 단색(초과 시 `bg-error`/amber)
- 매크로 3바: D4 색상 적용, 트랙 `bg-surface`, 값 텍스트 navy
- 목표 배지 `goalLabels` 색상 맵을 라이트 팔레트로 재작성 (cyan/purple → green 톤 or 중립)
- AI 총평 박스: `bg-primary/5 border-primary/20 text-body`, 제목 `text-primary`
- 경고 배지: `bg-amber-50 border-amber-200 text-amber-700` 류로
- 음식별 분해 리스트: 구분선 `divide-outline`, 배경 `bg-white`/`bg-surface`
- **완료 기준**: 대시보드 라이트, 수치 가독성, 진행바 정상

### Phase 4 — 예외 / 오버레이
**파일**: `loading-overlay.tsx`, `retry-modal.tsx`, `error-state.tsx`
- 오버레이 배경: `bg-slate-950/75 backdrop-blur-md` → `bg-navy/40 backdrop-blur-sm` (라이트 위 딤)
- 모달/패널 본체: `bg-white rounded-2xl shadow-sm border-outline`, 텍스트 navy/body
- 상태색: 실패 `text-error` / 재시도 amber / 진행 `text-primary`
- `error-state.tsx`: `bg-red-950/20` → `bg-error/5 border-error/20`, 가이드 박스 `bg-surface`
- 로딩 카피 "AI 분석 중..." 중앙 정렬 유지(design.md 명세 그대로)
- **완료 기준**: 3개 상태 오버레이 라이트, 스피너/프로그레스 정상

### Phase 5 — 공유 카드 (`components/result/share-card.tsx`) — D3 따름
- (권장안 a) 라이트 재디자인: 상단 `bg-primary` 헤더 밴드 + `bg-white` 바디 + `border-outline`
- 발광 블롭 제거, 그라디언트 텍스트 → `text-navy` / `text-primary`
- 매크로 pill 라이트화, 푸터 브랜딩 라이트
- `lib/image-export.ts`: `html-to-image` 옵션에 `backgroundColor: '#ffffff'` 명시 추가(투명 배경 방지)
- `share-actions.tsx`: 버튼을 `<Button>` variant로 정리(primary/outline), 아이콘색 그린 통일
- **완료 기준**: 카드 라이트 렌더 + PNG 내보내기(복사/다운로드/웹공유) 배경 정상

### Phase 6 — QA & 마무리
- `npm run build` 통과
- 모바일(390) / 데스크톱 뷰 육안 점검
- 대비 검사: navy `#1e293b` on surface, `#475569` body, `#94a3b8` label, primary 버튼 텍스트 → WCAG AA
- 공유 카드 PNG 스냅샷 실측
- 잔존 `slate-*` / `emerald-*` / `cyan-*` / `#FF0000` 하드코딩 grep 제로화
- `design.md` 에 최종 확정값(타입 유틸 클래스명, 매크로 색상 등) 역반영
- 커밋 분할: Phase 0~1 / Phase 2 / Phase 3~4 / Phase 5 / Phase 6

---

## 5. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 컴포넌트가 토큰 미사용 → 치환 누락 | 다크 잔재가 부분적으로 남음 | Phase 6에서 `slate-|emerald-|cyan-|#FF0000` grep 게이트 |
| `html-to-image` 라이트 배경 투명 이슈 | 공유 카드 PNG 깨짐 | `backgroundColor` 옵션 명시 + 실측 |
| 390px 고정 시 데스크톱 UX 저하 | 넓은 화면에서 답답함 | D1에서 반응형(b) 채택 권장 |
| Plus Jakarta Sans 한글 미지원 | 한글이 fallback 폰트로 렌더 | `--font-sans` 에 Noto Sans KR fallback 체인 유지 |
| 대비 부족 (`#94a3b8` 라벨 on `#f8f9ff`) | 접근성 AA 미달 가능 | 본문 대비 확보, 라벨은 보조 정보에만 사용 |

## 6. 예상 산출물
- 변경 파일: 위 11개 + `design.md` 역반영
- 신규: 타입 스케일 유틸(globals.css 내) 
- 커밋: 5분할 예상
- 다크모드 제거 시 순삭 코드 다수 (globals.css ~70줄)
