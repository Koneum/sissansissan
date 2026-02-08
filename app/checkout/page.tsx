"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronDown, CreditCard, DollarSign, Lock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { formatPrice } from "@/lib/currency"

interface ShippingMethod {
  id: string
  name: string
  cost: number
  enabled: boolean
}

interface ShippingSettings {
  freeShippingEnabled: boolean
  freeShippingThreshold: number
  shippingMethods: ShippingMethod[]
}

const GUEST_CART_LIMIT = 20000 // Limite du panier pour les guests en XOF

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash") // Default to cash on delivery
  const [showShippingAddress, setShowShippingAddress] = useState(false)
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null)
  
  const isGuest = !user
  const isOverGuestLimit = isGuest && total >= GUEST_CART_LIMIT

  // Rediriger vers le panier si panier vide (éviter router.push pendant le render)
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  // Rediriger les guests qui dépassent la limite vers la connexion
  useEffect(() => {
    if (isOverGuestLimit) {
      router.push('/signin?redirect=/checkout&reason=cart_limit')
    }
  }, [isOverGuestLimit, router])

  // Charger les paramètres de livraison
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const response = await fetch('/api/settings/shipping')
        const data = await response.json()
        
        if (data.success) {
          setShippingSettings(data.data)
          // Sélectionner la première méthode activée par défaut
          const firstEnabled = data.data.shippingMethods.find((m: ShippingMethod) => m.enabled)
          if (firstEnabled) {
            setShippingMethod(firstEnabled.id)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres de livraison:', error)
      }
    }
    
    fetchShippingSettings()
  }, [])

  // Calculer le coût de livraison
  const getShippingCost = () => {
    if (!shippingSettings) return 0
    
    // Vérifier si livraison gratuite applicable
    if (shippingSettings.freeShippingEnabled && total >= shippingSettings.freeShippingThreshold) {
      return 0
    }
    
    // Trouver la méthode sélectionnée
    const selectedMethod = shippingSettings.shippingMethods.find(m => m.id === shippingMethod)
    return selectedMethod ? selectedMethod.cost : 0
  }

  const shippingCost = getShippingCost()
  const finalTotal = total + shippingCost
  const isFreeShippingApplied = shippingSettings?.freeShippingEnabled && total >= shippingSettings.freeShippingThreshold

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const orderData = {
        // Customer info (no account required)
        customer: {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
        },
        // Billing address
        billingAddress: {
          company: formData.get('company'),
          country: formData.get('region'),
          address: formData.get('street'),
          city: formData.get('city'),
          district: formData.get('district'),
        },
        // Shipping address (if different)
        shippingAddress: showShippingAddress ? {
          address: formData.get('shippingAddress'),
          city: formData.get('shippingCity'),
          district: formData.get('shippingDistrict'),
        } : null,
        // Order details
        items,
        subtotal: total,
        shippingCost,
        total: finalTotal,
        shippingMethod,
        paymentMethod,
        // User ID if logged in (optional)
        userId: user?.id || null,
      }

      // For cash on delivery, create order in database
      if (paymentMethod === 'cash') {
        // Créer la commande en base de données
        const createOrderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: orderData.customer,
            billingAddress: orderData.billingAddress,
            shippingAddress: orderData.shippingAddress,
            items: orderData.items,
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            total: orderData.total,
            shippingMethod: orderData.shippingMethod,
            paymentMethod: orderData.paymentMethod,
            userId: orderData.userId,
          }),
        })
        
        const createOrderData = await createOrderResponse.json()
        console.log('Réponse création commande (cash):', createOrderData)
        
        if (!createOrderResponse.ok) {
          throw new Error(createOrderData.error || 'Erreur lors de la création de la commande')
        }
        
        // Sauvegarder aussi dans localStorage pour suivi
      const orders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
      orders.push({
        ...orderData,
        id: createOrderData.orderId || `ORDER-${Date.now()}`,  // <-- Corriger ici
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem('guest_orders', JSON.stringify(orders))
        
        clearCart()
        router.push("/order-success")
      } else if (paymentMethod === 'orangemoney') {
        // Intégration VitePay pour Orange Money
        const email = (formData.get('email') as string) || 'client@sissan-sissan.net' // Email par défaut si non fourni
        const phone = formData.get('phone') as string
        
        console.log('Données de paiement Orange Money:', { email, phone })
        
        // Créer la commande en base de données d'abord
        const createOrderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: orderData.customer,
            billingAddress: orderData.billingAddress,
            shippingAddress: orderData.shippingAddress,
            items: orderData.items,
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            total: orderData.total,
            shippingMethod: orderData.shippingMethod,
            paymentMethod: orderData.paymentMethod,
            userId: orderData.userId,
          }),
        })
        
        const createOrderData = await createOrderResponse.json()
        console.log('Réponse création commande:', createOrderData)
        
        if (!createOrderResponse.ok) {
          throw new Error(createOrderData.error || 'Erreur lors de la création de la commande')
        }
        
        const orderId = createOrderData.orderId
        
        // Initier le paiement VitePay
        const paymentResponse = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount: finalTotal,
            description: `Commande #${orderId} - ${items.length} article(s)`,
            email,
            phoneNumber: phone,
          }),
        })
        
        const paymentData = await paymentResponse.json()
        console.log('Réponse paiement:', paymentData)
        
        if (paymentData.success && paymentData.redirectUrl) {
          // Rediriger vers VitePay (côté client uniquement)
          if (typeof window !== 'undefined') {
            window.location.href = paymentData.redirectUrl
          }
        } else {
          throw new Error(paymentData.error || 'Erreur lors de l\'initialisation du paiement')
        }
      } else {
        // For other payment methods, process payment
        // TODO: Integrate with other payment gateways
        await new Promise((resolve) => setTimeout(resolve, 2000))
        clearCart()
        router.push("/order-success")
      }
    } catch (error) {
      console.error('Order error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la commande'
      alert(`Erreur: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  // Afficher un message de chargement pendant la redirection
  if (isOverGuestLimit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
            <p className="text-muted-foreground mb-6">
              Pour les commandes supérieures à {GUEST_CART_LIMIT.toLocaleString()} FCFA, vous devez être connecté.
            </p>
            <Link href="/signin?redirect=/checkout">
              <Button className="gap-2">
                Se connecter
                <Lock className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-900 dark:to-transparent pt-6 pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), 
                                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <Link href="/cart" className="hover:text-orange-500 transition-colors">Panier</Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-800 dark:text-white font-medium">Paiement</span>
          </div>

          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                  Finaliser
                </span>{" "}
                votre commande
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Paiement sécurisé et livraison rapide</p>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                <Lock className="w-4 h-4 text-green-500" />
                <span>SSL Sécurisé</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <span>Paiement Protégé</span>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-slate-800 dark:text-white font-medium hidden sm:block">Panier</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-green-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-slate-800 dark:text-white font-medium hidden sm:block">Paiement</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:block">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 -mt-10 pb-12">
        {/* Guest Checkout Info */}
        {!user && (
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Commande sans compte
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez commander sans créer de compte. Vos informations seront conservées pendant 48h. 
                  Pour le paiement à la livraison, aucun compte n&apos;est requis.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Billing Details */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Détails de facturation</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid-responsive-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        Prénom <span className="text-red-500">*</span>
                      </Label>
                      <Input id="firstName" name="firstName" required defaultValue={user?.name || "Admin"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" name="lastName" placeholder="Traore" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Nom de l&apos;entreprise (optionnel)</Label>
                    <Input id="company" name="company" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">
                      Pays <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="region"
                        name="region"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                        required
                      >
                        <option value="">Sélectionnez votre pays</option>
                        <option value="ml">Mali</option>
                        <option value="bf">Burkina Faso</option>
                        <option value="ci">Côte d&apos;Ivoire</option>
                        <option value="sn">Sénégal</option>
                        <option value="fr">France</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">
                      Adresse <span className="text-red-500">*</span>
                    </Label>
                    <Input id="street" name="street" placeholder="Numéro et nom de la rue" required />
                  </div>

                  <div className="space-y-2">
                    <Input id="apartment" name="apartment" placeholder="Appartement, bâtiment (optionnel)" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">
                      Ville <span className="text-red-500">*</span>
                    </Label>
                    <Input id="city" name="city" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Quartier <span className="text-red-500">*</span>
                    </Label>
                    <Input id="district" name="district" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="+223 00 00 00 00" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Adresse email <span className="text-muted-foreground text-xs">(optionnel)</span>
                    </Label>
                    <Input id="email" name="email" type="email" placeholder="votre@email.com" defaultValue={user?.email || ""} />
                  </div>
                </div>
              </div>

              {/* Ship to different address */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShippingAddress(!showShippingAddress)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium">Livrer à une adresse différente ?</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${showShippingAddress ? "rotate-180" : ""}`} />
                </button>
                {showShippingAddress && (
                  <div className="mt-4 space-y-4">
                    <Input id="shippingAddress" name="shippingAddress" placeholder="Adresse de livraison" />
                    <Input id="shippingCity" name="shippingCity" placeholder="Ville" />
                    <Input id="shippingDistrict" name="shippingDistrict" placeholder="Quartier" />
                  </div>
                )}
              </div>

              {/* Other Notes */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800">
                <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes concernant votre commande, par ex. instructions spéciales pour la livraison"
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Your Order */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                
                <div className="relative">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center text-sm">🛒</span>
                    Votre commande
                  </h2>

                  <div className="space-y-4 pb-4 border-b border-slate-700">
                    <div className="flex justify-between text-sm font-medium text-slate-400">
                      <span>Produit</span>
                      <span>Sous-total</span>
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.name} <span className="text-slate-500">×{item.quantity}</span></span>
                        <span className="font-medium text-white">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 py-4 border-b border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Frais de livraison</span>
                      <span className="font-medium text-green-400">{shippingCost === 0 ? "Gratuit" : formatPrice(shippingCost)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <span className="text-lg text-slate-300">Total</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Code promo désactivé temporairement */}
              {/* <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🎁</span> Code promo ?
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez votre code"
                    className="rounded-xl"
                  />
                  <Button type="button" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl px-6">
                    Appliquer
                  </Button>
                </div>
              </div> */}

              {/* Shipping Method */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🚚</span> Mode de livraison
                </h3>
                
                {/* Message de livraison gratuite */}
                {isFreeShippingApplied && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      🎉 Livraison gratuite applicable ! Votre commande dépasse {formatPrice(shippingSettings?.freeShippingThreshold || 0)}
                    </p>
                  </div>
                )}
                
                <RadioGroup value={shippingMethod} onValueChange={(value) => {
                    // Empêcher la sélection de livraison gratuite si le seuil n'est pas atteint
                    const selectedMethod = shippingSettings?.shippingMethods.find(m => m.id === value)
                    if (selectedMethod?.cost === 0 && !isFreeShippingApplied && shippingSettings?.freeShippingEnabled) {
                      return // Ne pas permettre la sélection
                    }
                    setShippingMethod(value)
                  }}>
                  {shippingSettings?.shippingMethods
                    .filter(method => method.enabled)
                    .map((method) => {
                      // Vérifier si cette option doit être désactivée
                      // L'option "gratuite" (cost === 0) est désactivée si le seuil n'est pas atteint
                      const isFreeOption = method.cost === 0
                      const isDisabled = isFreeOption && !isFreeShippingApplied && shippingSettings?.freeShippingEnabled
                      
                      return (
                        <div 
                          key={method.id}
                          className={`flex items-center justify-between p-3 border rounded-lg mb-3 transition-colors ${
                            isDisabled 
                              ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50' 
                              : 'hover:border-primary'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem 
                              value={method.id} 
                              id={method.id} 
                              disabled={isDisabled}
                              className={isDisabled ? 'cursor-not-allowed' : ''}
                            />
                            <Label 
                              htmlFor={method.id} 
                              className={`font-medium ${isDisabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}
                            >
                              {method.name}
                              {isDisabled && (
                                <span className="block text-xs text-orange-500 dark:text-orange-400 mt-1">
                                  Disponible à partir de {formatPrice(shippingSettings?.freeShippingThreshold || 0)}
                                </span>
                              )}
                            </Label>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${isDisabled ? 'text-muted-foreground' : ''}`}>
                              {isFreeShippingApplied && method.cost > 0 
                                ? <span className="line-through text-muted-foreground">{formatPrice(method.cost)}</span>
                                : formatPrice(method.cost)
                              }
                              {isFreeShippingApplied && method.cost > 0 && (
                                <span className="ml-2 text-green-600">{formatPrice(0)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </RadioGroup>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>💳</span> Mode de paiement
                </h3>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => {
                    setPaymentMethod(value)
                    setShowCardDetails(value === "stripe" || value === "card")
                  }}
                >
                  {/* <div className="flex items-center space-x-3 p-3 border rounded-lg mb-3">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Image src="/Visa_Inc._logo.svg.png" alt="Visa" width={40} height={25} />
                    <Image src="/MasterCard_Logo.svg.png" alt="MasterCard" width={40} height={25} />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      Carte bancaire
                    </Label>
                  </div> */}
                  <div className="flex items-center space-x-3 p-3 border rounded-lg mb-3 bg-green-50 dark:bg-green-950/20">
                    <RadioGroupItem value="cash" id="cash" />
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Paiement à la livraison</div>
                        <div className="text-xs text-muted-foreground">Aucun compte requis</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg mb-3 bg-orange-50 dark:bg-orange-950/20">
                    <RadioGroupItem value="orangemoney" id="orangemoney" />
                    <Image src="/OM.jpg" alt="Orange Money" width={40} height={25} />
                    <Label htmlFor="orangemoney" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Orange Money</div>
                        <div className="text-xs text-muted-foreground">Paiement via VitePay</div>
                      </div>
                    </Label>
                  </div>
                  {/* <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="moovmoney" id="moovmoney" />
                    <Image src="/moov-money.png" alt="Moov Money" width={40} height={25} />
                    <Label htmlFor="moovmoney" className="flex-1 cursor-pointer">
                      Moov Money
                    </Label>
                  </div> */}
                </RadioGroup>

                {/* Orange Money - Note simple sans panneau déroulant */}
                {paymentMethod === "orangemoney" && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      <Lock className="inline h-4 w-4 mr-1" />
                      Vous serez redirigé vers VitePay pour saisir votre numéro Orange Money et confirmer le paiement.
                    </p>
                  </div>
                )}

                {/* Card Details - Affichage conditionnel pour CB */}
                {paymentMethod === "stripe" && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Paiement sécurisé</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">
                          Numéro de carte <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input 
                            id="cardNumber" 
                            name="cardNumber"
                            placeholder="1234 1234 1234 1234" 
                            required={paymentMethod === "stripe"}
                            maxLength={19}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <Image src="/Visa_Inc._logo.svg.png" alt="Visa" width={30} height={20} />
                            <Image src="/MasterCard_Logo.svg.png" alt="Mastercard" width={30} height={20} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">
                            Date d&apos;expiration <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id="expiry" 
                            name="expiry"
                            placeholder="MM / AA" 
                            required={paymentMethod === "stripe"}
                            maxLength={7}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">
                            CVV <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id="cvv" 
                            name="cvv"
                            placeholder="123" 
                            required={paymentMethod === "stripe"}
                            maxLength={4}
                            type="password"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">
                          Nom sur la carte <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          id="cardName" 
                          name="cardName"
                          placeholder="JOHN DOE" 
                          required={paymentMethod === "stripe"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardCountry">Pays de la carte</Label>
                        <div className="relative">
                          <select
                            id="cardCountry"
                            name="cardCountry"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none"
                          >
                            <option value="ml">Mali</option>
                            <option value="us">United States</option>
                            <option value="fr">France</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <Button
                type="submit"
                className="group relative w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                disabled={isProcessing}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Payer {formatPrice(finalTotal)}
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              {/* Security Note */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                <Lock className="w-3 h-3 inline mr-1" />
                Vos données sont sécurisées et cryptées
              </p>
            </div>
          </div>
        </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}


