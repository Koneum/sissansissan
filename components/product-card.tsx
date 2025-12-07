"use client"

import type React from "react"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useLocale } from "@/lib/locale-context"
import { QuickViewModal } from "./quick-view-modal"
import { formatPrice } from "@/lib/currency"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    badge?: string
    salePercentage?: number
    isNew?: boolean
    isFeatured?: boolean
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { t } = useLocale()
  const [isAdding, setIsAdding] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    setTimeout(() => setIsAdding(false), 500)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

  return (
    <>
      <div className="group relative">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-75 blur transition-all duration-500 group-hover:duration-200" />
        
        <Card className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-500 group-hover:-translate-y-1">
          {/* Image Section */}
          <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
            <Link href={`/products/${product.id}`} className="absolute inset-0 z-0">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
              />
            </Link>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {product.salePercentage && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/25">
                  -{product.salePercentage}%
                </span>
              )}
              {product.isNew && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/25">
                  NOUVEAU
                </span>
              )}
            </div>

            {/* Wishlist Button - Always visible */}
            <button
              className={`absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-10 ${
                isInWishlist(product.id) 
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25" 
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:scale-110"
              }`}
              onClick={handleWishlist}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
            </button>

            {/* Quick Actions - On Hover */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-20">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 bg-white/90 hover:bg-white text-slate-700 rounded-xl shadow-lg hover:scale-110 transition-all"
                  onClick={handleQuickView}
                >
                  <Eye className="w-5 h-5" />
                </Button>

                <Button
                  className="flex-1 h-10 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAdding ? "Ajouté!" : t.products.addToCart}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold mb-2 line-clamp-2 text-sm text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {product.originalPrice ? (
                  <>
                    <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              {/* Rating placeholder */}
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-xs text-slate-500">4.9</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <QuickViewModal product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </>
  )
}




