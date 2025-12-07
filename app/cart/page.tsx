"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useLocale } from "@/lib/locale-context"
import { formatPrice } from "@/lib/currency"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart()
  const { t } = useLocale()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
              <ShoppingBag className="w-24 h-24 sm:w-32 sm:h-32 text-primary/40" />
            </div>
            <h1 className="heading-responsive-h1 mb-4">{t.cart.empty}</h1>
            <p className="text-responsive-sm text-muted-foreground mb-6 sm:mb-8">{t.cart.emptyDesc}</p>
            <Link href="/products">
              <Button className="btn-responsive gap-2">
                {t.common.continueShopping}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="heading-responsive-h1 mb-2">{t.cart.title}</h1>
            <p className="text-responsive-sm text-muted-foreground flex items-center gap-2">
              <Package className="icon-responsive" />
              {itemCount} {itemCount === 1 ? 'article' : 'articles'}
            </p>
          </div>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" className="btn-responsive w-full sm:w-auto gap-2">
              <ArrowRight className="icon-responsive rotate-180" />
              {t.common.continueShopping}
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-card border rounded-xl p-4 md:p-6 flex gap-4 md:gap-6 hover:shadow-lg transition-all duration-300 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Image 
                    src={item.image || "/placeholder.svg"} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/products/${item.productId || item.id}`} className="flex-1">
                      <h3 className="font-semibold text-sm md:text-base line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                        {item.name}
                      </h3>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-lg md:text-xl font-bold text-primary">
                      {formatPrice(item.price)}
                    </p>
                    {item.quantity > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        x{item.quantity}
                      </Badge>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-background"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-background"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Sous-total</p>
                      <p className="text-lg font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-card to-card/50 border rounded-xl p-6 sticky top-24 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                {t.cart.orderSummary}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">{t.cart.subtotal}</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">{t.cart.shipping}</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                    {t.cart.shippingFree}
                  </Badge>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">{t.cart.total}</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/checkout">
                  <Button className="w-full h-12 text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-all" size="lg">
                    {t.cart.checkout}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link href="/products">
                  <Button variant="outline" className="w-full h-11 gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    {t.common.continueShopping}
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <span>Livraison gratuite</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


