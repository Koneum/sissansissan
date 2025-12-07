"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import { useHeroSlider, type HeroSlide } from "@/lib/hero-slider-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useLocale } from "@/lib/locale-context"

export default function HeroSliderPage() {
  const { slides, addSlide, updateSlide, deleteSlide } = useHeroSlider()
  const { t } = useLocale()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  
  const [formData, setFormData] = useState({
    badge: "",
    title: "",
    description: "",
    image: "",
    buttonText: "Shop Now",
    productId: ""
  })

  const openAddDialog = () => {
    setEditingSlide(null)
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
            <div className="grid-responsive-2">
              <div className="space-y-2">
                <Label htmlFor="badge" className="text-responsive-sm font-medium">{t.admin.badge}</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="33%"
                  className="text-responsive-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-responsive-sm font-medium">{t.admin.buttonText}</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Shop Now"
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

            <div className="space-y-2">
              <Label htmlFor="productId" className="text-responsive-sm font-medium">{t.admin.productIdOptional}</Label>
              <Input
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                placeholder="1"
                className="text-responsive-base"
              />
              <p className="text-responsive-xs text-muted-foreground">{t.admin.linkSlideToProduct}</p>
            </div>

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


