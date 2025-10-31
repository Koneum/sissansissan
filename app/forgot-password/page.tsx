"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implémenter l'envoi d'email de réinitialisation avec Better Auth
      // Pour l'instant, on simule l'envoi
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setEmailSent(true)
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.4)] p-8 md:p-12">
          {/* Back Button */}
          <Link 
            href="/signin" 
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour à la connexion</span>
          </Link>

          {!emailSent ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
                  Mot de passe <span className="font-bold">oublié?</span>
                </h1>
                <p className="text-slate-300 text-sm">
                  Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-white text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent border-2 border-slate-400 text-white placeholder:text-slate-400 rounded-xl h-12 focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-400 hover:bg-teal-500 text-slate-900 font-semibold rounded-xl h-12 text-base"
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-slate-900" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Email envoyé!
              </h2>
              
              <p className="text-slate-300 mb-6">
                Nous avons envoyé un lien de réinitialisation à <strong className="text-white">{email}</strong>
              </p>
              
              <p className="text-slate-400 text-sm mb-8">
                Vérifiez votre boîte de réception et vos spams. Le lien expirera dans 1 heure.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/signin")}
                  className="w-full bg-teal-400 hover:bg-teal-500 text-slate-900 font-semibold rounded-xl h-12"
                >
                  Retour à la connexion
                </Button>
                
                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full text-slate-300 hover:text-white text-sm transition-colors"
                >
                  Renvoyer l'email
                </button>
              </div>
            </div>
          )}

          {!emailSent && (
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Vous vous souvenez de votre mot de passe?{" "}
                <Link href="/signin" className="text-teal-400 hover:text-teal-300 font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-white text-sm">
            💡 <strong>Astuce:</strong> Si vous ne recevez pas l'email, vérifiez vos spams ou contactez le support.
          </p>
        </div>
      </div>
    </div>
  )
}
