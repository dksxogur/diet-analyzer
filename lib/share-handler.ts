import { generateCardBlob, generateCardFile, downloadBlobAsFile } from './image-export'
import { toast } from 'sonner'

/**
 * 1-Click Clipboard Image Copy (PRD 4.3)
 */
export async function copyCardImageToClipboard(
  elementId: string = 'nutri-snap-share-card'
): Promise<boolean> {
  try {
    const blob = await generateCardBlob(elementId)

    if (!navigator.clipboard || !window.ClipboardItem) {
      // Fallback if clipboard API is not available
      toast.info('클립보드 이미지 복사를 지원하지 않는 브라우저입니다. 이미지를 다운로드합니다.')
      downloadBlobAsFile(blob)
      return true
    }

    const clipboardItem = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([clipboardItem])

    toast.success('결과 카드 이미지가 클립보드에 복사되었습니다!', {
      description: '카카오톡, 인스타그램, 메시지에 바로 붙여넣기(Ctrl+V)하세요.',
      duration: 3500,
    })
    return true
  } catch (error) {
    console.error('Clipboard copy error:', error)
    // Fallback: auto download if copy is blocked by permission
    try {
      const blob = await generateCardBlob(elementId)
      toast.info('클립보드 접근 권한으로 인해 이미지를 파일로 저장합니다.')
      downloadBlobAsFile(blob)
    } catch {
      toast.error('이미지 복사에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    }
    return false
  }
}

/**
 * 1-Click Web Share API & Unsupported Fallback (PRD 4.3 & 5.6)
 */
export async function shareCardImage(
  elementId: string = 'nutri-snap-share-card',
  summaryText: string = 'NutriSnap 1분 식단 분석 결과'
): Promise<boolean> {
  try {
    const file = await generateCardFile(elementId)

    // Check Web Share API & file sharing support
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'NutriSnap 식단 영양 균형 분석 결과',
        text: `${summaryText}\n\n#식단분석 #영양관리 #NutriSnap`,
        files: [file],
      })
      toast.success('성공적으로 공유되었습니다!')
      return true
    } else {
      // PRD 5.6 Fallback for unsupported browsers
      toast.info('이 브라우저에서는 시스템 공유 기능을 지원하지 않습니다. 이미지를 직접 저장합니다.', {
        duration: 4000,
      })
      downloadBlobAsFile(file)
      return true
    }
  } catch (error: any) {
    // User aborted share sheet or permission error
    if (error?.name === 'AbortError') {
      return false
    }

    console.warn('Web Share failed, fallback to download:', error)
    try {
      const blob = await generateCardBlob(elementId)
      toast.info('이 브라우저에서는 시스템 공유 기능을 지원하지 않습니다. 이미지를 직접 저장합니다.')
      downloadBlobAsFile(blob)
      return true
    } catch {
      toast.error('공유 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      return false
    }
  }
}

/**
 * 1-Click Direct Image Download
 */
export async function downloadCardImage(
  elementId: string = 'nutri-snap-share-card'
): Promise<boolean> {
  try {
    const blob = await generateCardBlob(elementId)
    const dateStr = new Date().toISOString().slice(0, 10)
    downloadBlobAsFile(blob, `diet-analysis-${dateStr}.png`)
    toast.success('결과 카드 이미지가 저장되었습니다!')
    return true
  } catch (error) {
    console.error('Download error:', error)
    toast.error('이미지 저장에 실패했습니다.')
    return false
  }
}
