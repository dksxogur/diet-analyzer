import { Analytics } from '@vercel/analytics/next'
import { Plus_Jakarta_Sans, Noto_Sans_KR } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

// Latin UI type (design.md §3). Hangul falls through to Noto Sans KR via --font-sans.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nutri Snap | 1분 식단 칼로리 & 영양 균형 추정기',
  description: '로그인 없이 키, 몸무게, 목적과 식단을 입력하여 일일 권장량 대비 영양 균형을 즉시 분석하고 1클릭으로 카드를 공유하세요.',
  keywords: ['식단분석', '칼로리계산기', '탄단지비율', '다이어트', '벌크업', 'NutriSnap', '영양균형'],
  authors: [{ name: 'Nutri Snap Team' }],
  openGraph: {
    title: 'Nutri Snap | 1분 식단 칼로리 & 영양 균형 추정기',
    description: '신체 정보와 오늘 먹은 음식을 입력하면 권장 칼로리 대비 영양 밸런스를 즉시 분석합니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Nutri Snap',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nutri Snap | 1분 식단 칼로리 & 영양 균형 추정기',
    description: '신체 정보와 오늘 먹은 음식을 입력하면 권장 칼로리 대비 영양 밸런스를 즉시 분석합니다.',
  },
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8f9ff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body
        className={`${plusJakarta.variable} ${notoSansKr.variable} antialiased font-sans`}
      >
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
