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
      className="w-full bg-error/5 border border-error/20 rounded-xl p-6 sm:p-8 text-center space-y-6 custom-shadow animate-in fade-in duration-300"
    >
      <div className="mx-auto w-14 h-14 rounded-xl bg-error/10 border border-error/25 flex items-center justify-center text-error">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-navy">식단 데이터 재점검 안내</h3>
        <p className="text-sm text-error font-medium leading-relaxed">{message}</p>
      </div>

      <div className="bg-surface-container-low border border-outline rounded-lg p-4 text-xs text-body text-left max-w-md mx-auto space-y-1.5">
        <p className="font-semibold text-navy flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          입력 가이드
        </p>
        <ul className="list-disc list-inside space-y-1 text-body pl-1">
          <li>음식 이름과 대략적인 분량을 적어주세요. (예: 닭가슴살 1팩, 밥 1공기)</li>
          <li>음식 사진이 선명하게 나오도록 재촬영하거나 업로드해 보세요.</li>
          <li>특수문자나 무의미한 자음/모음 나열은 분석되지 않습니다.</li>
        </ul>
      </div>

      <div className="pt-1">
        <Button
          type="button"
          onClick={onRetry}
          className="mx-auto flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          다시 시도하기
        </Button>
      </div>
    </section>
  )
}
