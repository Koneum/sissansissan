"use client"

import { useState } from "react"
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
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.heroSlider}</h1>
          <p className="text-muted-foreground">{t.admin.manageHeroSlides}</p>
        </div>
        <Button onClick={openAddDialog} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Plus className="w-4 h-4 mr-2" />
          {t.admin.addNewSlide}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.allHeroSlides} ({slides.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold text-2xl">{slide.badge}</span>
                    <span className="text-xs text-muted-foreground">{t.admin.saleOff}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{slide.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{slide.description}</p>
                  {slide.productId && (
                    <span className="text-xs text-muted-foreground">{t.admin.productId}: {slide.productId}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(slide)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(slide.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSlide ? t.admin.editSlide : t.admin.addNewSlide}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badge">{t.admin.badge}</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="33%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText">{t.admin.buttonText}</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">{t.admin.title} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="iPhone 16 Pro - Premium Tech"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.admin.description} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Experience the future with A18 Pro chip..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">{t.admin.slideImage} *</Label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">{t.admin.productIdOptional}</Label>
              <Input
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">{t.admin.linkSlideToProduct}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.admin.cancel}
              </Button>
              <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA]">
                <Save className="w-4 h-4 mr-2" />
                {editingSlide ? t.admin.update : t.admin.create} {t.admin.slide}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
