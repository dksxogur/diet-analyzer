'use client'

import React from 'react'
import { AlertTriangle, RotateCcw, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  onRetry: () => void
  message?: string
}

export function ErrorState({
  onRetry,
  message = '식단 입력값을 분석할 수 없습니다. 입력값(텍스트/사진)을 재점검해 주세요.',
}: ErrorStateProps) {
  return (
    <section
      aria-live="polite"
      className="w-full bg-red-950/20 border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl animate-in fade-in duration-300"
    >
      <div className="mx-auto w-14 h-14 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-red-200">식단 데이터 재점검 안내</h3>
        <p className="text-sm text-red-300/90 font-medium leading-relaxed">{message}</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 text-left max-w-md mx-auto space-y-1.5">
        <p className="font-semibold text-slate-200 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          입력 가이드
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
          <li>음식 이름과 대략적인 분량을 적어주세요. (예: 닭가슴살 1팩, 밥 1공기)</li>
          <li>음식 사진이 선명하게 나오도록 재촬영하거나 업로드해 보세요.</li>
          <li>특수문자나 무의미한 자음/모음 나열은 분석되지 않습니다.</li>
        </ul>
      </div>

      <div className="pt-1">
        <Button
          type="button"
          onClick={onRetry}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          다시 시도하기
        </Button>
      </div>
    </section>
  )
}
