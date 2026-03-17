'use client'

import { useState, useCallback } from 'react'
import { ImageUpload } from './image-upload'
import { AnalysisResult } from './analysis-result'
import { AnalysisSkeleton } from './analysis-skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import type { FoodAnalysis } from '@/lib/types'

type AnalysisState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: FoodAnalysis }
  | { status: 'error'; message: string }

export function FoodAnalyzer() {
  const [imageData, setImageData] = useState<{ base64: string; mediaType: string } | null>(null)
  const [analysisState, setAnalysisState] = useState<AnalysisState>({ status: 'idle' })

  const handleImageSelect = useCallback((base64: string, mediaType: string) => {
    setImageData({ base64, mediaType })
    setAnalysisState({ status: 'idle' })
  }, [])

  const analyzeFood = async () => {
    if (!imageData) return

    setAnalysisState({ status: 'loading' })

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData.base64,
          mediaType: imageData.mediaType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Resim analiz edilemedi')
      }

      setAnalysisState({ status: 'success', data: data.analysis })
    } catch (error) {
      setAnalysisState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Bir hata olustu. Lutfen tekrar deneyin.'
      })
    }
  }

  const reset = () => {
    setImageData(null)
    setAnalysisState({ status: 'idle' })
  }

  return (
    <div className="space-y-6">
      <ImageUpload 
        onImageSelect={handleImageSelect}
        disabled={analysisState.status === 'loading'}
      />

      {imageData && analysisState.status !== 'success' && (
        <div className="flex gap-3">
          <Button 
            onClick={analyzeFood} 
            disabled={analysisState.status === 'loading'}
            className="flex-1"
            size="lg"
          >
            {analysisState.status === 'loading' ? (
              <>
                <span className="animate-pulse">Analiz ediliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Yemeği Analiz Et
              </>
            )}
          </Button>
          {analysisState.status !== 'loading' && (
            <Button variant="outline" size="lg" onClick={reset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {analysisState.status === 'loading' && <AnalysisSkeleton />}

      {analysisState.status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analiz Basarisiz</AlertTitle>
          <AlertDescription>
            {analysisState.message}
          </AlertDescription>
        </Alert>
      )}

      {analysisState.status === 'success' && (
        <>
          <AnalysisResult analysis={analysisState.data} />
          <Button variant="outline" onClick={reset} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Baska Bir Yemegi Analiz Et
          </Button>
        </>
      )}
    </div>
  )
}
