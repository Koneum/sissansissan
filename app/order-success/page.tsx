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

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
        <div className="text-center max-w-md animate-in fade-in zoom-in duration-700">
          <div className="mb-4 sm:mb-6 flex justify-center">
            <CheckCircle className="w-20 h-20 sm:w-24 sm:h-24 text-green-500 animate-in zoom-in duration-500" />
          </div>

          <h1 className="heading-responsive-h1 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            Order Successful!
          </h1>

          <p className="text-responsive-base text-muted-foreground mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            Thank you for your purchase! Your order has been confirmed and will be shipped soon. You'll receive a
            confirmation email shortly.
          </p>

          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <Link href="/account" className="w-full">
              <Button className="btn-responsive w-full">
                View Order Details
              </Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button variant="outline" className="btn-responsive w-full bg-transparent">
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
