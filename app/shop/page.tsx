"use client"

import { useState, useEffect, Suspense, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { SlidersHorizontal, Search, Loader2, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images?: string[]
  stock: number
  isFeatured: boolean
  salePercentage?: number
  category?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLocale()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")
  const [inStockOnly, setInStockOnly] = useState(false)

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query params
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategories.length > 0) {
        params.append("categoryId", selectedCategories[0]) // API expects single category
      }
      if (priceRange.min) params.append("minPrice", priceRange.min)
      if (priceRange.max) params.append("maxPrice", priceRange.max)
      
      // Map sort values to API parameters
      if (sortBy) {
        switch (sortBy) {
          case "newest":
            params.append("sortBy", "createdAt")
            params.append("sortOrder", "desc")
            break
          case "price-asc":
            params.append("sortBy", "price")
            params.append("sortOrder", "asc")
            break
          case "price-desc":
            params.append("sortBy", "price")
            params.append("sortOrder", "desc")
            break
          case "name-asc":
            params.append("sortBy", "name")
            params.append("sortOrder", "asc")
            break
          case "name-desc":
            params.append("sortBy", "name")
            params.append("sortOrder", "desc")
            break
        }
      }
      
      if (inStockOnly) params.append("inStock", "true")

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch products")
      
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategories, priceRange, sortBy, inStockOnly])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch when filters change
  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategories, sortBy, inStockOnly, fetchProducts])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }, [searchInput])

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSearchInput("")
    setSelectedCategories([])
    setPriceRange({ min: "", max: "" })
    setSortBy("newest")
    setInStockOnly(false)
    router.push("/shop")
  }, [router])

  const filtersContent = useMemo(() => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>{t.shop.searchPlaceholder}</Label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder={t.common.search}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t.categories.all}</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t.shop.priceRange}</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder={t.shop.minPrice}
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder={t.shop.maxPrice}
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full"
          />
        </div>
        <Button
          onClick={fetchProducts}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {t.shop.applyFilters}
        </Button>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Disponibilité</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            {t.common.inStock}
          </Label>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full"
      >
        <X className="w-4 h-4 mr-2" />
        {t.shop.clearFilters}
      </Button>
    </div>
  ), [t, searchInput, handleSearch, categories, selectedCategories, handleCategoryToggle, priceRange, fetchProducts, inStockOnly, clearFilters])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-background pt-8 pb-16">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
            <div 
              className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), 
                                  linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
              <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-800 dark:text-white font-medium">{t.shop.title}</span>
            </div>

            {/* Title Section */}
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                <span className="block">{t.shop.title}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                  Collection
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300/80">
                {loading ? t.common.loading : `${products.length} produits disponibles pour vous`}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6 lg:gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/5 dark:shadow-slate-900/50 overflow-hidden">
                {/* Sidebar Header */}
                <div className="p-5 bg-gradient-to-r from-orange-500 to-pink-500">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-bold">{t.common.filter}</h2>
                    </div>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                      {selectedCategories.length > 0 ? `${selectedCategories.length} actifs` : 'Tous'}
                    </span>
                  </div>
                </div>
                
                {/* Filters Content */}
                <div className="p-5 space-y-6">
                  {filtersContent}
                </div>
              </div>
            </aside>

            {/* Products Section */}
            <div className="flex-1 pb-12">
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 shadow-lg shadow-slate-900/5 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Mobile Filters */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="lg:hidden bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-500/30 hover:from-orange-500/20 hover:to-pink-500/20"
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        {t.common.filter}
                        {selectedCategories.length > 0 && (
                          <span className="ml-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                            {selectedCategories.length}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="overflow-y-auto w-[320px]">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                          {t.common.filter}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        {filtersContent}
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Results Count */}
                  <p className="hidden sm:block text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{products.length}</span> produits trouvés
                  </p>

                  {/* Sort By */}
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">{t.shop.sortBy}</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[200px] h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="newest">{t.shop.sortNewest}</SelectItem>
                        <SelectItem value="price-asc">{t.shop.sortPriceLow}</SelectItem>
                        <SelectItem value="price-desc">{t.shop.sortPriceHigh}</SelectItem>
                        <SelectItem value="name-asc">Nom : A à Z</SelectItem>
                        <SelectItem value="name-desc">Nom : Z à A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    Essayez de modifier vos filtres ou explorez d&apos;autres catégories
                  </p>
                  <Button 
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl px-8"
                  >
                    {t.shop.clearFilters}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                          salePercentage: product.salePercentage
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}


