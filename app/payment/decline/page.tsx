"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function PaymentDeclinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-lg text-center">
            {/* Icône d'échec */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Message d'échec */}
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              Paiement échoué
            </h1>
            <p className="text-muted-foreground mb-8">
              Votre paiement n'a pas pu être traité. Veuillez réessayer ou utiliser un autre moyen de paiement.
            </p>

            {/* Raisons possibles */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Raisons possibles :
              </h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Solde insuffisant</li>
                <li>• Transaction annulée</li>
                <li>• Problème de connexion</li>
                <li>• Informations incorrectes</li>
              </ul>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <Button className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer le paiement
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au panier
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
