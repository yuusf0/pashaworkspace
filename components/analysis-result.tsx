'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Leaf, Clock, Sparkles, Heart, Utensils } from 'lucide-react'
import type { FoodAnalysis } from '@/lib/types'

interface AnalysisResultProps {
  analysis: FoodAnalysis
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const { macronutrients } = analysis
  const totalMacros = macronutrients.protein + macronutrients.carbohydrates + macronutrients.fat

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-balance">{analysis.foodName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Porsiyon: {analysis.servingSize}
              </p>
            </div>
            <Badge variant={analysis.confidence >= 80 ? 'default' : 'secondary'}>
              {analysis.confidence}% güvenli
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.calories}</p>
                <p className="text-xs text-muted-foreground">kalori</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-emerald-500/10">
                <Heart className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysis.healthScore}/10</p>
                <p className="text-xs text-muted-foreground">sağlık puanı</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macronutrients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="w-5 h-5 text-primary" />
            Makro Besinler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MacroBar
            label="Protein"
            value={macronutrients.protein}
            total={totalMacros}
            color="bg-blue-500"
            unit="g"
          />
          <MacroBar
            label="Karbonhidrat"
            value={macronutrients.carbohydrates}
            total={totalMacros}
            color="bg-amber-500"
            unit="g"
          />
          <MacroBar
            label="Yağ"
            value={macronutrients.fat}
            total={totalMacros}
            color="bg-rose-500"
            unit="g"
          />
          <MacroBar
            label="Lif"
            value={macronutrients.fiber}
            total={Math.max(macronutrients.fiber * 4, 30)}
            color="bg-emerald-500"
            unit="g"
          />
        </CardContent>
      </Card>

      {/* Micronutrients */}
      {analysis.micronutrients.length > 0 && (
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Temel Vitaminler & Mineraller
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {analysis.micronutrients.map((nutrient, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{nutrient.name}</p>
                    <p className="text-xs text-muted-foreground">{nutrient.amount}</p>
                  </div>
                  <Badge variant="outline">{nutrient.dailyValue}% GD</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Leaf className="w-5 h-5 text-primary" />
            Sağlık İçgörüleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.healthInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 mt-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recipe Suggestions */}
      {analysis.suggestedRecipes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Utensils className="w-5 h-5 text-primary" />
              Tarif Fikirleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.suggestedRecipes.map((recipe, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{recipe.name}</h4>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.prepTime}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MacroBar({ 
  label, 
  value, 
  total, 
  color, 
  unit 
}: { 
  label: string
  value: number
  total: number
  color: string
  unit: string
}) {
  const percentage = Math.round((value / total) * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}{unit}</span>
      </div>
      <Progress value={percentage} className={`h-2 [&>[data-slot=indicator]]:${color}`} />
    </div>
  )
}
