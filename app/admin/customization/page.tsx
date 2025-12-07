"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale-context"
import Link from "next/link"
import { 
  Timer, 
  Mail, 
  Sparkles, 
  Image, 
  FileText, 
  Search, 
  PanelTop, 
  PanelBottom,
  ChevronRight,
  Palette
} from "lucide-react"

const customizationSections = [
  {
    title: "Slider Principal",
    description: "Gérer les slides du carousel de la page d'accueil",
    icon: Image,
    href: "/admin/customization/hero-slider",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Bannière Promo",
    description: "Configurer la bannière promotionnelle",
    icon: PanelTop,
    href: "/admin/customization/hero-banner",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Compte à Rebours",
    description: "Paramétrer le timer de vente flash",
    icon: Timer,
    href: "/admin/customization/countdown",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Newsletter",
    description: "Personnaliser la section d'inscription newsletter",
    icon: Mail,
    href: "/admin/customization/newsletter",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Points Forts",
    description: "Configurer les fonctionnalités mises en avant",
    icon: Sparkles,
    href: "/admin/customization/features",
    color: "from-yellow-500 to-amber-500"
  },
  {
    title: "En-tête",
    description: "Personnaliser le header du site",
    icon: PanelTop,
    href: "/admin/customization/header",
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Pied de page",
    description: "Configurer le footer du site",
    icon: PanelBottom,
    href: "/admin/customization/footer",
    color: "from-slate-500 to-gray-500"
  },
  {
    title: "SEO",
    description: "Optimiser le référencement du site",
    icon: Search,
    href: "/admin/customization/seo",
    color: "from-teal-500 to-cyan-500"
  },
  {
    title: "Pages Légales",
    description: "Éditer CGV et politique de confidentialité",
    icon: FileText,
    href: "/admin/customization/terms",
    color: "from-rose-500 to-pink-500"
  },
]

export default function CustomizationPage() {
  const { t } = useLocale()
  
  return (
    <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-8">
      <div>
        <h1 className="heading-responsive-h1">{t.admin.customization}</h1>
        <p className="text-responsive-sm text-muted-foreground">{t.admin.customizeStore}</p>
      </div>

      {/* Quick Color Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>{t.admin.themeColors}</CardTitle>
              <CardDescription>Couleurs principales du site</CardDescription>
            </div>
          </div>
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
                <input type="color" defaultValue="#F97316" className="w-10 h-10 sm:w-12 sm:h-12 rounded cursor-pointer" />
                <div className="flex-1 flex items-center px-2 sm:px-3 border rounded text-responsive-sm">#F97316</div>
              </div>
            </div>
          </div>
          <Button className="btn-responsive bg-[#F97316] hover:bg-[#EA580C]">{t.admin.saveTheme}</Button>
        </CardContent>
      </Card>

      {/* Customization Sections Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sections du site</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customizationSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <section.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base mb-1 group-hover:text-orange-500 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}


