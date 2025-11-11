"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { Loader2 } from "lucide-react"

interface ShippingMethod {
  id: string
  name: string
  cost: number
  enabled: boolean
}

export default function SettingsPage() {
  const { t } = useLocale()
  
  // Store Information
  const [storeName, setStoreName] = useState("")
  const [storeEmail, setStoreEmail] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storeDescription, setStoreDescription] = useState("")

  // Shipping Settings
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingStore, setSavingStore] = useState(false)
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("80")
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([
    { id: "free", name: "Livraison gratuite", cost: 0, enabled: true },
    { id: "standard", name: "Livraison standard", cost: 10, enabled: true },
    { id: "express", name: "Livraison express", cost: 20, enabled: true },
  ])

  // Charger tous les paramètres
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Charger les infos de la boutique
        const storeResponse = await fetch('/api/settings/store')
        const storeData = await storeResponse.json()
        
        if (storeData.success) {
          setStoreName(storeData.data.name)
          setStoreEmail(storeData.data.email)
          setStorePhone(storeData.data.phone)
          setStoreAddress(storeData.data.address)
          setStoreDescription(storeData.data.description || "")
        }

        // Charger les paramètres de livraison
        const shippingResponse = await fetch('/api/settings/shipping')
        const shippingData = await shippingResponse.json()
        
        if (shippingData.success) {
          setFreeShippingEnabled(shippingData.data.freeShippingEnabled)
          setFreeShippingThreshold(shippingData.data.freeShippingThreshold.toString())
          setShippingMethods(shippingData.data.shippingMethods)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
        toast.error("Erreur lors du chargement des paramètres")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSettings()
  }, [])

  const handleSaveStoreInfo = async () => {
    try {
      setSavingStore(true)
      
      const response = await fetch('/api/settings/store', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: storeName,
          email: storeEmail,
          phone: storePhone,
          address: storeAddress,
          description: storeDescription,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Informations de la boutique sauvegardées avec succès")
      } else {
        toast.error("Erreur lors de la sauvegarde")
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSavingStore(false)
    }
  }

  const handleSaveShipping = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/settings/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          freeShippingEnabled,
          freeShippingThreshold: parseFloat(freeShippingThreshold),
          shippingMethods,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Paramètres de livraison sauvegardés avec succès")
      } else {
        toast.error("Erreur lors de la sauvegarde")
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const updateShippingMethod = (id: string, field: 'cost' | 'enabled', value: number | boolean) => {
    setShippingMethods(methods =>
      methods.map(method =>
        method.id === id ? { ...method, [field]: value } : method
      )
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="heading-responsive-h1">{t.admin.settings}</h1>
        <p className="text-responsive-sm text-muted-foreground">{t.admin.manageStoreSettings}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.admin.storeInformation}</CardTitle>
          </CardHeader>
          <CardContent className="card-responsive space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">{t.admin.storeName}</Label>
              <Input 
                id="storeName" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">{t.admin.storeEmail}</Label>
              <Input 
                id="storeEmail" 
                type="email" 
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone">{t.admin.storePhone}</Label>
              <Input 
                id="storePhone" 
                type="tel" 
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddress">{t.admin.storeAddress}</Label>
              <Textarea 
                id="storeAddress" 
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Description de la boutique</Label>
              <Textarea 
                id="storeDescription" 
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Décrivez votre boutique..."
                rows={4}
              />
            </div>
            <Button onClick={handleSaveStoreInfo} disabled={savingStore}>
              {savingStore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.admin.saveChanges}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.admin.shippingSettings}</CardTitle>
            <CardDescription>
              Configurez les options de livraison et les tarifs
            </CardDescription>
          </CardHeader>
          <CardContent className="card-responsive space-y-4 sm:space-y-6">
            {/* Livraison gratuite */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="freeShippingEnabled" className="text-base font-semibold">
                    Activer la livraison gratuite
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Offrir la livraison gratuite à partir d&apos;un certain montant
                  </p>
                </div>
                <Switch
                  id="freeShippingEnabled"
                  checked={freeShippingEnabled}
                  onCheckedChange={setFreeShippingEnabled}
                />
              </div>
              
              {freeShippingEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary">
                  <Label htmlFor="freeShipping">
                    Montant minimum pour livraison gratuite (FCFA)
                  </Label>
                  <Input 
                    id="freeShipping" 
                    type="number" 
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    placeholder="80000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Les commandes supérieures à ce montant bénéficieront de la livraison gratuite
                  </p>
                </div>
              )}
            </div>

            {/* Méthodes de livraison */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Méthodes de livraison</Label>
              
              {shippingMethods.map((method) => (
                <div key={method.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={(checked) => updateShippingMethod(method.id, 'enabled', checked)}
                  />
                  
                  <div className="flex-1">
                    <Label className="font-medium">{method.name}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`cost-${method.id}`} className="text-sm">
                      Prix:
                    </Label>
                    <Input
                      id={`cost-${method.id}`}
                      type="number"
                      value={method.cost}
                      onChange={(e) => updateShippingMethod(method.id, 'cost', parseFloat(e.target.value) || 0)}
                      className="w-32"
                      disabled={!method.enabled}
                    />
                    <span className="text-sm text-muted-foreground">FCFA</span>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSaveShipping} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.admin.saveChanges}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
