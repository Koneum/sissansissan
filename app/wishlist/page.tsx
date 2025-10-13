"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"
import { useLocale } from "@/lib/locale-context"
import { formatPrice } from "@/lib/currency"
import { Trash2, ShoppingCart, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WishlistPage() {
  const { items, removeItem } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { t } = useLocale()

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">{t.wishlist.empty}</h1>
            <p className="text-muted-foreground mb-8">
              {t.wishlist.emptyDesc}
            </p>
            <Link href="/shop">
              <Button>{t.common.continueShopping}</Button>
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

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.wishlist.title}</h1>
            <p className="text-muted-foreground">{items.length} {t.wishlist.itemsSaved}</p>
          </div>
          <Link href="/shop">
            <Button variant="outline">{t.common.continueShopping}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative aspect-square bg-muted">
                <Link href={`/products/${item.id}`}>
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-contain p-4"
                  />
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-medium line-clamp-2 text-sm hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-baseline gap-2">
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                  <span className="text-lg font-bold">{formatPrice(item.price)}</span>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t.wishlist.addToCart}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

