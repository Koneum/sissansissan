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
      <Card className="group relative cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="relative bg-muted flex items-center justify-center h-64 overflow-hidden">
          <Link href={`/products/${product.id}`} className="absolute inset-0 z-0">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
            />
          </Link>

          {product.salePercentage && (
            <span className="absolute top-3 right-3 bg-[#4F46E5] text-white text-xs font-bold px-2.5 py-1 rounded animate-in fade-in slide-in-from-right-2 z-10">
              {product.salePercentage}% OFF
            </span>
          )}

          {product.isNew && (
            <span className="absolute top-3 left-3 bg-[#F97316] text-white text-xs font-bold px-2.5 py-1 rounded animate-in fade-in slide-in-from-left-2 z-10">
              NEW
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 z-20">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white hover:bg-white hover:scale-110 transition-transform shadow-md"
              onClick={handleQuickView}
            >
              <Eye className="w-4 h-4 text-slate-700" />
            </Button>

            <Button
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 shadow-md"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAdding ? "Ajouté!" : t.products.addToCart}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`bg-white hover:bg-white hover:scale-110 transition-transform shadow-md ${
                isInWishlist(product.id) ? "bg-red-50" : ""
              }`}
              onClick={handleWishlist}
            >
              <Heart
                className={`w-4 h-4 ${
                  isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-slate-700"
                }`}
              />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium mb-2 line-clamp-2 text-sm hover:text-[#4F46E5] transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2">
            {product.originalPrice ? (
              <>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Card>

      <QuickViewModal product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </>
  )
}




