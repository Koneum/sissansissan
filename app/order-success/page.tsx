"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center max-w-md animate-in fade-in zoom-in duration-700">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-24 h-24 text-green-500 animate-in zoom-in duration-500" />
          </div>

          <h1 className="text-3xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            Order Successful!
          </h1>

          <p className="text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            Thank you for your purchase! Your order has been confirmed and will be shipped soon. You'll receive a
            confirmation email shortly.
          </p>

          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <Link href="/account">
              <Button className="w-full" size="lg">
                View Order Details
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
