"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images?: string[]
  salePercentage?: number
  isNew?: boolean
}

export default function ProductsPage() {
  const { t } = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("featured")

  useEffect(() => {
    fetchProducts()
  }, [sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let apiUrl = "/api/products?limit=50"
      
      switch (sortBy) {
        case "featured":
          apiUrl += "&isFeatured=true"
          break
        case "price-low":
          apiUrl += "&sortBy=price&sortOrder=asc"
          break
        case "price-high":
          apiUrl += "&sortBy=price&sortOrder=desc"
          break
        case "newest":
          apiUrl += "&sortBy=createdAt&sortOrder=desc"
          break
      }

      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="heading-responsive-h1 mb-2">{t.products.allProducts}</h1>
            <p className="text-responsive-sm text-muted-foreground">
              {loading ? t.common.loading : `${t.shop.showing} ${products.length} ${t.shop.results}`}
            </p>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-11">
              <SelectValue placeholder={t.shop.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t.shop.sortFeatured}</SelectItem>
              <SelectItem value="price-low">{t.shop.sortPriceLow}</SelectItem>
              <SelectItem value="price-high">{t.shop.sortPriceHigh}</SelectItem>
              <SelectItem value="newest">{t.shop.sortNewest}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">{t.products.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.discountPrice || product.price,
                  originalPrice: product.discountPrice ? product.price : undefined,
                  image: product.thumbnail || product.images?.[0] || "/placeholder.svg",
                  salePercentage: product.salePercentage,
                  isNew: product.isNew
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}


