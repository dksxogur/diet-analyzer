'use client'

import React, { useState, useRef, useMemo } from 'react'
import {
  Utensils,
  Sparkles,
  Scale,
  Target,
  Flame,
  UploadCloud,
  X,
  AlertCircle,
  Zap,
  Info,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  calculateNutritionTargets,
  type GoalType,
  type RecommendedNutrition,
} from '@/lib/nutrition-calc'
import {
  analyzeDietWithRetry,
  type DietAnalysisResult,
  type AnalysisStep,
} from '@/lib/ai-client'
import { LoadingOverlay } from '@/components/common/loading-overlay'
import { RetryModal } from '@/components/common/retry-modal'
import { ErrorState } from '@/components/common/error-state'
import { SummaryPanel } from '@/components/result/summary-panel'
import { ShareCard } from '@/components/result/share-card'
import { ShareActions } from '@/components/result/share-actions'

export function DietAnalyzer() {
  // --- Form States ---
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [goal, setGoal] = useState<GoalType>('diet')
  const [dietText, setDietText] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // --- Validation Error States ---
  const [errors, setErrors] = useState<{
    height?: string
    weight?: string
    food?: string
  }>({})

  // --- AI Analysis & Exception States (Sprint 2) ---
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStep>('idle')
  const [analysisMessage, setAnalysisMessage] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<DietAnalysisResult | null>(null)
  const [isRetryModalOpen, setIsRetryModalOpen] = useState<boolean>(false)
  const [hasDataError, setHasDataError] = useState<boolean>(false)

  // --- Input Refs for Auto-Focus on Validation Failure ---
  const heightInputRef = useRef<HTMLInputElement>(null)
  const weightInputRef = useRef<HTMLInputElement>(null)
  const dietTextRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // --- Computed Real-time TDEE / Target Preview ---
  const nutritionTargets: RecommendedNutrition | null = useMemo(() => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!isNaN(h) && h > 0 && !isNaN(w) && w > 0) {
      return calculateNutritionTargets({ height: h, weight: w, goal })
    }
    return null
  }, [height, weight, goal])

  // --- Handlers ---
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHeight(val)
    if (errors.height) {
      setErrors((prev) => ({ ...prev, height: undefined }))
    }
  }

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setWeight(val)
    if (errors.weight) {
      setErrors((prev) => ({ ...prev, weight: undefined }))
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= 200) {
      setDietText(val)
    } else {
      setDietText(val.slice(0, 200))
    }
    if (errors.food) {
      setErrors((prev) => ({ ...prev, food: undefined }))
    }
    if (hasDataError) {
      setHasDataError(false)
    }
  }

  const handleImageSelect = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      alert('JPG, PNG, WEBP 형식의 이미지만 업로드 가능합니다.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    if (errors.food) {
      setErrors((prev) => ({ ...prev, food: undefined }))
    }
    if (hasDataError) {
      setHasDataError(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0])
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // --- Form Validation & Submission ---
  const runAnalysis = async () => {
    const parsedHeight = parseFloat(height)
    const parsedWeight = parseFloat(weight)

    setHasDataError(false)

    try {
      const result = await analyzeDietWithRetry(
        {
          height: parsedHeight,
          weight: parsedWeight,
          goal,
          dietText,
          imageFile,
          imagePreview,
          recommendedNutrition: nutritionTargets,
        },
        (status, message) => {
          setAnalysisStatus(status)
          if (message) setAnalysisMessage(message)
        }
      )

      setAnalysisResult(result)
      setAnalysisStatus('success')

      // Smooth scroll to result area
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    } catch (error: any) {
      if (error?.message === 'INVALID_DIET_DATA') {
        setHasDataError(true)
        setAnalysisStatus('error')
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      } else {
        setIsRetryModalOpen(true)
        setAnalysisStatus('idle')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { height?: string; weight?: string; food?: string } = {}

    const parsedHeight = parseFloat(height)
    if (!height.trim() || isNaN(parsedHeight) || parsedHeight <= 0) {
      newErrors.height = '키(cm)를 올바르게 입력해 주세요.'
    }

    const parsedWeight = parseFloat(weight)
    if (!weight.trim() || isNaN(parsedWeight) || parsedWeight <= 0) {
      newErrors.weight = '몸무게(kg)를 올바르게 입력해 주세요.'
    }

    const hasFoodText = dietText.trim().length > 0
    const hasFoodImage = imagePreview !== null
    if (!hasFoodText && !hasFoodImage) {
      newErrors.food = '음식 텍스트 또는 사진을 1개 이상 추가해 주세요.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)

      // Auto-focus on the first missing field (PRD 5.1)
      if (newErrors.height) {
        heightInputRef.current?.focus()
      } else if (newErrors.weight) {
        weightInputRef.current?.focus()
      } else if (newErrors.food) {
        dietTextRef.current?.focus()
      }
      return
    }

    // Clear validation errors
    setErrors({})

    // Trigger AI Analysis Pipeline (Sprint 2)
    runAnalysis()
  }

  const isAnalyzing =
    analysisStatus === 'analyzing' ||
    analysisStatus === 'failed' ||
    analysisStatus === 'retrying'

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center pb-16 px-4 sm:px-6 relative overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Top app bar (D5) — visual only, no navigation targets */}
      <header className="sticky top-0 z-40 w-full border-b border-outline bg-surface/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[390px] items-center justify-center gap-2 px-5 md:max-w-[600px]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-navy">
            Nutri <span className="text-primary">Snap</span>
          </span>
        </div>
      </header>

      {/* Loading Overlay (PRD 5.3, 5.4) */}
      <LoadingOverlay status={analysisStatus} message={analysisMessage} />

      {/* Retry Modal for Network Failure (PRD 5.3) */}
      <RetryModal
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        onRetry={() => {
          setIsRetryModalOpen(false)
          runAnalysis()
        }}
      />

      <main className="w-full max-w-[390px] md:max-w-[600px] space-y-8 pt-8">
        {/* Header Section */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            1분 식단 칼로리 & 영양 균형 추정기
          </div>
          <h1 className="type-display">
            식단 분석, 이제 <span className="text-primary">3초</span>면 끝.
          </h1>
          <p className="text-body text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            신체 정보와 오늘 먹은 식단을 입력하면, 권장 칼로리 대비 영양 균형을 즉시 분석하고 요약 카드로 공유합니다.
          </p>
        </header>

        {/* Input Form Section (Single-Page Form Section - PRD 3.1) */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-surface-container border border-outline rounded-xl p-6 custom-shadow space-y-6 transition-all"
        >
          <div className="flex items-center justify-between border-b border-outline pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="type-title">식단 &amp; 신체 정보 입력</h2>
                <p className="text-xs text-label">로그인 없이 즉시 하루 권장 대비 영양을 진단합니다.</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              단일 화면 App
            </span>
          </div>

          {/* 1. Body Info (Height, Weight) */}
          <div className="space-y-3">
            <label className="type-label flex items-center gap-1.5 text-navy">
              <Scale className="w-3.5 h-3.5 text-primary" />
              1. 신체 정보 (필수)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Height Field */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    ref={heightInputRef}
                    id="height-input"
                    type="number"
                    min="50"
                    max="250"
                    step="0.1"
                    placeholder="키 (cm) 입력"
                    value={height}
                    disabled={isAnalyzing}
                    onChange={handleHeightChange}
                    className={`w-full px-4 py-3 rounded-lg bg-surface-container-low border text-on-surface placeholder-label focus:outline-none text-sm transition-all ${
                      errors.height
                        ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
                        : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-label font-medium">
                    cm
                  </span>
                </div>
                {errors.height && (
                  <p className="text-xs text-error font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.height}
                  </p>
                )}
              </div>

              {/* Weight Field */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    ref={weightInputRef}
                    id="weight-input"
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    placeholder="몸무게 (kg) 입력"
                    value={weight}
                    disabled={isAnalyzing}
                    onChange={handleWeightChange}
                    className={`w-full px-4 py-3 rounded-lg bg-surface-container-low border text-on-surface placeholder-label focus:outline-none text-sm transition-all ${
                      errors.weight
                        ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
                        : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-label font-medium">
                    kg
                  </span>
                </div>
                {errors.weight && (
                  <p className="text-xs text-error font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.weight}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Goal Selector */}
          <div className="space-y-2.5">
            <label className="type-label flex items-center gap-1.5 text-navy">
              <Target className="w-3.5 h-3.5 text-primary" />
              2. 식단 목적 (택 1)
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(
                [
                  { id: 'diet', label: '다이어트', desc: '체중 감량' },
                  { id: 'bulk', label: '벌크업', desc: '근성장' },
                  { id: 'health', label: '건강', desc: '유지/웰빙' },
                ] as const
              ).map((item) => {
                const isSelected = goal === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => setGoal(item.id)}
                    className={`py-3 px-2 rounded-full text-center border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-surface-container border-outline text-body hover:bg-surface-variant hover:text-navy'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                    <span className="text-[10px] sm:text-xs opacity-80">{item.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Real-time Target Preview */}
          {nutritionTargets && (
            <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-body flex items-center justify-between gap-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong className="text-navy">목표 권장량:</strong>{' '}
                  {nutritionTargets.targetCalories.toLocaleString()} kcal
                  <span className="hidden sm:inline text-label ml-2">
                    (탄 {nutritionTargets.targetCarbs}g · 단 {nutritionTargets.targetProtein}g · 지 {nutritionTargets.targetFat}g)
                  </span>
                </span>
              </div>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                기초대사량 {nutritionTargets.bmr} kcal
              </span>
            </div>
          )}

          {/* 3. Food Info (Text & Photo) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="type-label flex items-center gap-1.5 text-navy">
                <Flame className="w-3.5 h-3.5 text-primary" />
                3. 음식 정보 입력 (텍스트 또는 사진)
              </label>
              {/* Character Counter (PRD 5.2) */}
              <span
                className={`text-xs font-mono font-medium transition-colors ${
                  dietText.length >= 200 ? 'text-error font-bold' : 'text-label'
                }`}
              >
                ({dietText.length} / 200)
              </span>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <textarea
                ref={dietTextRef}
                id="diet-text-input"
                rows={3}
                maxLength={200}
                placeholder="예: 제육볶음 1인분, 공기밥 1공기, 찌개 약간"
                value={dietText}
                disabled={isAnalyzing}
                onChange={handleTextChange}
                className={`w-full px-4 py-3 rounded-lg bg-surface-container-low border text-on-surface placeholder-label focus:outline-none text-sm resize-none transition-all ${
                  errors.food
                    ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
                    : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
            </div>

            {/* Photo Upload Area */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isAnalyzing}
                className="hidden"
                id="food-photo-upload"
              />

              {!imagePreview ? (
                <label
                  htmlFor="food-photo-upload"
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-lg bg-surface-container-low border border-dashed border-outline hover:border-primary/50 hover:bg-surface-variant text-body hover:text-navy text-xs font-medium cursor-pointer transition-all group"
                >
                  <UploadCloud className="w-4 h-4 text-label group-hover:text-primary transition-colors" />
                  <span>음식 사진 첨부하기 (.jpg, .png, .webp)</span>
                </label>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-outline bg-surface-container-low p-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="식단 사진 미리보기"
                    className="w-14 h-14 object-cover rounded-lg border border-outline shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-navy font-medium truncate">
                      {imageFile?.name || '업로드된 식단 이미지'}
                    </p>
                    <p className="text-[10px] text-label">
                      {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : '이미지 준비됨'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg bg-surface-variant hover:bg-error/10 hover:text-error text-body transition-colors cursor-pointer"
                    title="사진 삭제"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Food Error message */}
              {errors.food && (
                <p className="text-xs text-error font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.food}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button (PRD 5.4: Disabled & Spinner during analyzing) */}
          <Button
            type="submit"
            id="analyze-submit-button"
            size="xl"
            disabled={isAnalyzing}
            className="w-full cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 분석 진행 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>영양 분석하기</span>
              </>
            )}
          </Button>
        </form>

        {/* Informational Guidance */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-surface-container border border-outline text-body text-xs leading-relaxed">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            입력된 정보는 외부 서버 데이터베이스에 저장되지 않으며, 분석 후 시각적 요약 카드로 생성되어 즉시 공유할 수 있습니다.
          </span>
        </div>

        {/* Result & Exception Section Anchor (PRD 3.2, 5.5) */}
        <div ref={resultRef} className="space-y-6 pt-2">
          {/* PRD 5.5: Data Exception / Gibberish Error State */}
          {hasDataError && (
            <ErrorState
              onRetry={() => {
                setHasDataError(false)
                dietTextRef.current?.focus()
              }}
            />
          )}

          {/* Sprint 3: Full Nutrition Dashboard Panel & Visual Share Card (PRD 3.2) */}
          {analysisResult && !hasDataError && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 1. Nutrition Diagnostic Summary Panel */}
              <SummaryPanel
                result={analysisResult}
                targets={nutritionTargets}
                goal={goal}
              />

              {/* 2. Visual Summary Share Card Section */}
              <section className="space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-navy flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    시각적 요약 공유 카드
                  </h3>
                  <p className="text-xs text-label">
                    SNS 및 메신저 공유에 최적화된 결과 카드입니다.
                  </p>
                </div>

                <ShareCard
                  result={analysisResult}
                  targets={nutritionTargets}
                  goal={goal}
                  height={height}
                  weight={weight}
                />

                {/* 3. 1-Click Share & Export Actions (Sprint 4) */}
                <ShareActions summaryComment={analysisResult.summaryComment} />
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-label pb-4">
          © 2026 Nutri Snap. All rights reserved.
        </footer>
      </main>
    </div>
  )
}
