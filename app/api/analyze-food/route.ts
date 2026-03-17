import { generateText, Output } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const foodAnalysisSchema = z.object({
  foodName: z.string().describe('Tanimlanan yemegin adi (Turkce)'),
  confidence: z.number().min(0).max(100).describe('Tanimlama guven yuzdesi'),
  calories: z.number().describe('Porsiyon basina tahmini kalori'),
  servingSize: z.string().describe('Tahmini porsiyon boyutu'),
  macronutrients: z.object({
    protein: z.number().describe('Gram cinsinden protein'),
    carbohydrates: z.number().describe('Gram cinsinden karbonhidrat'),
    fat: z.number().describe('Gram cinsinden yag'),
    fiber: z.number().describe('Gram cinsinden lif'),
  }),
  micronutrients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      dailyValue: z.number().describe('Gunluk deger yuzdesi'),
    })
  ).describe('Temel vitaminler ve mineraller'),
  healthScore: z.number().min(1).max(10).describe('1-10 arasi saglik puani'),
  healthInsights: z.array(z.string()).describe('Saglik faydalari ve oneriler (Turkce)'),
  suggestedRecipes: z.array(
    z.object({
      name: z.string().describe('Tarif adi (Turkce)'),
      description: z.string().describe('Detayli tarif aciklamasi - malzemeler ve yapilis (Turkce)'),
      prepTime: z.string().describe('Hazirlama suresi'),
      ingredients: z.array(z.string()).describe('Malzeme listesi'),
      steps: z.array(z.string()).describe('Yapilis adimlari'),
    })
  ).describe('Bu yemek icin detayli tarifler'),
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
      model: groq('llama-3.2-90b-vision-preview'),
      output: Output.object({
        schema: foodAnalysisSchema,
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Sen bir profesyonel asci ve beslenme uzmanisin. Bu yemek fotografini dikkatlice analiz et.

GOREVLER:
1. YEMEK TANIMLAMA: Fotograftaki yemegi dogru bir sekilde tanimla. Turk mutfagindan bir yemekse Turkce adini kullan.

2. BESLENME ANALIZI: Porsiyon basina tahmini kalori, makro besinler (protein, karbonhidrat, yag, lif) ve onemli vitaminler/mineraller.

3. SAGLIK PUANI: 1-10 arasi saglik puani ver ve nedenlerini acikla.

4. DETAYLI TARIFLER: Bu yemegin EN AZ 3 farkli tarifini ver. Her tarif icin:
   - Tarif adi
   - Detayli aciklama
   - Tam malzeme listesi (olculeriyle birlikte)
   - Adim adim yapilis talimatlari
   - Hazirlama suresi

Tum yanitlar TURKCE olmali. Gercekci ve dogru bilgiler ver.`,
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
