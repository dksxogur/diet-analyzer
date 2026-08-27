'use client'

import React from 'react'
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react'
import { type AnalysisStep } from '@/lib/ai-client'

interface LoadingOverlayProps {
  status: AnalysisStep
  message?: string
}

export function LoadingOverlay({ status, message }: LoadingOverlayProps) {
  if (status !== 'analyzing' && status !== 'failed' && status !== 'retrying') {
    return null
  }

  const isFailed = status === 'failed'
  const isRetrying = status === 'retrying'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-surface-container border border-outline rounded-xl p-8 max-w-sm w-11/12 mx-auto custom-shadow flex flex-col items-center text-center space-y-5">
        {/* Animated Icon Container */}
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isFailed
                ? 'bg-error/10 border border-error/25 text-error'
                : isRetrying
                ? 'bg-macro-carb/10 border border-macro-carb/25 text-macro-carb'
                : 'bg-primary/10 border border-primary/25 text-primary'
            }`}
          >
            {isFailed ? (
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            ) : isRetrying ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Sparkles className="w-8 h-8 animate-pulse" />
            )}
          </div>

          {/* Pulse ring for analyzing state */}
          {!isFailed && (
            <div className="absolute -inset-1 rounded-xl bg-primary/20 animate-ping pointer-events-none -z-10" />
          )}
        </div>

        {/* Text & Message */}
        <div className="space-y-2">
          <h3
            id="loading-title"
            className={`text-xl font-bold transition-colors ${
              isFailed ? 'text-error' : isRetrying ? 'text-macro-carb' : 'text-navy'
            }`}
          >
            {message || (isFailed ? 'AI 응답 실패' : isRetrying ? 'AI 재분석 중...' : 'AI 분석 중...')}
          </h3>
          <p className="text-xs text-body leading-relaxed">
            {isFailed
              ? '네트워크 응답을 확인하고 1초 후 자동으로 재시도합니다...'
              : isRetrying
              ? '식단 영양 데이터를 정밀 재구성하는 중입니다.'
              : '입력하신 식단 텍스트와 사진의 칼로리·영양 균형을 진단하고 있습니다.'}
          </p>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden border border-outline">
          <div
            className={`h-full transition-all duration-500 ${
              isFailed
                ? 'w-full bg-error'
                : isRetrying
                ? 'w-3/4 bg-macro-carb animate-pulse'
                : 'w-1/2 bg-primary animate-[pulse_1s_ease-in-out_infinite]'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
