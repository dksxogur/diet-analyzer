'use client'

import React from 'react'
import { AlertCircle, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RetryModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  errorMessage?: string
}

export function RetryModal({
  isOpen,
  onClose,
  onRetry,
  errorMessage = '네트워크 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.',
}: RetryModalProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retry-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl shadow-black/90 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 id="retry-modal-title" className="text-lg font-bold text-white">
            분석 요청 실패
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{errorMessage}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-11 rounded-2xl border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            닫기
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose()
              onRetry()
            }}
            className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 시도하기
          </Button>
        </div>
      </div>
    </div>
  )
}
