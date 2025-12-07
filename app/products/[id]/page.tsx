"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, Minus, Plus, Check, Loader2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useLocale } from "@/lib/locale-context"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/currency"
interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  discountPrice?: number
  stock: number
  image: string
  images?: string[]
  categoryId: string
  category?: {
    id: string
    name: string
  }
  isFeatured: boolean
  isNew?: boolean
  salePercentage?: number
  createdAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { t } = useLocale()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [reviewerEmail, setReviewerEmail] = useState("")

  // Charger le produit depuis l'API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Produit non trouvé')
        }
        
        const data = await response.json()
        setProduct(data.data)
        
        // Charger les produits similaires de la même catégorie
        if (data.data.categoryId) {
          const relatedResponse = await fetch(`/api/products?categoryId=${data.data.categoryId}&limit=4`)
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            // Exclure le produit actuel
            const filtered = relatedData.data.filter((p: Product) => p.id !== params.id)
            setRelatedProducts(filtered.slice(0, 4))
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error)
        router.push('/shop')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const handleAddToCart = () => {
    if (!product) return
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    setIsAddedToCart(true)
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  const handlePurchaseNow = () => {
    if (!product) return
    
    // Ajouter au panier
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    
    // Rediriger vers checkout
    router.push('/checkout')
  }

  const handleWishlist = () => {
    if (!product) return
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">{t.common.loading}</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Produit non trouvé
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Button onClick={() => router.push('/shop')}>
            Retour à la boutique
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image]
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <button onClick={() => router.push("/")} className="hover:text-orange-500 transition-colors">
            Accueil
          </button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <button onClick={() => router.push("/shop")} className="hover:text-orange-500 transition-colors">
            Boutique
          </button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-800 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-slate-900/50">
                <img
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg shadow-orange-500/25">
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlist}
                  className={`absolute top-4 right-4 w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
                    isInWishlist(product.id) 
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25" 
                      : "bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:scale-110"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === idx
                      ? "border-orange-500 ring-4 ring-orange-500/20 scale-105"
                      : "border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700"
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-contain p-2 bg-white dark:bg-slate-900"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            {product.category && (
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-full text-sm font-medium text-orange-600 dark:text-orange-400">
                {product.category.name}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              {product.stock > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {t.common.inStock} ({product.stock} {t.common.items})
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">{t.common.outOfStock}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 py-6 border-y border-slate-200 dark:border-slate-800">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="h-10 w-10 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Add to Cart */}
                <Button
                  variant="outline"
                  className={`h-12 px-6 font-semibold rounded-xl border-2 transition-all duration-300 ${
                    isAddedToCart 
                      ? "bg-emerald-500 text-white border-emerald-500" 
                      : "border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:text-orange-500"
                  }`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {isAddedToCart ? (
                    <><Check className="w-5 h-5 mr-2" /> Ajouté!</>
                  ) : (
                    t.products.addToCart
                  )}
                </Button>
              </div>

              {/* Buy Now */}
              <Button
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
                onClick={handlePurchaseNow}
                disabled={product.stock === 0}
              >
                {t.products.purchaseNow}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Qualité garantie</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Livraison rapide</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Paiement sécurisé</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl shadow-slate-900/5 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-700 rounded-none h-auto p-0 bg-transparent gap-2">
              <TabsTrigger
                value="description"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 px-6 py-3 font-medium transition-all"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="additional"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 px-6 py-3 font-medium transition-all"
              >
                Informations
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-t-lg border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 px-6 py-3 font-medium transition-all"
              >
                Avis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">{t.products.productDetails}</h3>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="mt-6">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t.common.category}</span>
                  <span className="col-span-2 text-muted-foreground">{product.category?.name || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t.common.stock}</span>
                  <span className="col-span-2 text-muted-foreground">{product.stock} {t.common.items}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t.common.status}</span>
                  <span className="col-span-2 text-muted-foreground">
                    {product.stock > 0 ? t.common.inStock : t.common.outOfStock}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">0 Reviews for this product</h3>
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product!</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add a Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Your email address will not be published. Required fields are marked *
                  </p>

                  <div className="space-y-2">
                    <Label>
                      Your Rating <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className="transition-colors">
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? "fill-orange-400 text-orange-400" : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Your review"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="min-h-[120px] resize-none"
                      maxLength={250}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Maximum</span>
                      <span>{reviewText.length}/250</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Admin"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@gmail.com"
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button className="bg-primary hover:bg-primary/90 text-white">Submit Review</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="relative py-8">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              {/* Header */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-full text-sm font-medium text-orange-600 dark:text-orange-400 mb-3">
                    Vous aimerez aussi
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Produits Similaires
                  </h2>
                </div>
                <button 
                  onClick={() => router.push('/shop')}
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Voir tout
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct, index) => (
                  <div 
                    key={relProduct.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard 
                      product={{
                        id: relProduct.id,
                        name: relProduct.name,
                        price: relProduct.discountPrice || relProduct.price,
                        originalPrice: relProduct.discountPrice ? relProduct.price : undefined,
                        image: relProduct.images?.[0] || relProduct.image || "/placeholder.svg",
                        salePercentage: relProduct.salePercentage,
                        isNew: relProduct.isNew
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
