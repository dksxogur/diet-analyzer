# NutriFlow Vitality Design System

## 1. Brand Identity & Visual Direction
**NutriFlow Vitality**는 사용자가 자신의 식단을 쉽고 빠르게 분석하여 건강한 삶을 유지할 수 있도록 돕는 서비스입니다. 디자인은 **건강함(Vibrant Green)**과 **데이터 신뢰도(Deep Navy)**를 핵심 키워드로 하여, 깔끔하고 직관적인 인터페이스를 지향합니다.

## 2. Colors

### Brand Colors
- **Primary (Vibrant Green):** `#22c55e` (신선함, 건강, 활동성)
- **Secondary (Deep Navy):** `#1e293b` (전문성, 데이터의 정확성, 신뢰도)

### Functional Colors
- **Surface:** `#f8f9ff` (전체 배경색, 깨끗하고 넓은 느낌)
- **Surface-Container:** `#ffffff` (카드 및 입력 폼 배경)
- **Outline:** `#e2e8f0` (경계선 및 디바이더)
- **Error:** `#ef4444` (입력 누락, 글자 수 초과 등 경고 시 사용)

## 3. Typography
- **Font Family:** `Plus Jakarta Sans`, `sans-serif`
- **Headlines:**
  - `Display Large`: 32px, Bold, `#1e293b`
  - `Title Medium`: 18px, Semi-Bold, `#1e293b`
- **Body:**
  - `Body Medium`: 14px, Regular, `#475569`
  - `Label Small`: 12px, Medium, `#94a3b8`

## 4. Components & Style Rules

### Buttons
- **Primary Button:** `bg-primary`, `text-white`, `rounded-lg`, `h-14`, `font-bold`. 분석하기와 같은 핵심 액션에 사용.
- **Segmented Control (Goal Selection):** 선택된 상태는 `bg-primary`, `text-white`. 미선택 상태는 `bg-surface-container-low`, `text-on-surface-variant`.

### Input Fields
- **Text Input / Textarea:** `border-outline`, `rounded-lg`, `p-4`, `focus:border-primary`.
- **Photo Upload:** `border-dashed`, `border-outline`, `rounded-lg`, `flex items-center justify-center`.

### Cards & Layout
- **Container:** `max-width: 390px` (모바일 기준), `mx-auto`, `p-gutter`.
- **Section Card:** `bg-white`, `rounded-2xl`, `shadow-sm`, `p-6`. 섹션 간의 구분을 위해 명확한 여백(Spacing)을 활용.

## 5. Animation & Interaction (Add-motion)
- **Hover/Active States:** 버튼 클릭 시 `scale-95` 트랜지션을 적용하여 물리적인 피드백 제공.
- **Loading State:** 분석 중일 때 오버레이 스피너와 함께 "AI 분석 중..." 텍스트를 중앙에 배치.
