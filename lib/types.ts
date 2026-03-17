export interface FoodAnalysis {
  foodName: string
  confidence: number
  calories: number
  servingSize: string
  macronutrients: {
    protein: number
    carbohydrates: number
    fat: number
    fiber: number
  }
  micronutrients: Array<{
    name: string
    amount: string
    dailyValue: number
  }>
  healthScore: number
  healthInsights: string[]
  suggestedRecipes: Array<{
    name: string
    description: string
    prepTime: string
  }>
}
