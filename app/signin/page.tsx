"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { authClient } from "@/lib/auth-client"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const reason = searchParams.get('reason')

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleAppleSignIn = () => {
    // Utiliser la route personnalisée Apple
    const state = Buffer.from(JSON.stringify({ 
      action: 'login', 
      redirect: redirectUrl || '/' 
    })).toString('base64')
    window.location.href = `/api/auth/signin/apple?state=${state}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn(email, password, rememberMe)
      
      if (result.error) {
        toast({
          title: "Erreur",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        })
      } else {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email)
        } else {
          localStorage.removeItem("rememberedEmail")
        }
        
        toast({
          title: "Succès",
          description: "Redirection en cours...",
        })
        
        // Rediriger selon le rôle avec window.location pour forcer le rechargement des cookies
        const userRole = result.data?.user?.role
        
        // Délai augmenté pour s'assurer que les cookies sont bien définis en production
        setTimeout(() => {
          // Si une URL de redirection est spécifiée (ex: depuis le panier), l'utiliser
          let targetUrl: string
          if (redirectUrl && userRole === "CUSTOMER") {
            targetUrl = redirectUrl
          } else {
            targetUrl = userRole === "CUSTOMER" ? "/" : "/admin/dashboard"
          }
          console.log(`[Auth] Redirecting to ${targetUrl}, role: ${userRole}`)
          window.location.replace(targetUrl)
        }, 500)
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>

          {/* Logo */}
          <div className="flex justify-center lg:justify-center">
            <Link href="/">
              <Image 
                src="/Sissan-logo-150-150.png" 
                alt="Sissan Logo" 
                width={100} 
                height={100}
                className="cursor-pointer hover:opacity-80 transition"
              />
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Bon retour
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              Continuez avec l&apos;une des options suivantes
            </p>
            {reason === 'cart_limit' && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg mt-4">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  ⚠️ Pour les commandes supérieures à 20 000 FCFA, la connexion est requise.
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe 8-16 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-orange-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-slate-300 dark:border-slate-700"
                />
                <label 
                  htmlFor="remember" 
                  className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Se souvenir de moi
                </label>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                Mot de passe oublié?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold rounded-lg transition-all"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>

            {/* Apple Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAppleSignIn}
              className="w-full h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continuer avec Apple
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Vous n&apos;avez pas de compte?{" "}
            <Link 
              href="/signin/register" 
              className="font-semibold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition"
            >
              S&apos;inscrire
            </Link>
          </p>

          {/* Legal Links */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p>
              En vous connectant, vous acceptez nos{" "}
              <Link href="/terms" className="text-orange-600 hover:underline">
                Conditions Générales
              </Link>{" "}
              et notre{" "}
              <Link href="/privacy" className="text-orange-600 hover:underline">
                Politique de Confidentialité
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/authpage-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Optional overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10" />
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
