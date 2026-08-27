'use client'

import React from 'react'
import { Sparkles, Zap, Flame, ShieldCheck } from 'lucide-react'
import { type DietAnalysisResult } from '@/lib/ai-client'
import { type RecommendedNutrition, type GoalType } from '@/lib/nutrition-calc'

interface ShareCardProps {
  result: DietAnalysisResult
  targets: RecommendedNutrition | null
  goal: GoalType
  height?: string
  weight?: string
}

export function ShareCard({ result, targets, goal, height, weight }: ShareCardProps) {
  const targetCalories = targets?.targetCalories || 2000
  const calPercent = Math.round((result.totalCalories / targetCalories) * 100)

  const goalLabels: Record<GoalType, string> = {
    diet: '체중 감량 다이어트',
    bulk: '근성장 벌크업',
    health: '건강 유지 & 웰빙',
  }

  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      id="nutri-snap-share-card"
      className="w-full max-w-md mx-auto bg-surface-container border border-outline rounded-xl overflow-hidden custom-shadow text-on-surface"
    >
      {/* Card Header — brand band */}
      <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black tracking-wider uppercase block">
              Nutri Snap
            </span>
            <span className="text-[10px] text-white/80">1분 AI 영양 균형 카드</span>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-primary bg-white px-2.5 py-1 rounded-full">
          {goalLabels[goal]}
        </span>
      </div>

      <div className="p-6 sm:p-7">
        {/* Body Info Sub-header */}
        {(height || weight) && (
          <div className="flex items-center justify-between text-[11px] text-label">
            <span>신체 정보: {height ? `${height}cm` : ''} {weight ? `· ${weight}kg` : ''}</span>
            <span>{currentDate}</span>
          </div>
        )}

        {/* Main Calories Display */}
        <div className="my-5 text-center bg-surface-container-low border border-outline rounded-lg p-5">
          <div className="inline-flex items-center gap-1.5 text-xs text-label font-medium mb-1">
            <Flame className="w-3.5 h-3.5 text-primary" />
            오늘 식단 총 섭취 칼로리
          </div>
          <div className="flex items-baseline justify-center gap-1.5 my-1">
            <span className="text-4xl sm:text-5xl font-black text-navy tracking-tight">
              {result.totalCalories.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-label">kcal</span>
          </div>
          <div className="text-xs text-primary font-medium mt-1">
            목표 권장량({targetCalories.toLocaleString()} kcal) 대비{' '}
            <strong className="underline underline-offset-2">{calPercent}%</strong> 달성
          </div>
        </div>

        {/* Macronutrients 3 Pills */}
        <div className="grid grid-cols-3 gap-2.5 my-4 text-center">
          <div className="bg-surface-container-low border border-outline rounded-lg p-2.5">
            <span className="text-[10px] text-macro-carb font-bold block uppercase">탄수화물</span>
            <p className="text-base font-extrabold text-navy mt-0.5">{result.carbs}g</p>
          </div>
          <div className="bg-surface-container-low border border-outline rounded-lg p-2.5">
            <span className="text-[10px] text-macro-protein font-bold block uppercase">단백질</span>
            <p className="text-base font-extrabold text-macro-protein mt-0.5">{result.protein}g</p>
          </div>
          <div className="bg-surface-container-low border border-outline rounded-lg p-2.5">
            <span className="text-[10px] text-macro-fat font-bold block uppercase">지방</span>
            <p className="text-base font-extrabold text-navy mt-0.5">{result.fat}g</p>
          </div>
        </div>

        {/* AI Comment Box */}
        <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-body text-xs leading-relaxed my-4">
          <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] mb-1">
            <Zap className="w-3.5 h-3.5" />
            AI 영양사 한 줄 피드백
          </div>
          <p className="text-body font-medium">{result.summaryComment}</p>
        </div>

        {/* Card Footer Branding */}
        <div className="pt-3 border-t border-outline flex items-center justify-between text-[10px] text-label">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-primary" />
            Verified by NutriSnap Engine
          </span>
          <span>diet-analyzer.app</span>
        </div>
      </div>
    </div>
  )
}
