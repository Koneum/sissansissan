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
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <Heart className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
            <h1 className="heading-responsive-h1 mb-4">{t.wishlist.empty}</h1>
            <p className="text-responsive-sm text-muted-foreground mb-6 sm:mb-8">
              {t.wishlist.emptyDesc}
            </p>
            <Link href="/shop" className="w-full sm:w-auto">
              <Button className="btn-responsive w-full sm:w-auto">{t.common.continueShopping}</Button>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="heading-responsive-h1 mb-2">{t.wishlist.title}</h1>
            <p className="text-responsive-sm text-muted-foreground">{items.length} {t.wishlist.itemsSaved}</p>
          </div>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="outline" className="btn-responsive w-full sm:w-auto">{t.common.continueShopping}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  <Trash2 className="icon-responsive text-red-500" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-medium line-clamp-2 text-responsive-sm hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-baseline gap-2">
                  {item.originalPrice && (
                    <span className="text-responsive-sm text-muted-foreground line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                  <span className="text-base sm:text-lg font-bold">{formatPrice(item.price)}</span>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="icon-responsive mr-2" />
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



