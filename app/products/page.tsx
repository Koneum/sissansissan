"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { Loader2, Package, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [sortBy, setSortBy] = useState("all") // Changed default to "all"

  useEffect(() => {
    fetchProducts()
  }, [sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let apiUrl = "/api/products?limit=100" // Increased limit
      
      switch (sortBy) {
        case "all":
          // No filter - show all products, sorted by newest
          apiUrl += "&sortBy=createdAt&sortOrder=desc"
          break
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
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-900 dark:to-transparent pt-8 pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
            <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-800 dark:text-white font-medium">{t.products.allProducts}</span>
          </div>

          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-full text-sm font-medium text-orange-600 dark:text-orange-400 mb-4">
                <Package className="w-4 h-4 inline mr-2" />
                Notre Catalogue
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                {t.products.allProducts}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {loading ? t.common.loading : `${products.length} produits disponibles`}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t.shop.sortBy}:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="newest">{t.shop.sortNewest}</SelectItem>
                  <SelectItem value="featured">{t.shop.sortFeatured}</SelectItem>
                  <SelectItem value="price-low">{t.shop.sortPriceLow}</SelectItem>
                  <SelectItem value="price-high">{t.shop.sortPriceHigh}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="aspect-square bg-slate-200 dark:bg-slate-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
              <Search className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.products.noProducts}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Aucun produit trouvé. Revenez bientôt pour découvrir nos nouveautés !
            </p>
            <Link href="/shop">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl px-8">
                Retour à la boutique
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard 
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
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}


