/**
 * Nutrition & TDEE Calculator Utility
 * Based on Mifflin-St Jeor formula and standard nutritional macro splits.
 */

export type GoalType = 'diet' | 'bulk' | 'health'

export interface UserBodyInfo {
  height: number // cm
  weight: number // kg
  goal: GoalType
  age?: number
  gender?: 'male' | 'female' | 'unspecified'
}

export interface RecommendedNutrition {
  bmr: number
  tdee: number
  targetCalories: number
  targetCarbs: number // grams
  targetProtein: number // grams
  targetFat: number // grams
  macroRatio: {
    carbs: number // percentage (e.g. 45)
    protein: number // percentage (e.g. 30)
    fat: number // percentage (e.g. 25)
  }
}

/**
 * Calculates BMR, TDEE and target macronutrients based on user's height, weight, and goal.
 */
export function calculateNutritionTargets(info: UserBodyInfo): RecommendedNutrition {
  const height = Math.max(0, info.height)
  const weight = Math.max(0, info.weight)
  const age = info.age ?? 28 // Standard default adult age
  const gender = info.gender ?? 'unspecified'

  // Mifflin-St Jeor Equation
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  } else {
    // Neutral average
    bmr = 10 * weight + 6.25 * height - 5 * age - 78
  }

  // Moderate activity multiplier (1.375 - light/moderate daily activity)
  const tdee = Math.round(bmr * 1.375)

  // Target calories & macronutrient ratios according to goal
  let targetCalories: number
  let carbsRatio: number
  let proteinRatio: number
  let fatRatio: number

  switch (info.goal) {
    case 'diet': // 체중 감량
      targetCalories = Math.max(1200, Math.round(tdee - 500))
      carbsRatio = 45
      proteinRatio = 30
      fatRatio = 25
      break
    case 'bulk': // 근성장
      targetCalories = Math.round(tdee + 400)
      carbsRatio = 50
      proteinRatio = 25
      fatRatio = 25
      break
    case 'health': // 건강 / 유지
    default:
      targetCalories = tdee
      carbsRatio = 50
      proteinRatio = 20
      fatRatio = 30
      break
  }

  // 1g Carbs = 4kcal, 1g Protein = 4kcal, 1g Fat = 9kcal
  const targetCarbs = Math.round((targetCalories * (carbsRatio / 100)) / 4)
  const targetProtein = Math.round((targetCalories * (proteinRatio / 100)) / 4)
  const targetFat = Math.round((targetCalories * (fatRatio / 100)) / 9)

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    targetCarbs,
    targetProtein,
    targetFat,
    macroRatio: {
      carbs: carbsRatio,
      protein: proteinRatio,
      fat: fatRatio,
    },
  }
}
