"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Minus, Plus, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { formatPrice } from "@/lib/currency"
import Image from "next/image"
import Link from "next/link"

interface QuickViewModalProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    badge?: string
    salePercentage?: number
    rating?: number
    reviews?: number
    inStock?: boolean
    description?: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()

  if (!product) return null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    onClose()
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        originalPrice: product.originalPrice,
      })
    }
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const rating = product.rating || 4.5
  const reviews = product.reviews || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Quick view: {product.name}</DialogTitle>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-muted relative">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain p-8"
              />
              {discount > 0 && (
                <Badge className="absolute top-3 right-3 bg-primary text-white px-3 py-1">
                  {discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              </div>

              {product.inStock !== false && (
                <Badge variant="outline" className="text-green-600 border-green-600 mb-4">
                  En stock
                </Badge>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed border-t pt-4">
                {product.description}
              </p>
            )}

            <div className="border-t pt-4 space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantité :</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white"
                  onClick={handleAddToCart}
                >
                  Ajouter au panier
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-11 w-11 ${
                    isInWishlist(product.id) ? "bg-red-50 border-red-300 hover:bg-red-100" : ""
                  }`}
                  onClick={handleWishlistToggle}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>

              {/* View Full Details Link */}
              <Link href={`/products/${product.id}`} onClick={onClose}>
                <Button variant="link" className="w-full text-primary">
                  Voir tous les détails →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}





