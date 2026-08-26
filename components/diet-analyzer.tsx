'use client'

import React, { useState } from 'react'
import { Utensils, Sparkles, Scale, Target, Flame, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DietAnalyzer() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState<'diet' | 'bulk' | 'health'>('diet')
  const [dietText, setDietText] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            1분 식단 칼로리 & 영양 균형 추정기
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Nutri <span className="text-emerald-400">Snap</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            신체 정보와 오늘 먹은 식단을 입력하면, 권장 칼로리 대비 영양 균형을 즉시 분석하고 요약 카드를 만들어 드립니다.
          </p>
        </header>

        {/* Temporary Card for Server Verification */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">식단 및 신체 정보 입력</h2>
              <p className="text-xs text-slate-400">로컬 개발 서버가 정상적으로 실행되었습니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                키 (cm)
              </label>
              <input
                type="number"
                placeholder="예: 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                몸무게 (kg)
              </label>
              <input
                type="number"
                placeholder="예: 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Goal Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              식단 목적
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'diet', label: '다이어트 (체중 감량)' },
                  { id: 'bulk', label: '벌크업 (근성장)' },
                  { id: 'health', label: '건강 (유지)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    goal === item.id
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food text input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                섭취한 음식 기록
              </label>
              <span className={`text-xs ${dietText.length >= 200 ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                ({dietText.length} / 200)
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              placeholder="예: 제육볶음 1인분, 공기밥 1공기, 된장찌개 약간"
              value={dietText}
              onChange={(e) => setDietText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm resize-none transition-all"
            />
          </div>

          <Button className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            영양 분석하기
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600">
          © 2026 Nutri Snap. AI-Powered Single Page Diet Analyzer.
        </footer>
      </div>
    </div>
  )
}
