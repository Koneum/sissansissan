"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import RegisterForm from "@/components/register-form"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-responsive py-8 sm:py-12">
      <div className="w-full max-w-md container-responsive">
        {/* Bouton retour */}
        <div className="mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")}
            className="btn-responsive gap-2 hover:bg-accent"
          >
            <ArrowLeft className="icon-responsive" />
            <span className="text-responsive-sm">Retour à l&apos;accueil</span>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block mb-3 sm:mb-4">
            <Image 
              src="/Sissan-logo-150-150.png" 
              alt="Sissan Logo" 
              width={80} 
              height={80}
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>
          <h1 className="heading-responsive-h2 text-foreground mb-2">Créer un compte</h1>
          <p className="text-responsive-base text-muted-foreground">Rejoignez notre communauté aujourd&apos;hui</p>
        </div>

        {/* Register Form Card */}
        <Card className="border-0 shadow-xl bg-card card-responsive">
          <CardHeader className="pb-3 sm:pb-4 p-responsive">
            <CardTitle className="heading-responsive-h3">Inscription</CardTitle>
            <CardDescription className="text-responsive-sm">Remplissez vos informations pour créer un nouveau compte</CardDescription>
          </CardHeader>
          <CardContent className="p-responsive pt-0">
            <RegisterForm />
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-4 sm:mt-6 text-center space-y-3 sm:space-y-4">
          <p className="text-foreground text-responsive-sm">
            Vous avez déjà un compte?{" "}
            <Link href="/signin" className="text-primary font-semibold hover:underline transition">
              Se connecter
            </Link>
          </p>
          <p className="text-muted-foreground text-responsive-xs leading-relaxed">
            En vous inscrivant, vous acceptez nos{" "}
            <Link href="#" className="text-primary hover:underline">
              conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="#" className="text-primary hover:underline">
              politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}


