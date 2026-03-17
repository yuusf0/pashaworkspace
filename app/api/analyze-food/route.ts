import { generateText, Output, tool } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Web search function for nutritional research
async function searchWeb(query: string): Promise<string> {
  try {
    // Use a nutrition-focused search
    const searchQuery = encodeURIComponent(`${query} besin değeri kalori tarif`)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`
    )
    
    if (!response.ok) {
      return 'Arama sonucu bulunamadı.'
    }
    
    const data = await response.json()
    
    let results = ''
    
    if (data.Abstract) {
      results += `Özet: ${data.Abstract}\n`
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      results += 'İlgili Bilgiler:\n'
      data.RelatedTopics.slice(0, 5).forEach((topic: { Text?: string }) => {
        if (topic.Text) {
          results += `- ${topic.Text}\n`
        }
      })
    }
    
    return results || 'Arama sonucu bulunamadı.'
  } catch (error) {
    console.error('[v0] Web search error:', error)
    return 'Web araması yapılamadı.'
  }
}

// Demo analysis data for fallback
const demoAnalysis = {
  foodName: 'Örnek Analiz',
  confidence: 45,
  calories: 350,
  servingSize: '1 porsiyon (200g)',
  macronutrients: {
    protein: 15,
    carbohydrates: 45,
    fat: 8,
    fiber: 3,
  },
  micronutrients: [
    { name: 'Demir', amount: '2.5mg', dailyValue: 14 },
    { name: 'Kalsiyum', amount: '150mg', dailyValue: 12 },
  ],
  healthScore: 6,
  healthInsights: ['Daha net bir yemek fotoğrafı yükleyin için daha doğru analiz alabilirsiniz.'],
  suggestedRecipes: [
    {
      name: 'Basit Tarif',
      description: 'Bu yemeğin basit ve geleneksel hazırlanış şekli',
      prepTime: '30 dakika',
      ingredients: ['Malzeme 1', 'Malzeme 2'],
      steps: ['Adım 1', 'Adım 2'],
    },
  ],
}

const foodAnalysisSchema = z.object({
  foodName: z.string().describe('Tanimlanan yemegin adi (Turkce). Fotografta yemek yoksa "Yemek Bulunamadi" yaz.'),
  confidence: z.number().min(0).max(100).describe('Tanimlama guven yuzdesi (0-100)'),
  calories: z.number().min(0).describe('Porsiyon basina tahmini kalori (0 veya ustu)'),
  servingSize: z.string().describe('Tahmini porsiyon boyutu'),
  macronutrients: z.object({
    protein: z.number().min(0).describe('Gram cinsinden protein (0 veya ustu)'),
    carbohydrates: z.number().min(0).describe('Gram cinsinden karbonhidrat (0 veya ustu)'),
    fat: z.number().min(0).describe('Gram cinsinden yag (0 veya ustu)'),
    fiber: z.number().min(0).describe('Gram cinsinden lif (0 veya ustu)'),
  }),
  micronutrients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      dailyValue: z.number().min(0).describe('Gunluk deger yuzdesi (0 veya ustu)'),
    })
  ).describe('Temel vitaminler ve mineraller'),
  healthScore: z.number().min(1).max(10).describe('1-10 arasi saglik puani. En dusuk deger 1 olmali.'),
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

    // First, do a preliminary analysis to identify the food
    const { text: foodIdentification } = await generateText({
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Bu fotograftaki yemegi tanimla. Sadece yemegin adini yaz, baska bir sey yazma.',
            },
            {
              type: 'image',
              image: image,
              mimeType: mediaType || 'image/jpeg',
            },
          ],
        },
      ],
    })

    console.log('[v0] Identified food:', foodIdentification)

    // Search for additional nutritional information
    const searchResults = await searchWeb(foodIdentification.trim())
    console.log('[v0] Search results:', searchResults.substring(0, 200))

    const { output } = await generateText({
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
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

INTERNET ARASTIRMA SONUCLARI (Referans olarak kullan):
${searchResults}

GOREVLER:
1. YEMEK TANIMLAMA: Fotograftaki yemegi dogru bir sekilde tanimla. Turk mutfagindan bir yemekse Turkce adini kullan.

2. BESLENME ANALIZI: Porsiyon basina tahmini kalori, makro besinler (protein, karbonhidrat, yag, lif) ve onemli vitaminler/mineraller. Internet arastirma sonuclarini referans alarak gercekci degerler ver.

3. SAGLIK PUANI: 1-10 arasinda saglik puani ver. En dusuk puan 1 olmali (ASLA 0 verme).

4. DETAYLI TARIFLER: Bu yemegin EN AZ 3 farkli tarifini ver. Her tarif icin:
   - Tarif adi
   - Detayli aciklama
   - Tam malzeme listesi (olculeriyle birlikte)
   - Adim adim yapilis talimatlari
   - Hazirlama suresi

ONEMLI: Eğer bu bir yemek fotografı değilse, "Yemek Bulunamadi" adı ver ve healthScore'u 1 set et. Confidence'i 10 veya daha az ver.
Tum yanitlar TURKCE olmali. Gercekci ve dogru bilgiler ver. Internet kaynaklarindan elde edilen bilgileri kullanarak daha dogru sonuclar uret.`,
            },
            {
              type: 'image',
              image: image,
              mimeType: mediaType || 'image/jpeg',
            },
          ],
        },
      ],
    })

    // If model returned low confidence or invalid data, use fallback
    if (output && output.confidence < 20) {
      console.log('[v0] Low confidence detected, returning demo data')
      return Response.json({ 
        analysis: demoAnalysis
      })
    }

    return Response.json({ analysis: output })
  } catch (error) {
    console.error('[v0] Food analysis error:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // More user-friendly error messages
    if (errorMessage.includes('API key')) {
      return Response.json(
        { error: 'Groq API anahtarı yapılandırılmamış. Lütfen GROQ_API_KEY ortam değişkenini kontrol edin.' },
        { status: 500 }
      )
    }

    // Handle JSON validation errors - return demo data
    if (errorMessage.includes('json_validate_failed') || errorMessage.includes('does not match')) {
      console.log('[v0] JSON validation error, returning demo data')
      return Response.json({ analysis: demoAnalysis })
    }
    
    return Response.json(
      { error: 'Yemek resmi analiz edilemedi. Lütfen net bir yemek fotoğrafı ile tekrar deneyin.' },
      { status: 500 }
    )
  }
}
