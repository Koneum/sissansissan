"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus, Trash2, ExternalLink } from "lucide-react"
import { useFooter } from "@/lib/footer-context"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

interface ContactInfo {
  phone: string
  email: string
  address: string
}

interface SocialLink {
  platform: string
  url: string
  color: string
}

interface FooterLink {
  id: string
  text: string
  url: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface AppDownload {
  appStoreUrl: string
  googlePlayUrl: string
}

export default function FooterCustomizationPage() {
  const { footerData, updateFooterData } = useFooter()
  const { t } = useLocale()
  
  // Local state for editing
  const [companyDescription, setCompanyDescription] = useState("")
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "",
    email: "",
    address: ""
  })
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [helpSupport, setHelpSupport] = useState<FooterLink[]>([])
  const [accountLinks, setAccountLinks] = useState<FooterLink[]>([])
  const [appDownload, setAppDownload] = useState<AppDownload>({
    appStoreUrl: "",
    googlePlayUrl: ""
  })
  const [copyrightText, setCopyrightText] = useState("")
  const [poweredByText, setPoweredByText] = useState("")
  const [poweredByUrl, setPoweredByUrl] = useState("")

  // Load data from context on mount
  useEffect(() => {
    if (footerData) {
      setCompanyDescription(footerData.companyDescription)
      setContactInfo(footerData.contactInfo)
      setSocialLinks(footerData.socialLinks)
      setHelpSupport(footerData.helpSupport)
      setAccountLinks(footerData.accountLinks)
      setAppDownload(footerData.appDownload)
      setCopyrightText(footerData.copyrightText)
      setPoweredByText(footerData.poweredByText)
      setPoweredByUrl(footerData.poweredByUrl)
    }
  }, [footerData])

  const handleSave = () => {
    const newFooterData = {
      companyDescription,
      contactInfo,
      socialLinks,
      helpSupport,
      accountLinks,
      appDownload,
      copyrightText,
      poweredByText,
      poweredByUrl
    }
    
    updateFooterData(newFooterData)
    toast.success(t.admin.footerSaved)
  }

  const addLink = (section: "help" | "account") => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      text: "New Link",
      url: "#"
    }
    
    if (section === "help") {
      setHelpSupport([...helpSupport, newLink])
    } else {
      setAccountLinks([...accountLinks, newLink])
    }
  }

  const removeLink = (section: "help" | "account", id: string) => {
    if (section === "help") {
      setHelpSupport(helpSupport.filter(link => link.id !== id))
    } else {
      setAccountLinks(accountLinks.filter(link => link.id !== id))
    }
  }

  const updateLink = (section: "help" | "account", id: string, field: "text" | "url", value: string) => {
    if (section === "help") {
      setHelpSupport(helpSupport.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      ))
    } else {
      setAccountLinks(accountLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      ))
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h1">{t.admin.footerCustomization}</h1>
          <p className="text-responsive-sm text-muted-foreground">{t.admin.customizeFooter}</p>
        </div>
        <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.saveChanges}
        </Button>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <TabsTrigger value="company">{t.admin.companyTab}</TabsTrigger>
          <TabsTrigger value="contact">{t.admin.contactTab}</TabsTrigger>
          <TabsTrigger value="social">{t.admin.socialTab}</TabsTrigger>
          <TabsTrigger value="links">{t.admin.linksTab}</TabsTrigger>
          <TabsTrigger value="app">{t.admin.appTab}</TabsTrigger>
          <TabsTrigger value="footer">{t.admin.footerTab}</TabsTrigger>
        </TabsList>

        {/* Company Info Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.companyInformation}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">{t.admin.companyDescription}</Label>
                <Textarea
                  id="description"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={3}
                  placeholder={t.admin.companyDescPlaceholder}
                />
                <p className="text-xs text-muted-foreground">
                  {t.admin.companyDescHelp}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.contactInformation}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.admin.phoneNumber}</Label>
                <Input
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.admin.emailAddress}</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  placeholder="support@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t.admin.physicalAddress}</Label>
                <Input
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  placeholder="123 Main St, City, Country"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.socialMediaLinks}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((social, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>{t.admin.platform}</Label>
                    <Input
                      value={social.platform}
                      onChange={(e) => {
                        const updated = [...socialLinks]
                        updated[index].platform = e.target.value
                        setSocialLinks(updated)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.admin.url}</Label>
                    <Input
                      value={social.url}
                      onChange={(e) => {
                        const updated = [...socialLinks]
                        updated[index].url = e.target.value
                        setSocialLinks(updated)
                      }}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.admin.hoverColor}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={social.color}
                        onChange={(e) => {
                          const updated = [...socialLinks]
                          updated[index].color = e.target.value
                          setSocialLinks(updated)
                        }}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={social.color}
                        onChange={(e) => {
                          const updated = [...socialLinks]
                          updated[index].color = e.target.value
                          setSocialLinks(updated)
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Links Tab */}
        <TabsContent value="links" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Help & Support Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.admin.helpSupportLinks}</CardTitle>
                  <Button size="sm" onClick={() => addLink("help")}>
                    <Plus className="w-4 h-4 mr-1" />
                    {t.admin.addLink}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {helpSupport.map((link) => (
                  <div key={link.id} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">{t.admin.linkText} {link.id}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink("help", link.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Link Text"
                      value={link.text}
                      onChange={(e) => updateLink("help", link.id, "text", e.target.value)}
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink("help", link.id, "url", e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Account Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.admin.accountLinks}</CardTitle>
                  <Button size="sm" onClick={() => addLink("account")}>
                    <Plus className="w-4 h-4 mr-1" />
                    {t.admin.addLink}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {accountLinks.map((link) => (
                  <div key={link.id} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">{t.admin.linkText} {link.id}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink("account", link.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Link Text"
                      value={link.text}
                      onChange={(e) => updateLink("account", link.id, "text", e.target.value)}
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLink("account", link.id, "url", e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* App Download Tab */}
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.mobileAppDownload}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appstore">{t.admin.appStoreUrl}</Label>
                <div className="flex gap-2">
                  <Input
                    id="appstore"
                    value={appDownload.appStoreUrl}
                    onChange={(e) => setAppDownload({ ...appDownload, appStoreUrl: e.target.value })}
                    placeholder="https://apps.apple.com/app/your-app"
                  />
                  <Button variant="outline" size="icon" asChild>
                    <a href={appDownload.appStoreUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playstore">{t.admin.googlePlayUrl}</Label>
                <div className="flex gap-2">
                  <Input
                    id="playstore"
                    value={appDownload.googlePlayUrl}
                    onChange={(e) => setAppDownload({ ...appDownload, googlePlayUrl: e.target.value })}
                    placeholder="https://play.google.com/store/apps/details?id=your.app"
                  />
                  <Button variant="outline" size="icon" asChild>
                    <a href={appDownload.googlePlayUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Bottom Bar Tab */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.admin.copyrightCredits}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="copyright">{t.admin.copyrightText}</Label>
                <Input
                  id="copyright"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  placeholder={t.admin.copyrightPlaceholder}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="powered-text">{t.admin.poweredByText}</Label>
                  <Input
                    id="powered-text"
                    value={poweredByText}
                    onChange={(e) => setPoweredByText(e.target.value)}
                    placeholder="Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="powered-url">{t.admin.poweredByUrl}</Label>
                  <Input
                    id="powered-url"
                    value={poweredByUrl}
                    onChange={(e) => setPoweredByUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Save className="w-4 h-4 mr-2" />
          {t.admin.saveAllChanges}
        </Button>
      </div>
    </div>
  )
}

