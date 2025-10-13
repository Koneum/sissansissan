"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { useHeader } from "@/lib/header-context"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useLocale } from "@/lib/locale-context"

export default function HeaderSettingsPage() {
  const { headerData, updateHeaderData } = useHeader()
  const { t } = useLocale()
  
  const [topBannerText, setTopBannerText] = useState("")
  const [topBannerEnabled, setTopBannerEnabled] = useState(true)
  const [logoUrl, setLogoUrl] = useState("")
  const [emailLogoUrl, setEmailLogoUrl] = useState("")

  useEffect(() => {
    if (headerData) {
      setTopBannerText(headerData.topBannerText)
      setTopBannerEnabled(headerData.topBannerEnabled)
      setLogoUrl(headerData.logoUrl)
      setEmailLogoUrl(headerData.emailLogoUrl)
    }
  }, [headerData])

  const handleSave = () => {
    const newHeaderData = {
      topBannerText,
      topBannerEnabled,
      logoUrl,
      emailLogoUrl,
      navigation: headerData.navigation
    }
    
    updateHeaderData(newHeaderData)
    toast.success(t.admin.headerSaved)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.headerSettings}</h1>
          <p className="text-muted-foreground">{t.admin.customizeHeader}</p>
        </div>
        <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Save className="w-4 h-4 mr-2" />
          {t.admin.saveChanges}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.topBanner}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="banner-enabled">{t.admin.enableTopBanner}</Label>
              <p className="text-sm text-muted-foreground">{t.admin.showPromoBanner}</p>
            </div>
            <Switch
              id="banner-enabled"
              checked={topBannerEnabled}
              onCheckedChange={setTopBannerEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="header-text" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t.admin.topBannerText}
            </Label>
            <Input 
              id="header-text" 
              value={topBannerText}
              onChange={(e) => setTopBannerText(e.target.value)}
              className="h-11" 
              placeholder={t.admin.topBannerPlaceholder}
            />
            <p className="text-xs text-muted-foreground">{t.admin.topBannerDesc}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.logos}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t.admin.headerLogo}
            </Label>
            <ImageUpload
              value={logoUrl}
              onChange={setLogoUrl}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t.admin.emailLogo}
            </Label>
            <ImageUpload
              value={emailLogoUrl}
              onChange={setEmailLogoUrl}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Save className="w-4 h-4 mr-2" />
          {t.admin.saveAllChanges}
        </Button>
      </div>
    </div>
  )
}
