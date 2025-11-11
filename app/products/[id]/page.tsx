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
  stock: number
  image: string
  images?: string[]
  categoryId: string
  category?: {
    id: string
    name: string
  }
  isFeatured: boolean
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
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => router.push("/")} className="hover:text-primary transition-colors">
            Home
          </button>
          <span>›</span>
          <button onClick={() => router.push("/shop")} className="hover:text-primary transition-colors">
            Shop
          </button>
          <span>›</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12 bg-white dark:bg-card rounded-lg p-6">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-muted relative group">
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
              <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white dark:bg-card shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 dark:border-border"
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-contain p-2 bg-gray-50 dark:bg-muted"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-foreground">{product.name}</h1>
                {discount > 0 && (
                  <Badge className="bg-primary text-white px-3 py-1 text-sm font-semibold">{discount}% OFF</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    <span>{t.common.inStock} ({product.stock} {t.common.items})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <span>{t.common.outOfStock}</span>
                  </div>
                )}
                {product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-3 pb-4 border-b">
              <span className="text-sm text-muted-foreground">{t.common.price}:</span>
              {product.comparePrice && (
                <span className="text-xl text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
              )}
              <span className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            </div>

            {product.description && (
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg bg-white dark:bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 sm:h-12 sm:w-12">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button
                className="flex-1 h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white font-medium"
                onClick={handlePurchaseNow}
                disabled={product.stock === 0}
              >
                {t.products.purchaseNow}
              </Button>
              <Button
                variant="outline"
                className={`h-10 sm:h-12 px-4 sm:px-6 font-medium ${isAddedToCart ? "bg-green-600 text-white border-green-600" : ""}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {isAddedToCart ? t.common.added : t.products.addToCart}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-10 w-10 sm:h-12 sm:w-12 ${isInWishlist(product.id) ? "bg-red-50 border-red-500" : ""}`}
                onClick={handleWishlist}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-lg p-6 mb-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="additional"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Additional Information
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Reviews
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
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
