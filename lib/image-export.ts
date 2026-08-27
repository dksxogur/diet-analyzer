import * as htmlToImage from 'html-to-image'

/**
 * Converts a DOM element (share card) to high-resolution PNG Blob (2x scale for Retina sharpness).
 */
export async function generateCardBlob(elementId: string = 'nutri-snap-share-card'): Promise<Blob> {
  const node = document.getElementById(elementId)
  if (!node) {
    throw new Error('공유 카드 요소를 찾을 수 없습니다.')
  }

  // Small delay to ensure all fonts and rendering are settled
  await new Promise((resolve) => setTimeout(resolve, 150))

  const blob = await htmlToImage.toBlob(node, {
    quality: 0.95,
    pixelRatio: 2, // 2x scale for high crisp retina display
    cacheBust: true,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left',
      margin: '0',
    },
  })

  if (!blob) {
    throw new Error('카드 이미지 생성에 실패했습니다.')
  }

  return blob
}

/**
 * Converts a DOM element to a File object for Web Share API.
 */
export async function generateCardFile(
  elementId: string = 'nutri-snap-share-card',
  fileName?: string
): Promise<File> {
  const blob = await generateCardBlob(elementId)
  const defaultName = fileName || `diet-analysis-${new Date().toISOString().slice(0, 10)}.png`
  return new File([blob], defaultName, { type: 'image/png' })
}

/**
 * Triggers direct browser download for a Blob.
 */
export function downloadBlobAsFile(blob: Blob, filename?: string): void {
  const defaultName = filename || `diet-analysis-${new Date().toISOString().slice(0, 10)}.png`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = defaultName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
