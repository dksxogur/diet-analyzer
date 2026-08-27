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
    diet: { label: '체중 감량 다이어트', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    bulk: { label: '근성장 벌크업', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    health: { label: '건강 유지/웰빙', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 animate-in fade-in duration-300">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              영양 분석 진단 대시보드
            </h2>
            <p className="text-xs text-slate-400">권장 섭취량 대비 실시간 섭취 균형 지표</p>
          </div>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full border self-start sm:self-auto ${goalLabels[goal].color}`}>
          목표: {goalLabels[goal].label}
        </span>
      </div>

      {/* Total Calories Main Stat Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-emerald-400" />
            총 섭취 칼로리 분석
          </span>
          <span className="text-xs text-slate-400">
            목표: <strong className="text-white">{targetCalories.toLocaleString()}</strong> kcal
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {result.totalCalories.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-slate-400">kcal</span>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                calPercent > 115
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                  : calPercent < 60
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
              }`}
            >
              {calPercent > 100 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              권장량 대비 {calPercent}%
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {calDiff > 0 ? `+${calDiff} kcal 초과` : `${Math.abs(calDiff)} kcal 잔여`}
            </p>
          </div>
        </div>

        {/* Calories Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              calPercent > 115 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
            }`}
            style={{ width: `${Math.min(calPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Macronutrient 3-Bar Progress Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          3대 영양소 (탄·단·지) 섭취 밸런스
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Carbs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-amber-400">탄수화물</span>
              <span className="text-slate-400 text-[11px]">목표 {targetCarbs}g</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{result.carbs}g</span>
              <span className="text-xs font-medium text-slate-400">{carbsPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-400">단백질</span>
              <span className="text-slate-400 text-[11px]">목표 {targetProtein}g</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400">{result.protein}g</span>
              <span className="text-xs font-medium text-slate-400">{proteinPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-cyan-400">지방</span>
              <span className="text-slate-400 text-[11px]">목표 {targetFat}g</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{result.fat}g</span>
              <span className="text-xs font-medium text-slate-400">{fatPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Nutritionist 1-Line Comment */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-300 block mb-0.5">AI 영양 총평</span>
          <span>{result.summaryComment}</span>
        </div>
      </div>

      {/* Warnings & Caution Badges */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            과다 / 부족 주의사항
          </label>
          <div className="space-y-1.5">
            {result.warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
              >
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food Items Breakdown (if available) */}
      {result.items && result.items.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
            음식별 추정 영양 성분 분해
          </span>
          <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden">
            {result.items.map((item, index) => (
              <div key={index} className="p-3.5 flex items-center justify-between text-xs">
                <span className="font-medium text-white">{item.name}</span>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-emerald-400 font-semibold">{item.calories} kcal</span>
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
