"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Plus, Trash2, Truck, RotateCcw, Shield, Headphones, Package, CreditCard, Clock, Award, GripVertical } from "lucide-react"
import { useFeatures } from "@/lib/features-context"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const availableIcons = [
  { value: "Truck", label: "Livraison", icon: Truck },
  { value: "RotateCcw", label: "Retours", icon: RotateCcw },
  { value: "Shield", label: "Sécurité", icon: Shield },
  { value: "Headphones", label: "Support", icon: Headphones },
  { value: "Package", label: "Colis", icon: Package },
  { value: "CreditCard", label: "Paiement", icon: CreditCard },
  { value: "Clock", label: "Temps", icon: Clock },
  { value: "Award", label: "Qualité", icon: Award },
]

const availableGradients = [
  { value: "from-blue-500 to-cyan-500", label: "Bleu → Cyan", color: "#3b82f6" },
  { value: "from-purple-500 to-pink-500", label: "Violet → Rose", color: "#a855f7" },
  { value: "from-green-500 to-emerald-500", label: "Vert → Émeraude", color: "#22c55e" },
  { value: "from-orange-500 to-red-500", label: "Orange → Rouge", color: "#f97316" },
  { value: "from-yellow-500 to-amber-500", label: "Jaune → Ambre", color: "#eab308" },
  { value: "from-indigo-500 to-purple-500", label: "Indigo → Violet", color: "#6366f1" },
  { value: "from-teal-500 to-cyan-500", label: "Teal → Cyan", color: "#14b8a6" },
  { value: "from-rose-500 to-pink-500", label: "Rose → Pink", color: "#f43f5e" },
]

interface FeatureItem {
  icon: string
  title: string
  description: string
  gradient: string
}

export default function FeaturesSettingsPage() {
  const { featuresData, updateFeaturesData } = useFeatures()
  
  const [enabled, setEnabled] = useState(true)
  const [features, setFeatures] = useState<FeatureItem[]>([])

  useEffect(() => {
    setEnabled(featuresData.enabled)
    setFeatures(featuresData.features)
  }, [featuresData])

  const handleSave = () => {
    updateFeaturesData({
      enabled,
      features
    })
    toast.success("Paramètres des fonctionnalités sauvegardés")
  }

  const addFeature = () => {
    setFeatures([...features, {
      icon: "Package",
      title: "",
      description: "",
      gradient: "from-blue-500 to-cyan-500"
    }])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const newFeatures = [...features]
    newFeatures[index][field] = value
    setFeatures(newFeatures)
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h1">Fonctionnalités du Site</h1>
          <p className="text-responsive-sm text-muted-foreground">Personnalisez les points forts affichés sur votre site</p>
        </div>
        <Button onClick={handleSave} className="bg-[#F97316] hover:bg-[#EA580C] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          Enregistrer
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="heading-responsive-h4">Configuration des Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4 sm:space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="features-enabled">Activer les fonctionnalités</Label>
              <p className="text-sm text-muted-foreground">Afficher la section des points forts sur la page d&apos;accueil</p>
            </div>
            <Switch
              id="features-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Liste des fonctionnalités ({features.length}/4 recommandé)</Label>
              <Button variant="outline" size="sm" onClick={addFeature}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            
            <div className="space-y-4">
              {features.map((feature, index) => {
                const IconComponent = availableIcons.find(ic => ic.value === feature.icon)?.icon || Package
                return (
                  <div key={index} className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-900 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Fonctionnalité {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Icon */}
                      <div className="space-y-2">
                        <Label>Icône</Label>
                        <Select
                          value={feature.icon}
                          onValueChange={(value) => updateFeature(index, "icon", value)}
                        >
                          <SelectTrigger>
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
                      </div>

                      {/* Gradient */}
                      <div className="space-y-2">
                        <Label>Couleur</Label>
                        <Select
                          value={feature.gradient}
                          onValueChange={(value) => updateFeature(index, "gradient", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableGradients.map((gradient) => (
                              <SelectItem key={gradient.value} value={gradient.value}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded" 
                                    style={{ backgroundColor: gradient.color }}
                                  />
                                  {gradient.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Title */}
                      <div className="space-y-2">
                        <Label>Titre</Label>
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(index, "title", e.target.value)}
                          placeholder="Livraison Gratuite"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={feature.description}
                          onChange={(e) => updateFeature(index, "description", e.target.value)}
                          placeholder="Pour toute commande dès 50 000 FCFA"
                        />
                      </div>
                    </div>

                    {/* Mini Preview */}
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{feature.title || "Titre"}</p>
                        <p className="text-xs text-muted-foreground">{feature.description || "Description"}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Full Preview */}
          <div className="space-y-2">
            <Label>Aperçu complet</Label>
            <div className="p-6 rounded-xl bg-gray-100 dark:bg-gray-800">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => {
                  const IconComponent = availableIcons.find(ic => ic.value === feature.icon)?.icon || Package
                  return (
                    <div key={index} className="bg-white dark:bg-gray-900 p-4 rounded-xl border">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-3`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{feature.title || "Titre"}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description || "Description"}</p>
                    </div>
                  )
                })}
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
