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
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-surface-container border border-outline rounded-xl p-6 sm:p-7 max-w-md w-full custom-shadow space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-lg bg-error/10 border border-error/25 flex items-center justify-center text-error">
            <AlertCircle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-label hover:text-navy hover:bg-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 id="retry-modal-title" className="type-title">
            분석 요청 실패
          </h3>
          <p className="text-sm text-body leading-relaxed">{errorMessage}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-11"
          >
            닫기
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose()
              onRetry()
            }}
            className="w-full h-11 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 시도하기
          </Button>
        </div>
      </div>
    </div>
  )
}
