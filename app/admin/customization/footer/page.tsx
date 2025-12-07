"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus, Trash2, ExternalLink, Upload, Image as ImageIcon } from "lucide-react"
import { useFooter } from "@/lib/footer-context"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"
import Image from "next/image"

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

interface SocialMedia {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
}

interface PaymentMethod {
  name: string
  image: string
}

export default function FooterCustomizationPage() {
  const { footerData, updateFooterData } = useFooter()
  const { t } = useLocale()
  
  // Local state for editing
  const [logoUrl, setLogoUrl] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "",
    email: "",
    address: ""
  })
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: ""
  })
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [helpSupport, setHelpSupport] = useState<FooterLink[]>([])
  const [accountLinks, setAccountLinks] = useState<FooterLink[]>([])
  const [appDownload, setAppDownload] = useState<AppDownload>({
    appStoreUrl: "",
    googlePlayUrl: ""
  })
  const [copyrightText, setCopyrightText] = useState("")
  const [poweredByText, setPoweredByText] = useState("")
  const [poweredByUrl, setPoweredByUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Upload image function
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      toast.error('Erreur lors de l\'upload de l\'image')
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadImage(file)
      setLogoUrl(url)
      toast.success('Logo uploadé avec succès')
    } catch (error) {
      console.error('Error uploading logo:', error)
    }
  }

  const handlePaymentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadImage(file)
      const updated = [...paymentMethods]
      updated[index].image = url
      setPaymentMethods(updated)
      toast.success('Image uploadée avec succès')
    } catch (error) {
      console.error('Error uploading payment image:', error)
    }
  }

  // Load data from context on mount
  useEffect(() => {
    if (footerData) {
      setLogoUrl(footerData.logoUrl || "")
      setCompanyDescription(footerData.companyDescription)
      setContactInfo(footerData.contactInfo)
      setSocialLinks(footerData.socialLinks)
      setSocialMedia(footerData.socialMedia || { facebook: "", twitter: "", instagram: "", linkedin: "" })
      setPaymentMethods(
        (footerData.paymentMethods || []).filter(
          (method): method is PaymentMethod => typeof method !== 'string'
        )
      )
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
      logoUrl,
      companyDescription,
      contactInfo,
      socialLinks,
      socialMedia,
      paymentMethods,
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
        <Button onClick={handleSave} className="bg-[#F97316] hover:bg-[#EA580C] btn-responsive w-full sm:w-auto">
          <Save className="icon-responsive mr-2" />
          {t.admin.saveChanges}
        </Button>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="company" className="flex-1 min-w-[100px] text-xs sm:text-sm">Logo & Info</TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 min-w-[100px] text-xs sm:text-sm">Contact</TabsTrigger>
          <TabsTrigger value="social" className="flex-1 min-w-[100px] text-xs sm:text-sm">Social</TabsTrigger>
          <TabsTrigger value="payment" className="flex-1 min-w-[100px] text-xs sm:text-sm">Paiement</TabsTrigger>
          <TabsTrigger value="links" className="flex-1 min-w-[100px] text-xs sm:text-sm">Liens</TabsTrigger>
          <TabsTrigger value="app" className="flex-1 min-w-[100px] text-xs sm:text-sm">App</TabsTrigger>
          <TabsTrigger value="footer" className="flex-1 min-w-[100px] text-xs sm:text-sm">Footer</TabsTrigger>
        </TabsList>

        {/* Company Info Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo du Footer</Label>
                
                {/* Preview du logo */}
                {logoUrl && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={logoUrl}
                      alt="Logo preview"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                )}
                
                {/* Upload button */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploading}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Upload en cours...' : 'Choisir une image'}
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                
                {/* URL manuelle (optionnel) */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Ou entrer une URL manuellement
                  </summary>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/logo.png"
                    className="mt-2"
                  />
                </details>
                
                <p className="text-xs text-muted-foreground">
                  Logo affiché dans le pied de page du site
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description de l'entreprise</Label>
                <Textarea
                  id="description"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={3}
                  placeholder="Votre description d'entreprise..."
                />
                <p className="text-xs text-muted-foreground">
                  Brève description affichée dans le footer
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
              <CardTitle>Réseaux Sociaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={socialMedia.facebook}
                    onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                    placeholder="https://facebook.com/votrepage"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    value={socialMedia.twitter}
                    onChange={(e) => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                    placeholder="https://twitter.com/votrecompte"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={socialMedia.instagram}
                    onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                    placeholder="https://instagram.com/votrecompte"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={socialMedia.linkedin}
                    onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/votreentreprise"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3">Anciens liens sociaux (legacy)</h4>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Méthodes de Paiement</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => setPaymentMethods([...paymentMethods, { name: "Nouvelle méthode", image: "/payment.png" }])}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Méthode #{index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaymentMethods(paymentMethods.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input
                        value={method.name}
                        onChange={(e) => {
                          const updated = [...paymentMethods]
                          updated[index].name = e.target.value
                          setPaymentMethods(updated)
                        }}
                        placeholder="Ex: Visa, Orange Money..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      
                      {/* Preview */}
                      {method.image && (
                        <div className="relative w-20 h-12 border rounded overflow-hidden bg-muted">
                          <Image
                            src={method.image}
                            alt={method.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      )}
                      
                      {/* Upload button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`payment-upload-${index}`)?.click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {isUploading ? 'Upload...' : 'Choisir logo'}
                      </Button>
                      <input
                        id={`payment-upload-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePaymentImageUpload(e, index)}
                        className="hidden"
                      />
                      
                      {/* URL manuelle */}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Ou URL manuelle
                        </summary>
                        <Input
                          value={method.image}
                          onChange={(e) => {
                            const updated = [...paymentMethods]
                            updated[index].image = e.target.value
                            setPaymentMethods(updated)
                          }}
                          placeholder="/payment-logo.png"
                          className="mt-2"
                        />
                      </details>
                    </div>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune méthode de paiement. Cliquez sur "Ajouter" pour en créer une.
                </p>
              )}
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
        <Button onClick={handleSave} size="lg" className="bg-[#F97316] hover:bg-[#EA580C]">
          <Save className="w-4 h-4 mr-2" />
          {t.admin.saveAllChanges}
        </Button>
      </div>
    </div>
  )
}



