"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RegisterForm from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Image 
              src="/Sissan-logo-150-150.png" 
              alt="Sissan Logo" 
              width={80} 
              height={80}
              className="mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Créer un compte</h1>
          <p className="text-muted-foreground">Rejoignez notre communauté aujourd&apos;hui</p>
        </div>

        {/* Register Form Card */}
        <Card className="border-0 shadow-xl bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>Remplissez vos informations pour créer un nouveau compte</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Vous avez déjà un compte?{" "}
            <Link href="/signin" className="text-accent font-semibold hover:underline transition">
              Se connecter
            </Link>
          </p>
          <p className="text-xs text-muted-foreground mt-4">
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
