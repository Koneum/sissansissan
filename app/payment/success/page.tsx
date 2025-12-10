"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [orderId, setOrderId] = useState<string | null>(null)
  const hasCleared = useRef(false) // Éviter de vider le panier plusieurs fois

  useEffect(() => {
    // Récupérer l'order_id des paramètres URL si présent
    const orderIdFromUrl = searchParams.get("order_id")
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl)
    }

    // Vider le panier UNE SEULE FOIS après paiement réussi
    if (!hasCleared.current) {
      hasCleared.current = true
      clearCart()
    }
  }, [searchParams]) // Retirer clearCart des dépendances pour éviter la boucle

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-lg text-center">
            {/* Icône de succès */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Message de succès */}
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              Paiement réussi !
            </h1>
            <p className="text-muted-foreground mb-8">
              Votre commande a été confirmée et sera traitée dans les plus brefs délais.
            </p>

            {/* Numéro de commande */}
            {orderId && (
              <div className="bg-muted rounded-lg p-4 mb-8">
                <p className="text-sm text-muted-foreground mb-1">
                  Numéro de commande
                </p>
                <p className="text-xl font-bold text-foreground">
                  #{orderId}
                </p>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    Prochaines étapes
                  </h3>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• Vous recevrez un email de confirmation</li>
                    <li>• Votre commande sera préparée sous 24-48h</li>
                    <li>• Vous serez notifié lors de l'expédition</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Package className="w-4 h-4 mr-2" />
                  Voir mes commandes
                </Button>
              </Link>
              <Link href="/shop">
                <Button className="w-full sm:w-auto">
                  Continuer mes achats
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}


