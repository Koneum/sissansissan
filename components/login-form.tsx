"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { authClient } from "@/lib/auth-client"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAppleDevice, setIsAppleDevice] = useState(false)
  const { toast } = useToast()
  const { signIn } = useAuth()
  const router = useRouter()

  // Charger l'email sauvegardé et détecter Apple au montage du composant
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
    
    // Détecter si c'est un appareil Apple
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    setIsAppleDevice(isApple)
  }, [])

  // Google et Facebook désactivés temporairement
  // const handleGoogleSignIn = async () => {
  //   try {
  //     await authClient.signIn.social({
  //       provider: "google",
  //       callbackURL: "/admin/dashboard",
  //     })
  //   } catch {
  //     toast({
  //       title: "Erreur",
  //       description: "Impossible de se connecter avec Google",
  //       variant: "destructive",
  //     })
  //   }
  // }

  // const handleFacebookSignIn = async () => {
  //   try {
  //     await authClient.signIn.social({
  //       provider: "facebook",
  //       callbackURL: "/admin/dashboard",
  //     })
  //   } catch {
  //     toast({
  //       title: "Erreur",
  //       description: "Impossible de se connecter avec Facebook",
  //       variant: "destructive",
  //     })
  //   }
  // }

  const handleAppleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "apple",
        callbackURL: "/admin/dashboard",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de se connecter avec Apple",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        toast({
          title: "Erreur",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        })
      } else {
        // Sauvegarder l'email si "Se souvenir de moi" est coché
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email)
        } else {
          localStorage.removeItem("rememberedEmail")
        }
        
        toast({
          title: "Succès",
          description: "Connexion réussie",
        })
        // Rediriger vers le dashboard ou la page d'accueil
        router.push("/admin/dashboard")
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Adresse email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background border-border"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Mot de passe
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-background border-border"
        />
      </div>

      <div className="flex items-center">
        <input 
          type="checkbox" 
          id="remember" 
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="rounded border-border w-4 h-4 cursor-pointer" 
        />
        <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground cursor-pointer">
          Se souvenir de moi
        </label>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-10"
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Ou continuer avec</span>
        </div>
      </div>

      {/* Social Login - Seulement Apple sur appareils Apple */}
      {isAppleDevice && (
        <div className="grid grid-cols-1 gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
            onClick={handleAppleSignIn}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </Button>
        </div>
      )}
    </form>
  )
}




