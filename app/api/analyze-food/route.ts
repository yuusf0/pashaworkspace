import { generateText, Output } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const foodAnalysisSchema = z.object({
  foodName: z.string().describe('The name of the identified food'),
  confidence: z.number().min(0).max(100).describe('Confidence percentage of the identification'),
  calories: z.number().describe('Estimated calories per serving'),
  servingSize: z.string().describe('The estimated serving size'),
  macronutrients: z.object({
    protein: z.number().describe('Protein in grams'),
    carbohydrates: z.number().describe('Carbohydrates in grams'),
    fat: z.number().describe('Fat in grams'),
    fiber: z.number().describe('Fiber in grams'),
  }),
  micronutrients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      dailyValue: z.number().describe('Percentage of daily value'),
    })
  ).describe('Key vitamins and minerals'),
  healthScore: z.number().min(1).max(10).describe('Health score from 1-10'),
  healthInsights: z.array(z.string()).describe('Health benefits and considerations'),
  suggestedRecipes: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      prepTime: z.string(),
    })
  ).describe('Recipe suggestions using this food'),
})

// Demo data for when AI Gateway is not available
const demoAnalysis = {
  foodName: 'Karışık Salata ve Izgara Tavuk',
  confidence: 92,
  calories: 350,
  servingSize: '1 kase (300g)',
  macronutrients: {
    protein: 32,
    carbohydrates: 18,
    fat: 16,
    fiber: 6,
  },
  micronutrients: [
    { name: 'A Vitamini', amount: '120mcg', dailyValue: 15 },
    { name: 'C Vitamini', amount: '45mg', dailyValue: 50 },
    { name: 'Demir', amount: '2.5mg', dailyValue: 14 },
    { name: 'Kalsiyum', amount: '80mg', dailyValue: 8 },
  ],
  healthScore: 8,
  healthInsights: [
    'Kas bakımı için yüksek oranda yalın protein içeriği',
    'Sindirim sağlığını destekleyen zengin lif içeriği',
    'Zeytinyağı salatası içeren sağlıklı yağlar',
    'Stabil kan şekeri seviyeleri koruyan düşük glikemik indeks',
  ],
  suggestedRecipes: [
    {
      name: 'Akdeniz Tavuk Kasesi',
      description: 'Humus, feta peyniri ve zeytinler ekleyerek Akdeniz tadını yaratın',
      prepTime: '15 dakika',
    },
    {
      name: 'Asya Usulü Salata',
      description: 'Susam-zencefil sosuyla karıştırın ve gevrek wonton şeritleri ekleyin',
      prepTime: '20 dakika',
    },
    {
      name: 'Protein Gücü Wrap',
      description: 'Salatayı tam buğday tortillasına sarın ve avokado sosuyla kaplayın',
      prepTime: '10 dakika',
    },
  ],
}

export async function POST(req: Request) {
  try {
    const { image, mediaType } = await req.json()

    if (!image) {
      return Response.json(
        { error: 'Resim sağlanmadı' },
        { status: 400 }
      )
    }

    const { output } = await generateText({
      model: groq('llama-3.1-70b-versatile'),
      output: Output.object({
        schema: foodAnalysisSchema,
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Bu yemek resmine analiz et ve detaylı beslenme bilgileri sağla. 
              Yemeği tanımla, sunuş başına beslenme içeriğini tahmin et, sağlık önerileri ver, 
              ve bazı tarif önerileri sun. Doğru ol ama tanımlama belirsizse bunu açıkla.
              Eğer bu bir yemek resmi değilse, gördüğüne dayanarak en iyi tahmini yap.`,
            },
            {
              type: 'image',
              image: image,
              mediaType: mediaType || 'image/jpeg',
            },
          ],
        },
      ],
    })

    return Response.json({ analysis: output })
  } catch (error) {
    console.error('[v0] Food analysis error:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[v0] Full error:', JSON.stringify(error, null, 2))
    
    // More user-friendly error messages
    if (errorMessage.includes('API key')) {
      return Response.json(
        { error: 'Groq API anahtarı yapılandırılmamış. Lütfen GROQ_API_KEY ortam değişkenini kontrol edin.' },
        { status: 500 }
      )
    }
    
    return Response.json(
      { error: 'Yemek resmi analiz edilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
