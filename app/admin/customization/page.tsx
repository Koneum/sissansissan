"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale-context"

export default function CustomizationPage() {
  const { t } = useLocale()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t.admin.customization}</h1>
        <p className="text-muted-foreground">{t.admin.customizeStore}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.themeColors}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.admin.primaryColor}</Label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#1e293b" className="w-12 h-12 rounded cursor-pointer" />
                <div className="flex-1 flex items-center px-3 border rounded">#1e293b</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.admin.accentColor}</Label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#3b82f6" className="w-12 h-12 rounded cursor-pointer" />
                <div className="flex-1 flex items-center px-3 border rounded">#3b82f6</div>
              </div>
            </div>
          </div>
          <Button>{t.admin.saveTheme}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.homepageBanners}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t.admin.managePromotionalContent}</p>
          <Button>{t.admin.manageBanners}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
