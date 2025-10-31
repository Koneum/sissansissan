"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Languages, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface TranslationFieldProps {
  label: string
  name: string
  type?: "input" | "textarea"
  value: {
    fr: string
    en: string
    ar: string
  }
  onChange: (value: { fr: string; en: string; ar: string }) => void
  required?: boolean
  placeholder?: string
  rows?: number
}

export function TranslationField({
  label,
  name,
  type = "input",
  value,
  onChange,
  required = false,
  placeholder,
  rows = 4
}: TranslationFieldProps) {
  const [translating, setTranslating] = useState(false)

  const handleAutoTranslate = async () => {
    if (!value.fr || value.fr.trim() === '') {
      toast.error("Entrez d'abord le texte en français")
      return
    }

    setTranslating(true)
    try {
      // Traduire en anglais
      const enResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value.fr,
          targetLang: 'en',
          sourceLang: 'fr'
        })
      })

      // Traduire en arabe
      const arResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value.fr,
          targetLang: 'ar',
          sourceLang: 'fr'
        })
      })

      if (enResponse.ok && arResponse.ok) {
        const enData = await enResponse.json()
        const arData = await arResponse.json()

        onChange({
          ...value,
          en: enData.data,
          ar: arData.data
        })

        toast.success("Traductions générées avec succès ! ✨")
      } else {
        throw new Error("Translation failed")
      }
    } catch (error) {
      console.error("Translation error:", error)
      toast.error("Échec de la traduction. Vérifiez votre configuration.")
    } finally {
      setTranslating(false)
    }
  }

  const handleChange = (lang: 'fr' | 'en' | 'ar', newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue
    })
  }

  const InputComponent = type === "textarea" ? Textarea : Input

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoTranslate}
          disabled={translating || !value.fr}
          className="gap-2"
        >
          {translating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traduction...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Traduire auto
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="fr" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fr" className="gap-2">
            <Languages className="w-4 h-4" />
            Français
          </TabsTrigger>
          <TabsTrigger value="en" className="gap-2">
            <Languages className="w-4 h-4" />
            English
          </TabsTrigger>
          <TabsTrigger value="ar" className="gap-2">
            <Languages className="w-4 h-4" />
            العربية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fr" className="mt-3">
          <InputComponent
            name={`${name}.fr`}
            value={value.fr}
            onChange={(e) => handleChange('fr', e.target.value)}
            placeholder={placeholder || `${label} en français`}
            required={required}
            rows={type === "textarea" ? rows : undefined}
          />
        </TabsContent>

        <TabsContent value="en" className="mt-3">
          <InputComponent
            name={`${name}.en`}
            value={value.en}
            onChange={(e) => handleChange('en', e.target.value)}
            placeholder={placeholder || `${label} in English`}
            rows={type === "textarea" ? rows : undefined}
            dir="ltr"
          />
        </TabsContent>

        <TabsContent value="ar" className="mt-3">
          <InputComponent
            name={`${name}.ar`}
            value={value.ar}
            onChange={(e) => handleChange('ar', e.target.value)}
            placeholder={placeholder || `${label} بالعربية`}
            rows={type === "textarea" ? rows : undefined}
            dir="rtl"
            className="text-right"
          />
        </TabsContent>
      </Tabs>

      {translating && (
        <p className="text-sm text-muted-foreground animate-pulse">
          ✨ Traduction en cours avec l'IA...
        </p>
      )}
    </div>
  )
}




