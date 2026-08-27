import { NextRequest, NextResponse } from 'next/server'
import { estimateNutritionFromInput, validateDietResult } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { height, weight, goal, dietText, imageBase64, recommended } = body

    if ((!dietText || dietText.trim().length === 0) && !imageBase64) {
      return NextResponse.json(
        { error: '음식 텍스트 또는 사진이 제공되지 않았습니다.' },
        { status: 400 }
      )
    }

    const hasImage = Boolean(imageBase64)
    const text = dietText || ''

    // Gemini API integration if API Key exists
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (apiKey) {
      try {
        const prompt = `당신은 전문 임상영양사 AI입니다. 사용자의 식단(텍스트 또는 사진)을 분석하여 정확한 영양 성분을 JSON 형식으로만 응답해주세요.

사용자 정보:
- 키: ${height}cm, 몸무게: ${weight}kg, 식단 목적: ${goal}
- 일일 목표 칼로리: ${recommended?.targetCalories || '미정'} kcal (탄수화물: ${recommended?.targetCarbs || '미정'}g, 단백질: ${recommended?.targetProtein || '미정'}g, 지방: ${recommended?.targetFat || '미정'}g)

식단 내용:
"${text}"

반드시 다음 JSON 형식에 정확히 맞춰서 코드블록 마크다운 없이 순수 JSON만 응답하세요:
{
  "totalCalories": number,
  "carbs": number,
  "protein": number,
  "fat": number,
  "summaryComment": "목적에 맞춘 격려와 조언이 담긴 1줄 종합 평가",
  "warnings": ["⚠️ 또는 💡로 시작하는 영양소 과다/부족 주의사항 리스트"],
  "items": [
    { "name": "음식명", "calories": number, "carbs": number, "protein": number, "fat": number }
  ]
}`

        const contents: any[] = []
        if (hasImage && typeof imageBase64 === 'string') {
          const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
          const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/)
          const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'

          contents.push({
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          })
        } else {
          contents.push({
            parts: [{ text: prompt }],
          })
        }

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          if (rawText) {
            const parsed = JSON.parse(rawText)
            if (validateDietResult(parsed)) {
              return NextResponse.json({ result: parsed })
            }
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart nutritional engine:', geminiError)
      }
    }

    // Fallback: Built-in Intelligent Korean Nutritional Engine
    const result = estimateNutritionFromInput(text, hasImage, recommended, goal)

    if (!validateDietResult(result)) {
      return NextResponse.json(
        { error: '식단 입력값을 분석할 수 없습니다. 입력값(텍스트/사진)을 재점검해 주세요.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ result })
  } catch (error: any) {
    if (error?.message === 'INVALID_DIET_DATA') {
      return NextResponse.json(
        { error: '식단 입력값을 분석할 수 없습니다. 입력값(텍스트/사진)을 재점검해 주세요.' },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
