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
      className="w-full max-w-md mx-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/40 relative overflow-hidden text-slate-100"
    >
      {/* Background glowing aesthetic blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none -z-0" />

      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black tracking-wider uppercase text-white block">
              Nutri<span className="text-emerald-400">Snap</span>
            </span>
            <span className="text-[10px] text-slate-400">1분 AI 영양 균형 카드</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            {goalLabels[goal]}
          </span>
        </div>
      </div>

      {/* Body Info Sub-header */}
      {(height || weight) && (
        <div className="relative z-10 flex items-center justify-between pt-3 text-[11px] text-slate-400">
          <span>신체 정보: {height ? `${height}cm` : ''} {weight ? `· ${weight}kg` : ''}</span>
          <span>{currentDate}</span>
        </div>
      )}

      {/* Main Calories Display */}
      <div className="relative z-10 my-5 text-center bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 shadow-inner">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
          <Flame className="w-3.5 h-3.5 text-emerald-400" />
          오늘 식단 총 섭취 칼로리
        </div>
        <div className="flex items-baseline justify-center gap-1.5 my-1">
          <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-300 tracking-tight">
            {result.totalCalories.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-slate-400">kcal</span>
        </div>
        <div className="text-xs text-emerald-400 font-medium mt-1">
          목표 권장량({targetCalories.toLocaleString()} kcal) 대비{' '}
          <strong className="underline underline-offset-2">{calPercent}%</strong> 달성
        </div>
      </div>

      {/* Macronutrients 3 Pills */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 my-4 text-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-amber-400 font-bold block uppercase">탄수화물</span>
          <p className="text-base font-extrabold text-white mt-0.5">{result.carbs}g</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-emerald-400 font-bold block uppercase">단백질</span>
          <p className="text-base font-extrabold text-emerald-400 mt-0.5">{result.protein}g</p>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-cyan-400 font-bold block uppercase">지방</span>
          <p className="text-base font-extrabold text-white mt-0.5">{result.fat}g</p>
        </div>
      </div>

      {/* AI Comment Box */}
      <div className="relative z-10 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed my-4">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1">
          <Zap className="w-3.5 h-3.5" />
          AI 영양사 한 줄 피드백
        </div>
        <p className="text-slate-200 font-medium">{result.summaryComment}</p>
      </div>

      {/* Card Footer Branding */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          Verified by NutriSnap Engine
        </span>
        <span>diet-analyzer.app</span>
      </div>
    </div>
  )
}
