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
        const prompt = `당신은 최고 수준의 전문 임상영양사 및 스포츠 영양 코치 AI입니다. 사용자의 식단(텍스트 및/또는 사진)을 분석하여 정확하고 과학적인 영양 성분을 JSON 형식으로만 응답해주세요.

사용자 신체 및 목표 정보:
- 신체 스펙: 키 ${height}cm, 체중 ${weight}kg
- 식단 목표: ${goal === 'diet' ? '체중 감량 다이어트 (-500kcal 적자 목표)' : goal === 'bulk' ? '근성장 벌크업 (+400kcal 잉여 목표)' : '건강 유지 및 웰빙'}
- 일일 권장 목표 칼로리: ${recommended?.targetCalories || '미정'} kcal (탄수화물: ${recommended?.targetCarbs || '미정'}g, 단백질: ${recommended?.targetProtein || '미정'}g, 지방: ${recommended?.targetFat || '미정'}g)

식단 입력 텍스트:
"${text}"

[분석 및 평가 지침]
1. 첨부된 사진과 텍스트를 종합하여 모든 음식 항목을 식별하고, 현실적인 한국인 1인분 분량 기준으로 칼로리 및 탄·단·지(g)를 계산하세요.
2. 만약 입력된 텍스트나 사진이 음식이 아니거나(예: 무의미한 자음/모음, 동물, 영수증, 풍경 등) 분석이 불가능한 경우 "isFood": false 로 반환하세요.
3. 사용자의 목표(${goal})와 일일 권장량에 맞춘 따뜻하고 전문적인 1줄 종합 피드백(summaryComment)을 작성하세요.
4. 과다하거나 부족한 영양소에 대해 ⚠️(주의) 또는 💡(칭찬/권장) 이모지가 포함된 간결한 주의사항(warnings)을 1~2개 제공하세요.

반드시 다음 JSON 스키마를 엄격히 준수하여 순수 JSON으로만 응답하세요:
{
  "isFood": boolean,
  "totalCalories": number,
  "carbs": number,
  "protein": number,
  "fat": number,
  "summaryComment": "목적에 맞춘 전문적인 1줄 종합 평가",
  "warnings": ["⚠️ 또는 💡로 시작하는 영양소 과다/부족 주의사항"],
  "items": [
    { "name": "음식명 (분량)", "calories": number, "carbs": number, "protein": number, "fat": number }
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

        // Try primary and fallback Gemini models with both query and header auth
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']
        let geminiParsed: any = null

        for (const model of models) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': apiKey,
                },
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
                if (parsed.isFood === false) {
                  return NextResponse.json(
                    { error: '식단 입력값을 분석할 수 없습니다. 입력값(텍스트/사진)을 재점검해 주세요.' },
                    { status: 422 }
                  )
                }
                if (validateDietResult(parsed)) {
                  geminiParsed = parsed
                  break
                }
              }
            }
          } catch (modelErr) {
            console.warn(`Model ${model} attempt failed:`, modelErr)
          }
        }

        if (geminiParsed) {
          return NextResponse.json({ result: geminiParsed })
        }
      } catch (geminiError) {
        console.warn('Gemini API pipeline failed, falling back to smart nutritional engine:', geminiError)
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
