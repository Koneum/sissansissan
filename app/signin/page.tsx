"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { useToast } from "@/hooks/use-toast"

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (mode === "signin") {
        const result = await signIn(email, password)
        if (result.error) {
          toast({
            title: "❌ Erreur de connexion",
            description: "Email ou mot de passe incorrect",
            variant: "destructive",
          })
        } else {
          toast({
            title: "✅ Connexion réussie",
            description: "Bienvenue!",
          })
          // Utiliser window.location pour forcer le rechargement et récupérer la session
          // Cela permet à Better Auth de charger correctement le rôle
          window.location.href = "/check-role"
        }
      } else {
        const result = await signUp(email, password, name)
        if (result.error) {
          // Vérifier si c'est une erreur d'email existant
          const errorMessage = result.error?.message || ""
          const isEmailExists = errorMessage.includes("already") || errorMessage.includes("exists") || errorMessage.includes("unique")
          
          toast({
            title: "❌ Erreur d'inscription",
            description: isEmailExists 
              ? "Cet email existe déjà. Utilisez la connexion ou un autre email."
              : "Impossible de créer le compte. Vérifiez vos informations.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "✅ Inscription réussie",
            description: "Votre compte a été créé avec succès",
          })
          // Redirection vers le compte utilisateur après inscription
          router.push("/account")
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      toast({
        title: "❌ Erreur",
        description: "Une erreur est survenue lors de l'authentification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (role: "user" | "admin") => {
    setIsLoading(true)
    try {
      const result = await signIn(
        role === "admin" ? "admin@sissan.com" : "customer1@example.com",
        role === "admin" ? "admin123" : "customer123"
      )
      if (result.error) {
        toast({
          title: "❌ Erreur de connexion",
          description: "Impossible de se connecter avec ce compte",
          variant: "destructive",
        })
      } else {
        // Utiliser window.location pour forcer le rechargement
        window.location.href = role === "admin" ? "/check-role" : "/"
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-0 md:gap-8 items-start">
        {/* Left Panel - Login Form */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.4),0_10px_40px_rgba(0,0,0,0.25)] p-8 md:p-12 z-10">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
              {mode === "signin" ? (
                <>Welcome <span className="font-bold">back</span></>
              ) : (
                <>Create <span className="font-bold">Account</span></>
              )}
            </h1>
            <p className="text-slate-300 text-sm mb-8">
              {mode === "signin" ? "Sign in to your account below." : "Register a new account below."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "signup" && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-white text-sm font-medium">
                    Nom complet
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-12 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-white text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="classicdesign@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-12 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-12 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>


              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-400 hover:bg-teal-500 text-slate-900 font-semibold rounded-xl h-12 text-base"
              >
                {isLoading ? (mode === "signin" ? "Connexion..." : "Inscription...") : (mode === "signin" ? t.auth.signIn : "S'inscrire")}
              </Button>

              {mode === "signin" && (
                <Button variant="secondary" className="w-full" onClick={() => handleQuickLogin("user")} disabled={isLoading}>
                  {t.auth.quickUserLogin}
                </Button>
              )}

              <div className="divide-y  divide-gray-200 flex items-center justify-center">
                <div></div>
                <div className="py-2">Ou connectez-vous avec
                  <div className="flex items-center gap-3 justify-center">  
                  <p>Google</p>
                  <p>Facebook</p>
                  <p>Apple</p>
                  </div>
                </div>
                
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-white text-sm hover:text-teal-400 transition-colors underline"
                >
                  {mode === "signin" ? "Pas de compte? S'inscrire" : "Déjà un compte? Se connecter"}
                </button>
              </div>
            </form>

            <div className="text-center flex justify-between mt-8">
              <Link href="/forgot-password" className="text-white text-sm hover:text-teal-400 transition-colors">
                Forgot Password ?
              </Link>
              <Link href="/" className="text-white text-sm hover:text-teal-400 transition-colors">
                Annuler
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel - Promotional Content */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden mt-8 md:mt-32">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-teal-400 font-bold text-lg">Design Learn</h2>
                <p className="text-slate-500 text-xs">Learning system</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-2">
                Build the <span className="bg-slate-900 text-white px-2 py-1 font-bold">Skills</span>
              </h3>
              <p className="text-slate-700 text-lg">
                You need to deliver <span className="font-bold">results</span>
              </p>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => setMode("signup")}
                className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl px-8 bg-transparent"
              >
                S&apos;inscrire
              </Button>
              <Button variant="default" onClick={() => handleQuickLogin("admin")} disabled={isLoading}>
                {t.auth.quickAdminLogin}
              </Button>
            </div>
          </div>

          {/* Hero Image */}
         
        </div>
      </div>
    </div>
  )
}
