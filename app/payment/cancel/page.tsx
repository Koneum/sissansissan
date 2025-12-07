"use client"

import { Suspense } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, ShoppingCart } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

function PaymentCancelContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-lg text-center">
            {/* Icône d'annulation */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Message d'annulation */}
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              Paiement annulé
            </h1>
            <p className="text-muted-foreground mb-8">
              Vous avez annulé le processus de paiement. Votre panier est toujours disponible.
            </p>

            {/* Information */}
            <div className="bg-muted rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                Aucun montant n'a été débité de votre compte.
                Vous pouvez reprendre votre commande à tout moment.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <Button className="w-full sm:w-auto">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Reprendre ma commande
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continuer mes achats
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

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}


