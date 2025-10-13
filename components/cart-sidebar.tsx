"use client"

import { Minus, Plus, ShoppingBag, ArrowRight, X } from "lucide-react"
import { Button } from "./ui/button"
import { useCart } from "@/lib/cart-context"
import { useLocale } from "@/lib/locale-context"
import { formatPrice } from "@/lib/currency"
import Image from "next/image"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"

interface CartSidebarProps {
  open: boolean
  onClose: () => void
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart()
  const { t } = useLocale()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl">{t.cart.title}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </div>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
              <ShoppingBag className="w-24 h-24 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.cart.empty}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ajoutez des articles pour commencer vos achats
            </p>
            <Link href="/products" onClick={onClose}>
              <Button className="gap-2">
                {t.common.continueShopping}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-3 rounded-xl border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-300 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link href={`/products/${item.productId || item.id}`} className="flex-1" onClick={onClose}>
                          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                            {item.name}
                          </h3>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(item.price)}
                        </p>
                        {item.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs h-5">
                            x{item.quantity}
                          </Badge>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-background"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs font-semibold w-7 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-background"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="text-sm font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer / Checkout Section */}
            <div className="border-t bg-card/50 backdrop-blur-sm px-6 py-4 space-y-4">
              {/* Subtotal */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.cart.subtotal}</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.cart.shipping}</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                    Gratuit
                  </Badge>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t">
                <span className="font-bold">{t.cart.total}</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full h-11 font-semibold gap-2 shadow-lg hover:shadow-xl transition-all">
                    {t.cart.checkout}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" className="w-full h-10 gap-2">
                    Voir le panier
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
