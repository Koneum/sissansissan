"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useSEO } from "@/lib/seo-context"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useLocale } from "@/lib/locale-context"

export default function SEOSettingsPage() {
  const { seoData, updateSEOData } = useSEO()
  const { t } = useLocale()
  
  const [formData, setFormData] = useState(seoData)

  useEffect(() => {
    setFormData(seoData)
  }, [seoData])

  const handleSave = () => {
    updateSEOData(formData)
    toast.success(t.admin.seoSaved)
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h1">{t.admin.seoSettings}</h1>
          <p className="text-responsive-sm text-muted-foreground">{t.admin.optimizeSite}</p>
        </div>
        <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.saveChanges}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.homepageSeo}</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="homeTitle">{t.admin.homePageTitle}</Label>
            <Input
              id="homeTitle"
              value={formData.homeTitle}
              onChange={(e) => setFormData({ ...formData, homeTitle: e.target.value })}
              placeholder="Sissan - Premium Electronics & Tech Store"
            />
            <p className="text-xs text-muted-foreground">{t.admin.recommendedLength}: 50-60 {t.admin.characters}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeDescription">{t.admin.homePageMetaDesc}</Label>
            <Textarea
              id="homeDescription"
              value={formData.homeDescription}
              onChange={(e) => setFormData({ ...formData, homeDescription: e.target.value })}
              placeholder="Shop the latest electronics, smartphones, laptops..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{t.admin.recommendedLength}: 150-160 {t.admin.characters}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeKeywords">{t.admin.keywords}</Label>
            <Input
              id="homeKeywords"
              value={formData.homeKeywords}
              onChange={(e) => setFormData({ ...formData, homeKeywords: e.target.value })}
              placeholder="electronics, smartphones, laptops, tech"
            />
            <p className="text-xs text-muted-foreground">{t.admin.commaSeparatedKeywords}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.generalSeo}</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">{t.admin.siteName}</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              placeholder="Sissan"
            />
          </div>

          <div className="space-y-2">
            <Label>{t.admin.defaultOgImage}</Label>
            <ImageUpload
              value={formData.defaultOGImage}
              onChange={(url) => setFormData({ ...formData, defaultOGImage: url })}
            />
            <p className="text-xs text-muted-foreground">{t.admin.usedForSocialSharing}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterHandle">{t.admin.twitterHandle}</Label>
            <Input
              id="twitterHandle"
              value={formData.twitterHandle}
              onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
              placeholder="@sissan"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.analyticsTracking}</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="googleAnalyticsId">{t.admin.googleAnalyticsId}</Label>
            <Input
              id="googleAnalyticsId"
              value={formData.googleAnalyticsId}
              onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPixelId">{t.admin.facebookPixelId}</Label>
            <Input
              id="facebookPixelId"
              value={formData.facebookPixelId}
              onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
              placeholder="123456789012345"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.saveAllChanges}
        </Button>
      </div>
    </div>
  )
}
