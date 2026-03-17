import { FoodAnalyzer } from '@/components/food-analyzer'
import { Leaf } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">YemekLens</h1>
              <p className="text-xs text-muted-foreground">Yapay Zeka Tarafından Desteklenen Beslenme Analizi</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-balance text-foreground">
            Yemeğinizde Neler Olduğunu Keşfedin
          </h2>
          <p className="text-muted-foreground mt-2 text-pretty">
            Herhangi bir öğünün fotoğrafını yükleyerek anlık beslenme içgörüleri, 
            sağlık puanları ve yapay zeka tarafından desteklenen tarif önerileri alın.
          </p>
        </div>

        <FoodAnalyzer />

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <p className="text-sm font-medium text-foreground">Detaylı Beslenme</p>
            <p className="text-xs text-muted-foreground">Makrolar & vitaminler</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">💚</span>
            </div>
            <p className="text-sm font-medium text-foreground">Sağlık Puanı</p>
            <p className="text-xs text-muted-foreground">1-10 derecelendirmesi</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🍳</span>
            </div>
            <p className="text-sm font-medium text-foreground">Tarif Fikirleri</p>
            <p className="text-xs text-muted-foreground">Pişirme ilhası</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Vercel AI SDK Tarafından Desteklenmektedir</p>
        </div>
      </footer>
    </main>
  )
}
