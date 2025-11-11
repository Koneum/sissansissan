"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Eye } from "lucide-react"
import { usePages } from "@/lib/pages-context"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocale } from "@/lib/locale-context"

export default function PrivacyPolicyPage() {
  const { pagesData, updatePagesData } = usePages()
  const { t } = useLocale()
  const [content, setContent] = useState("")

  useEffect(() => {
    setContent(pagesData.privacyPolicy)
  }, [pagesData])

  const handleSave = () => {
    updatePagesData({
      ...pagesData,
      privacyPolicy: content
    })
    toast.success(t.admin.privacySaved)
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h1">{t.admin.privacyPolicy}</h1>
          <p className="text-responsive-sm text-muted-foreground">{t.admin.managePrivacyContent}</p>
        </div>
        <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.saveChanges}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.privacyPolicyContent}</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive">
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">{t.admin.edit}</TabsTrigger>
              <TabsTrigger value="preview">{t.admin.preview}</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-content">{t.admin.contentMarkdownSupported}</Label>
                <Textarea
                  id="privacy-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {t.admin.markdownFormatting}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="space-y-4">
              <div className="prose dark:prose-invert max-w-none p-6 border rounded-lg bg-muted/30">
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.savePrivacyPolicy}
        </Button>
      </div>
    </div>
  )
}
