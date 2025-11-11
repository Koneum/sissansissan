"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronDown, CreditCard, DollarSign, Lock } from "lucide-react"
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
  const [couponCode, setCouponCode] = useState("")
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null)

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
          zipCode: formData.get('country'),
        },
        // Shipping address (if different)
        shippingAddress: showShippingAddress ? {
          address: formData.get('shippingAddress'),
          city: formData.get('shippingCity'),
          zipCode: formData.get('shippingZipCode'),
        } : null,
        // Order details
        items,
        subtotal: total,
        shippingCost,
        total: finalTotal,
        shippingMethod,
        paymentMethod,
        couponCode,
        // User ID if logged in (optional)
        userId: user?.id || null,
      }

      // For cash on delivery, no payment processing needed
      if (paymentMethod === 'cash') {
        // Save order to localStorage for now (in production, send to API)
        const orders = JSON.parse(localStorage.getItem('guest_orders') || '[]')
        orders.push({
          ...orderData,
          id: `ORDER-${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem('guest_orders', JSON.stringify(orders))
        
        clearCart()
        router.push("/order-success")
      } else if (paymentMethod === 'orangemoney') {
        // Intégration VitePay pour Orange Money
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const omPhone = formData.get('omPhone') as string
        
        console.log('Données de paiement:', { email, phone, omPhone, orderData })
        
        // Créer la commande en base de données d'abord
        const createOrderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        })
        
        const createOrderData = await createOrderResponse.json()
        console.log('Réponse création commande:', createOrderData)
        
        if (!createOrderResponse.ok) {
          throw new Error(createOrderData.error || 'Erreur lors de la création de la commande')
        }
        
        const { orderId } = createOrderData
        
        // Initier le paiement VitePay
        const paymentResponse = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount: finalTotal,
            description: `Commande #${orderId} - ${items.length} article(s)`,
            email,
            phoneNumber: omPhone || phone,
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
    router.push("/cart")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-2 text-responsive-sm text-muted-foreground mb-4 sm:mb-6">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          <span>›</span>
          <span className="text-foreground">Paiement</span>
        </div>

        {/* Guest Checkout Info */}
        {!user && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Lock className="icon-responsive text-blue-600 mt-0.5" />
              <div>
                <h3 className="heading-responsive-h4 text-blue-900 dark:text-blue-100 mb-1">
                  Commande sans compte
                </h3>
                <p className="text-responsive-sm text-blue-700 dark:text-blue-300">
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
            <div className="space-y-4 sm:space-y-6">
              {/* Billing Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="heading-responsive-h2 mb-4 sm:mb-6">Détails de facturation</h2>
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
                    <Input id="country" name="country" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="+223 00 00 00 00" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Adresse email <span className="text-red-500">*</span>
                    </Label>
                    <Input id="email" name="email" type="email" required defaultValue={user?.email || "admin@gmail.com"} />
                  </div>
                </div>
              </div>

              {/* Ship to different address */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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
                    <Input placeholder="Adresse de livraison" />
                  </div>
                )}
              </div>

              {/* Other Notes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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
            <div className="space-y-6">
              {/* Your Order */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Votre commande</h2>

                <div className="space-y-4 pb-4 border-b">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Produit</span>
                    <span>Sous-total</span>
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 py-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span className="font-medium">{shippingCost === 0 ? "Gratuit" : formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold pt-4">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold mb-4">Avez-vous un code promo ?</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez votre code promo"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button type="button" className="bg-primary hover:bg-primary/90">
                    Appliquer
                  </Button>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold mb-4">Mode de livraison</h3>
                
                {/* Message de livraison gratuite */}
                {isFreeShippingApplied && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      🎉 Livraison gratuite applicable ! Votre commande dépasse {formatPrice(shippingSettings?.freeShippingThreshold || 0)}
                    </p>
                  </div>
                )}
                
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  {shippingSettings?.shippingMethods
                    .filter(method => method.enabled)
                    .map((method) => (
                      <div 
                        key={method.id}
                        className="flex items-center justify-between p-3 border rounded-lg mb-3 hover:border-primary transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="cursor-pointer font-medium">
                            {method.name}
                          </Label>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
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
                    ))
                  }
                </RadioGroup>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold mb-4">Mode de paiement</h3>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => {
                    setPaymentMethod(value)
                    setShowCardDetails(value === "stripe" || value === "card")
                  }}
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg mb-3">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Image src="/Visa_Inc._logo.svg.png" alt="Visa" width={40} height={25} />
                    <Image src="/MasterCard_Logo.svg.png" alt="MasterCard" width={40} height={25} />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      Carte bancaire
                    </Label>
                  </div>
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
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="moovmoney" id="moovmoney" />
                    <Image src="/moov-money.png" alt="Moov Money" width={40} height={25} />
                    <Label htmlFor="moovmoney" className="flex-1 cursor-pointer">
                      Moov Money
                    </Label>
                  </div>
                </RadioGroup>

                {/* Orange Money Details - Affichage conditionnel */}
                {paymentMethod === "orangemoney" && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4">
                      <Lock className="h-4 w-4 text-orange-600" />
                      <span>Paiement sécurisé via VitePay</span>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                        Comment ça marche ?
                      </h4>
                      <ol className="text-sm text-orange-700 dark:text-orange-300 space-y-1 list-decimal list-inside">
                        <li>Cliquez sur &quot;Payer&quot;</li>
                        <li>Vous serez redirigé vers VitePay</li>
                        <li>Entrez votre numéro Orange Money</li>
                        <li>Confirmez le paiement sur votre téléphone</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="omPhone">
                        Numéro Orange Money <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="omPhone" 
                        name="omPhone"
                        type="tel"
                        placeholder="+223 70 00 00 01" 
                        required={paymentMethod === "orangemoney"}
                        className="text-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: +223 XX XX XX XX (Mali)
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 <strong>Mode Test:</strong> Utilisez le numéro <strong>77000001</strong> pour simuler un paiement réussi, 
                        ou <strong>77000009</strong> pour simuler un échec.
                      </p>
                    </div>
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
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
                disabled={isProcessing}
              >
                {isProcessing ? "Traitement..." : `Payer ${formatPrice(finalTotal)}`}
              </Button>
            </div>
          </div>
        </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
