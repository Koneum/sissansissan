"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale-context"

export default function CustomizationPage() {
  const { t } = useLocale()
  
  return (
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-8">
      <div>
        <h1 className="heading-responsive-h1">{t.admin.customization}</h1>
        <p className="text-responsive-sm text-muted-foreground">{t.admin.customizeStore}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.themeColors}</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4">
          <div className="grid-responsive-2">
            <div className="space-y-2">
              <Label>{t.admin.primaryColor}</Label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#1e293b" className="w-10 h-10 sm:w-12 sm:h-12 rounded cursor-pointer" />
                <div className="flex-1 flex items-center px-2 sm:px-3 border rounded text-responsive-sm">#1e293b</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.admin.accentColor}</Label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#3b82f6" className="w-10 h-10 sm:w-12 sm:h-12 rounded cursor-pointer" />
                <div className="flex-1 flex items-center px-2 sm:px-3 border rounded text-responsive-sm">#3b82f6</div>
              </div>
            </div>
          </div>
          <Button className="btn-responsive">{t.admin.saveTheme}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.homepageBanners}</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive">
          <p className="text-responsive-sm text-muted-foreground mb-4">{t.admin.managePromotionalContent}</p>
          <Button className="btn-responsive">{t.admin.manageBanners}</Button>
        </CardContent>
      </Card>
    </div>
  )
}


