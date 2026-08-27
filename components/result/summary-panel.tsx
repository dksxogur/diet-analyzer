'use client'

import React from 'react'
import {
  Activity,
  Flame,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { type DietAnalysisResult } from '@/lib/ai-client'
import { type RecommendedNutrition, type GoalType } from '@/lib/nutrition-calc'

interface SummaryPanelProps {
  result: DietAnalysisResult
  targets: RecommendedNutrition | null
  goal: GoalType
}

export function SummaryPanel({ result, targets, goal }: SummaryPanelProps) {
  const targetCalories = targets?.targetCalories || 2000
  const calPercent = Math.round((result.totalCalories / targetCalories) * 100)
  const calDiff = result.totalCalories - targetCalories

  // Macro Target Ratios & Percentages
  const targetCarbs = targets?.targetCarbs || 250
  const targetProtein = targets?.targetProtein || 100
  const targetFat = targets?.targetFat || 60

  const carbsPercent = Math.min(Math.round((result.carbs / targetCarbs) * 100), 100)
  const proteinPercent = Math.min(Math.round((result.protein / targetProtein) * 100), 100)
  const fatPercent = Math.min(Math.round((result.fat / targetFat) * 100), 100)

  const goalLabels: Record<GoalType, { label: string; color: string }> = {
    diet: { label: '체중 감량 다이어트', color: 'text-primary bg-primary/10 border-primary/20' },
    bulk: { label: '근성장 벌크업', color: 'text-macro-fat bg-macro-fat/10 border-macro-fat/20' },
    health: { label: '건강 유지/웰빙', color: 'text-navy bg-surface-variant border-outline' },
  }

  return (
    <div className="bg-surface-container border border-outline rounded-xl p-6 custom-shadow space-y-6 animate-in fade-in duration-300">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="type-title flex items-center gap-2">
              영양 분석 진단 대시보드
            </h2>
            <p className="text-xs text-label">권장 섭취량 대비 실시간 섭취 균형 지표</p>
          </div>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full border self-start sm:self-auto ${goalLabels[goal].color}`}>
          목표: {goalLabels[goal].label}
        </span>
      </div>

      {/* Total Calories Main Stat Card */}
      <div className="bg-surface-container-low border border-outline rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="type-label flex items-center gap-1.5 text-navy">
            <Flame className="w-4 h-4 text-primary" />
            총 섭취 칼로리 분석
          </span>
          <span className="text-xs text-label">
            목표: <strong className="text-navy">{targetCalories.toLocaleString()}</strong> kcal
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              {result.totalCalories.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-label">kcal</span>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                calPercent > 115
                  ? 'bg-macro-carb/15 text-macro-carb border border-macro-carb/25'
                  : calPercent < 60
                  ? 'bg-macro-fat/15 text-macro-fat border border-macro-fat/25'
                  : 'bg-primary/15 text-primary border border-primary/25'
              }`}
            >
              {calPercent > 100 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              권장량 대비 {calPercent}%
            </span>
            <p className="text-[11px] text-label mt-1">
              {calDiff > 0 ? `+${calDiff} kcal 초과` : `${Math.abs(calDiff)} kcal 잔여`}
            </p>
          </div>
        </div>

        {/* Calories Progress Bar */}
        <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden border border-outline">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              calPercent > 115 ? 'bg-macro-carb' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(calPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Macronutrient 3-Bar Progress Grid */}
      <div className="space-y-3">
        <label className="type-label text-navy">
          3대 영양소 (탄·단·지) 섭취 밸런스
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Carbs */}
          <div className="bg-surface-container-low border border-outline rounded-lg p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-macro-carb">탄수화물</span>
              <span className="text-label text-[11px]">목표 {targetCarbs}g</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-navy">{result.carbs}g</span>
              <span className="text-xs font-medium text-label">{carbsPercent}%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden border border-outline">
              <div
                className="bg-macro-carb h-full rounded-full transition-all duration-700"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-surface-container-low border border-outline rounded-lg p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-macro-protein">단백질</span>
              <span className="text-label text-[11px]">목표 {targetProtein}g</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-macro-protein">{result.protein}g</span>
              <span className="text-xs font-medium text-label">{proteinPercent}%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden border border-outline">
              <div
                className="bg-macro-protein h-full rounded-full transition-all duration-700"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-surface-container-low border border-outline rounded-lg p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-macro-fat">지방</span>
              <span className="text-label text-[11px]">목표 {targetFat}g</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-navy">{result.fat}g</span>
              <span className="text-xs font-medium text-label">{fatPercent}%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden border border-outline">
              <div
                className="bg-macro-fat h-full rounded-full transition-all duration-700"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Nutritionist 1-Line Comment */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-body text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-primary block mb-0.5">AI 영양 총평</span>
          <span>{result.summaryComment}</span>
        </div>
      </div>

      {/* Warnings & Caution Badges */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="space-y-2">
          <label className="type-label flex items-center gap-1.5 text-navy">
            <AlertTriangle className="w-3.5 h-3.5 text-macro-carb" />
            과다 / 부족 주의사항
          </label>
          <div className="space-y-1.5">
            {result.warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-lg bg-macro-carb/10 border border-macro-carb/25 text-macro-carb text-xs font-medium"
              >
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food Items Breakdown (if available) */}
      {result.items && result.items.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-outline">
          <span className="text-xs font-semibold text-label flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
            음식별 추정 영양 성분 분해
          </span>
          <div className="divide-y divide-outline rounded-lg bg-surface-container-low border border-outline overflow-hidden">
            {result.items.map((item, index) => (
              <div key={index} className="p-3.5 flex items-center justify-between text-xs">
                <span className="font-medium text-navy">{item.name}</span>
                <div className="flex items-center gap-3 text-label">
                  <span className="text-primary font-semibold">{item.calories} kcal</span>
                  <span className="text-[11px]">탄 {item.carbs}g · 단 {item.protein}g · 지 {item.fat}g</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
