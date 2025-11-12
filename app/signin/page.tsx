"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/login-form"

export default function SignInPage() {

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenue</h1>
          <p className="text-muted-foreground">Connectez-vous à votre compte pour continuer</p>
        </div>

        {/* Login Form Card */}
        <Card className="border-0 shadow-xl bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>Utilisez vos identifiants pour accéder</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-foreground text-responsive-sm">
            Vous n&apos;avez pas de compte?{" "}
            <Link href="/signin/register" className="text-black font-semibold hover:underline transition">
              S&apos;inscrire
            </Link>
          </p>
          <Link href="/forgot-password" className="text-primary text-sm hover:underline transition block">
            Mot de passe oublié?
          </Link>
        </div>
      </div>
    </div>
  )
}
