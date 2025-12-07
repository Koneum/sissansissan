"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Save, Plus, Trash2, Mail, Gift, Bell, Sparkles, Send } from "lucide-react"
import { useNewsletter } from "@/lib/newsletter-context"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const availableIcons = [
  { value: "Gift", label: "Cadeau", icon: Gift },
  { value: "Bell", label: "Cloche", icon: Bell },
  { value: "Sparkles", label: "Étoiles", icon: Sparkles },
  { value: "Mail", label: "Email", icon: Mail },
  { value: "Send", label: "Envoyer", icon: Send },
]

export default function NewsletterSettingsPage() {
  const { newsletterData, updateNewsletterData } = useNewsletter()
  
  const [enabled, setEnabled] = useState(true)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [benefits, setBenefits] = useState<{ icon: string; text: string }[]>([])

  useEffect(() => {
    setEnabled(newsletterData.enabled)
    setTitle(newsletterData.title)
    setSubtitle(newsletterData.subtitle)
    setButtonText(newsletterData.buttonText)
    setBenefits(newsletterData.benefits)
  }, [newsletterData])

  const handleSave = () => {
    updateNewsletterData({
      ...newsletterData,
      enabled,
      title,
      subtitle,
      buttonText,
      benefits
    })
    toast.success("Paramètres newsletter sauvegardés")
  }

  const addBenefit = () => {
    setBenefits([...benefits, { icon: "Gift", text: "" }])
  }

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  const updateBenefit = (index: number, field: "icon" | "text", value: string) => {
    const newBenefits = [...benefits]
    newBenefits[index][field] = value
    setBenefits(newBenefits)
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h1">Paramètres Newsletter</h1>
          <p className="text-responsive-sm text-muted-foreground">Personnalisez la section newsletter de votre site</p>
        </div>
        <Button onClick={handleSave} className="bg-[#F97316] hover:bg-[#EA580C] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          Enregistrer
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="heading-responsive-h4">Configuration Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4 sm:space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter-enabled">Activer la newsletter</Label>
              <p className="text-sm text-muted-foreground">Afficher la section newsletter sur la page d&apos;accueil</p>
            </div>
            <Switch
              id="newsletter-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="newsletter-title">Titre</Label>
            <Input
              id="newsletter-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Restez connecté aux tendances"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="newsletter-subtitle">Sous-titre</Label>
            <Textarea
              id="newsletter-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Inscrivez-vous pour recevoir nos offres exclusives..."
              rows={2}
            />
          </div>

          {/* Button Text */}
          <div className="space-y-2">
            <Label htmlFor="newsletter-button">Texte du bouton</Label>
            <Input
              id="newsletter-button"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="S'inscrire maintenant"
            />
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Avantages affichés</Label>
              <Button variant="outline" size="sm" onClick={addBenefit}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <Select
                    value={benefit.icon}
                    onValueChange={(value) => updateBenefit(index, "icon", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <icon.icon className="w-4 h-4" />
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={benefit.text}
                    onChange={(e) => updateBenefit(index, "text", e.target.value)}
                    placeholder="Texte de l'avantage"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBenefit(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Aperçu</Label>
            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{title || "Titre de la newsletter"}</h3>
                <p className="text-white/70 mb-4">{subtitle || "Sous-titre de la newsletter"}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {benefits.map((b, i) => {
                    const IconComponent = availableIcons.find(ic => ic.value === b.icon)?.icon || Gift
                    return (
                      <span key={i} className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                        <IconComponent className="w-3 h-3" />
                        {b.text || "Avantage"}
                      </span>
                    )
                  })}
                </div>
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500">
                  {buttonText || "S'inscrire"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#F97316] hover:bg-[#EA580C] w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  )
}
