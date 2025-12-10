"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Save, Search, Package } from "lucide-react"
import { useHeroSlider, type HeroSlide } from "@/lib/hero-slider-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useLocale } from "@/lib/locale-context"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  discountPrice: number | null
  thumbnail: string | null
  images: string[]
}

export default function HeroSliderPage() {
  const { slides, addSlide, updateSlide, deleteSlide } = useHeroSlider()
  const { t } = useLocale()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    badge: "",
    title: "",
    description: "",
    image: "",
    buttonText: "Shop Now",
    productId: ""
  })

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      try {
        const response = await fetch('/api/products?limit=100')
        const data = await response.json()
        if (data.success) {
          setProducts(data.data || [])
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  // Quand un produit est sélectionné, remplir le formulaire
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setProductSearchOpen(false)
    
    // Calculer le badge de réduction
    let badge = ""
    if (product.discountPrice && product.price > product.discountPrice) {
      const discount = Math.round(((product.price - product.discountPrice) / product.price) * 100)
      badge = `-${discount}%`
    }
    
    // Remplir le formulaire avec les infos du produit
    setFormData({
      badge,
      title: product.name,
      description: product.description || "",
      image: product.thumbnail || (product.images && product.images[0]) || "",
      buttonText: formData.buttonText || "Acheter",
      productId: product.id
    })
    
    toast.success(`Produit "${product.name}" sélectionné`)
  }

  const openAddDialog = () => {
    setEditingSlide(null)
    setSelectedProduct(null)
    setFormData({
      badge: "",
      title: "",
      description: "",
      image: "",
      buttonText: "Shop Now",
      productId: ""
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (slide: HeroSlide) => {
    setEditingSlide(slide)
    // Trouver le produit correspondant si productId existe
    const linkedProduct = slide.productId ? products.find(p => p.id === slide.productId) : null
    setSelectedProduct(linkedProduct || null)
    setFormData({
      badge: slide.badge,
      title: slide.title,
      description: slide.description,
      image: slide.image,
      buttonText: slide.buttonText,
      productId: slide.productId || ""
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.image) {
      toast.error(t.admin.fillRequiredFields)
      return
    }

    if (editingSlide) {
      updateSlide(editingSlide.id, formData)
      toast.success(t.admin.slideUpdated)
    } else {
      const newSlide: HeroSlide = {
        id: Date.now().toString(),
        ...formData
      }
      addSlide(newSlide)
      toast.success(t.admin.slideAdded)
    }
    
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t.admin.confirmDeleteSlide)) {
      deleteSlide(id)
      toast.success(t.admin.slideDeleted)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h1">{t.admin.heroSlider}</h1>
          <p className="text-responsive-sm text-muted-foreground">{t.admin.manageHeroSlides}</p>
        </div>
        <Button onClick={openAddDialog} className="bg-[#F97316] hover:bg-[#EA580C] btn-responsive w-full sm:w-auto">
          <Plus className="icon-responsive mr-2" />
          {t.admin.addNewSlide}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.allHeroSlides} ({slides.length})</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive">
          <div className="grid gap-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={96}
                  height={96}
                  className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-md"
                />
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold heading-responsive-h3">{slide.badge}</span>
                    <span className="text-responsive-xs text-muted-foreground">{t.admin.saleOff}</span>
                  </div>
                  <h3 className="heading-responsive-h4">{slide.title}</h3>
                  <p className="text-responsive-sm text-muted-foreground line-clamp-1">{slide.description}</p>
                  {slide.productId && (
                    <span className="text-xs text-muted-foreground">{t.admin.productId}: {slide.productId}</span>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(slide)}
                    className="h-8 px-2 sm:px-3"
                  >
                    <Edit className="icon-responsive" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(slide.id)}
                    className="text-red-500 hover:text-red-700 h-8 px-2 sm:px-3"
                  >
                    <Trash2 className="icon-responsive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-3 sm:gap-4">
          <DialogHeader>
            <DialogTitle className="heading-responsive-h4">{editingSlide ? t.admin.editSlide : t.admin.addNewSlide}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            {/* Sélecteur de produit */}
            <div className="space-y-2 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <Label className="text-responsive-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                Sélectionner un produit existant
              </Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productSearchOpen}
                    className="w-full justify-between text-left font-normal"
                  >
                    {selectedProduct ? (
                      <span className="flex items-center gap-2">
                        {selectedProduct.thumbnail && (
                          <Image 
                            src={selectedProduct.thumbnail} 
                            alt="" 
                            width={24} 
                            height={24} 
                            className="rounded object-cover"
                          />
                        )}
                        {selectedProduct.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Rechercher un produit...</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un produit..." />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingProducts ? "Chargement..." : "Aucun produit trouvé."}
                      </CommandEmpty>
                      <CommandGroup heading="Produits">
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => handleProductSelect(product)}
                            className="flex items-center gap-3 p-2 cursor-pointer"
                          >
                            {product.thumbnail && (
                              <Image 
                                src={product.thumbnail} 
                                alt="" 
                                width={40} 
                                height={40} 
                                className="rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.discountPrice ? (
                                  <>
                                    <span className="line-through">{product.price} FCFA</span>
                                    {" → "}
                                    <span className="text-green-600 font-medium">{product.discountPrice} FCFA</span>
                                  </>
                                ) : (
                                  <span>{product.price} FCFA</span>
                                )}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Sélectionnez un produit pour remplir automatiquement le titre, la description, l&apos;image et le badge de réduction.
              </p>
            </div>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou personnaliser manuellement</span>
              </div>
            </div>

            <div className="grid-responsive-2">
              <div className="space-y-2">
                <Label htmlFor="badge" className="text-responsive-sm font-medium">{t.admin.badge}</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="-33%"
                  className="text-responsive-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-responsive-sm font-medium">{t.admin.buttonText}</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Acheter maintenant"
                  className="text-responsive-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-responsive-sm font-medium">{t.admin.title} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="iPhone 16 Pro - Premium Tech"
                className="text-responsive-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-responsive-sm font-medium">{t.admin.description} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Experience the future with A18 Pro chip..."
                rows={3}
                className="text-responsive-base resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-responsive-sm font-medium">{t.admin.slideImage} *</Label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
            </div>

            {/* Affichage du produit lié */}
            {formData.productId && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Lié au produit: <strong>{selectedProduct?.name || formData.productId}</strong></span>
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="btn-responsive w-full sm:w-auto"
              >
                {t.admin.cancel}
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-[#F97316] hover:bg-[#EA580C] btn-responsive w-full sm:w-auto"
              >
                <Save className="icon-responsive mr-2" />
                {editingSlide ? t.admin.update : t.admin.create} {t.admin.slide}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


