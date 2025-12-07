"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { useCountdown } from "@/lib/countdown-context"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"

export default function CountdownSettingsPage() {
  const { countdownData, updateCountdownData } = useCountdown()
  const { t } = useLocale()
  
  const [enabled, setEnabled] = useState(true)
  const [title, setTitle] = useState("")
  const [endDate, setEndDate] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#F97316")
  const [textColor, setTextColor] = useState("#FFFFFF")

  useEffect(() => {
    setEnabled(countdownData.enabled)
    setTitle(countdownData.title)
    setEndDate(countdownData.endDate.split('T')[0]) // Format for input[type=date]
    setBackgroundColor(countdownData.backgroundColor)
    setTextColor(countdownData.textColor)
  }, [countdownData])

  const handleSave = () => {
    updateCountdownData({
      enabled,
      title,
      endDate: new Date(endDate).toISOString(),
      backgroundColor,
      textColor
    })
    toast.success(t.admin.countdownSaved)
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h1">{t.admin.countdownSettings}</h1>
          <p className="text-responsive-sm text-muted-foreground">{t.admin.manageFlashSale}</p>
        </div>
        <Button onClick={handleSave} className="bg-[#F97316] hover:bg-[#EA580C] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.saveChanges}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.countdownConfiguration}</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="countdown-enabled">{t.admin.enableCountdownTimer}</Label>
              <p className="text-sm text-muted-foreground">{t.admin.showCountdownHomepage}</p>
            </div>
            <Switch
              id="countdown-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countdown-title">{t.admin.countdownTitle}</Label>
            <Input
              id="countdown-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="FLASH SALE ENDS IN"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countdown-enddate">{t.admin.endDate}</Label>
            <Input
              id="countdown-enddate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="grid-responsive-2">
            <div className="space-y-2">
              <Label htmlFor="countdown-bgcolor">{t.admin.backgroundColor}</Label>
              <div className="flex gap-2">
                <Input
                  id="countdown-bgcolor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20 h-11"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#F97316"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countdown-textcolor">{t.admin.textColor}</Label>
              <div className="flex gap-2">
                <Input
                  id="countdown-textcolor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-20 h-11"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg" style={{ backgroundColor, color: textColor }}>
            <p className="text-center font-bold text-lg">{title || t.admin.preview}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#F97316] hover:bg-[#EA580C] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.saveCountdownSettings}
        </Button>
      </div>
    </div>
  )
}


