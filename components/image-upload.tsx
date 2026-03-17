'use client'

import { useCallback, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImageSelect: (imageData: string, mediaType: string) => void
  disabled?: boolean
}

export function ImageUpload({ onImageSelect, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      // Extract base64 data without the data URL prefix
      const base64Data = result.split(',')[1]
      onImageSelect(base64Data, file.type)
    }
    reader.readAsDataURL(file)
  }, [onImageSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }, [processFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }, [processFile])

  const clearImage = useCallback(() => {
    setPreview(null)
  }, [])

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-primary/20">
        <img 
          src={preview} 
          alt="Yemek önizlemesi" 
          className="w-full h-64 object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3"
          onClick={clearImage}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 p-8 rounded-xl border-2 border-dashed transition-colors',
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
        disabled && 'opacity-50 pointer-events-none'
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <Camera className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          Yemek fotoğrafınızı buraya bırakın
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          veya göz atmak için tıklayın
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <label className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Resim Yükle
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
              disabled={disabled}
            />
          </label>
        </Button>
        <Button variant="outline" asChild>
          <label className="cursor-pointer">
            <Camera className="w-4 h-4 mr-2" />
            Fotoğraf Çek
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileInput}
              disabled={disabled}
            />
          </label>
        </Button>
      </div>
    </div>
  )
}
