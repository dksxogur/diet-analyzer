'use client'

import React, { useState } from 'react'
import { Copy, Share2, Download, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  copyCardImageToClipboard,
  shareCardImage,
  downloadCardImage,
} from '@/lib/share-handler'

interface ShareActionsProps {
  summaryComment?: string
}

export function ShareActions({ summaryComment }: ShareActionsProps) {
  const [copying, setCopying] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (copying) return
    setCopying(true)
    const success = await copyCardImageToClipboard('nutri-snap-share-card')
    setCopying(false)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleShare = async () => {
    if (sharing) return
    setSharing(true)
    await shareCardImage(
      'nutri-snap-share-card',
      summaryComment || '오늘 나의 식단 분석 결과'
    )
    setSharing(false)
  }

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    await downloadCardImage('nutri-snap-share-card')
    setDownloading(false)
  }

  const isAnyLoading = copying || sharing || downloading

  return (
    <div className="w-full max-w-md mx-auto space-y-3 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Clipboard Copy */}
        <Button
          type="button"
          onClick={handleCopy}
          disabled={isAnyLoading}
          className="h-11 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {copying ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{copied ? '복사 완료!' : '클립보드 복사'}</span>
        </Button>

        {/* 2. Web Share */}
        <Button
          type="button"
          onClick={handleShare}
          disabled={isAnyLoading}
          variant="outline"
          className="h-11 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {sharing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-primary" />
          )}
          <span>SNS/채팅 공유</span>
        </Button>

        {/* 3. Image Download */}
        <Button
          type="button"
          onClick={handleDownload}
          disabled={isAnyLoading}
          variant="outline"
          className="h-11 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-primary" />
          )}
          <span>이미지 저장</span>
        </Button>
      </div>

      <p className="text-center text-[11px] text-label">
        💡 1클릭으로 결과 카드를 복사하거나 다운로드하여 친구나 트레이너와 공유하세요.
      </p>
    </div>
  )
}
