"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"

function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      toast({
        title: "Token manquant",
        description: "Le lien de réinitialisation est invalide",
        variant: "destructive",
      })
      router.push("/forgot-password")
      return
    }

    // Valider le token
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch("/api/auth/validate-reset-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        toast({
          title: "Token invalide",
          description: "Le lien de réinitialisation a expiré ou est invalide",
          variant: "destructive",
        })
        setTimeout(() => router.push("/forgot-password"), 2000)
        setIsValidToken(false)
      } else {
        setIsValidToken(true)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le token",
        variant: "destructive",
      })
      setIsValidToken(false)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la réinitialisation")
      }

      setIsSuccess(true)
      toast({
        title: "Mot de passe réinitialisé",
        description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe",
      })

      setTimeout(() => router.push("/signin"), 3000)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de réinitialiser le mot de passe",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-700 mx-auto mb-4" />
          <p className="text-slate-700 text-responsive-base">Validation du lien...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl">❌</span>
          </div>
          <h1 className="heading-responsive-h1 text-slate-900 mb-2">Lien invalide</h1>
          <p className="text-responsive-sm text-slate-600 mb-6 sm:mb-8">
            Le lien de réinitialisation a expiré ou est invalide
          </p>
          <Link href="/forgot-password">
            <Button className="btn-responsive">Demander un nouveau lien</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.4)] p-6 sm:p-8 md:p-12">
          {/* Back Button */}
          <Link 
            href="/signin" 
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="icon-responsive" />
            <span className="text-responsive-sm">Retour à la connexion</span>
          </Link>

          {!isSuccess ? (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="heading-responsive-h1 font-light text-white mb-2">
                  Nouveau <span className="font-bold">mot de passe</span>
                </h1>
                <p className="text-responsive-sm text-slate-300">
                  Choisissez un nouveau mot de passe sécurisé pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-white text-responsive-sm font-medium">
                    Nouveau mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-10 sm:h-12 focus:border-teal-400 focus:ring-teal-400"
                  />
                  <p className="text-xs text-slate-400">Au moins 8 caractères</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-white text-responsive-sm font-medium">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-10 sm:h-12 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-400 hover:bg-teal-500 text-slate-900 font-semibold rounded-xl btn-responsive"
                >
                  {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
              </div>
              
              <h2 className="heading-responsive-h2 font-bold text-white mb-3">
                Mot de passe réinitialisé !
              </h2>
              
              <p className="text-responsive-sm text-slate-300 mb-6 sm:mb-8">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
              </p>

              <Button
                onClick={() => router.push("/signin")}
                className="w-full bg-teal-400 hover:bg-teal-500 text-slate-900 font-semibold rounded-xl btn-responsive"
              >
                Se connecter maintenant
              </Button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-white text-responsive-sm">
            🔒 <strong>Sécurité :</strong> Utilisez un mot de passe unique et complexe
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-700 mx-auto mb-4" />
          <p className="text-slate-700 text-responsive-base">Chargement...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
