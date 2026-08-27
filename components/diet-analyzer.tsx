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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Background glowing gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

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

      <main className="w-full max-w-2xl space-y-8">
        {/* Header Section */}
        <header className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            1분 식단 칼로리 & 영양 균형 추정기
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Nutri <span className="text-emerald-400">Snap</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            신체 정보와 오늘 먹은 식단을 입력하면, 권장 칼로리 대비 영양 균형을 즉시 분석하고 요약 카드로 공유합니다.
          </p>
        </header>

        {/* Input Form Section (Single-Page Form Section - PRD 3.1) */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 transition-all"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">식단 & 신체 정보 입력</h2>
                <p className="text-xs text-slate-400">로그인 없이 즉시 하루 권장 대비 영양을 진단합니다.</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              단일 화면 App
            </span>
          </div>

          {/* 1. Body Info (Height, Weight) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
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
                    className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-white placeholder-slate-600 focus:outline-none text-sm transition-all ${
                      errors.height
                        ? 'border-[#FF0000] focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]'
                        : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                    cm
                  </span>
                </div>
                {errors.height && (
                  <p className="text-xs text-[#FF0000] font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
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
                    className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-white placeholder-slate-600 focus:outline-none text-sm transition-all ${
                      errors.weight
                        ? 'border-[#FF0000] focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]'
                        : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                    kg
                  </span>
                </div>
                {errors.weight && (
                  <p className="text-xs text-[#FF0000] font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.weight}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Goal Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
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
                    className={`py-3 px-2 rounded-2xl text-center border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                    <span className="text-[10px] sm:text-xs opacity-75">{item.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Real-time Target Preview */}
          {nutritionTargets && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300/90 flex items-center justify-between gap-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>목표 권장량:</strong> {nutritionTargets.targetCalories.toLocaleString()} kcal
                  <span className="hidden sm:inline text-emerald-400/60 ml-2">
                    (탄 {nutritionTargets.targetCarbs}g · 단 {nutritionTargets.targetProtein}g · 지 {nutritionTargets.targetFat}g)
                  </span>
                </span>
              </div>
              <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                기초대사량 {nutritionTargets.bmr} kcal
              </span>
            </div>
          )}

          {/* 3. Food Info (Text & Photo) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                3. 음식 정보 입력 (텍스트 또는 사진)
              </label>
              {/* Character Counter (PRD 5.2) */}
              <span
                className={`text-xs font-mono font-medium transition-colors ${
                  dietText.length >= 200 ? 'text-[#FF0000] font-bold' : 'text-slate-500'
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
                className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-white placeholder-slate-600 focus:outline-none text-sm resize-none transition-all ${
                  errors.food
                    ? 'border-[#FF0000] focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000]'
                    : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
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
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950/80 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer transition-all group"
                >
                  <UploadCloud className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  <span>음식 사진 첨부하기 (.jpg, .png, .webp)</span>
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/80 p-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="식단 사진 미리보기"
                    className="w-14 h-14 object-cover rounded-xl border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">
                      {imageFile?.name || '업로드된 식단 이미지'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : '이미지 준비됨'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
                    title="사진 삭제"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Food Error message */}
              {errors.food && (
                <p className="text-xs text-[#FF0000] font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
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
            disabled={isAnalyzing}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
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
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-400 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
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
                  <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    시각적 요약 공유 카드
                  </h3>
                  <p className="text-xs text-slate-400">
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
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600 pb-4">
          © 2026 Nutri Snap. All rights reserved.
        </footer>
      </main>
    </div>
  )
}
