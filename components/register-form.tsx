"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { authClient } from "@/lib/auth-client"

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  // const [isAppleDevice, setIsAppleDevice] = useState(false)
  const { toast } = useToast()
  const { signUp } = useAuth()
  const router = useRouter()

  // Détection Apple désactivée - bouton Apple visible pour tous
  // useEffect(() => {
  //   const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  //   setIsAppleDevice(isApple)
  // }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Google et Facebook désactivés temporairement
  // const handleGoogleSignUp = async () => {
  //   try {
  //     await authClient.signIn.social({
  //       provider: "google",
  //       callbackURL: "/signin",
  //     })
  //   } catch {
  //     toast({
  //       title: "Erreur",
  //       description: "Impossible de s'inscrire avec Google",
  //       variant: "destructive",
  //     })
  //   }
  // }

  // const handleFacebookSignUp = async () => {
  //   try {
  //     await authClient.signIn.social({
  //       provider: "facebook",
  //       callbackURL: "/signin",
  //     })
  //   } catch {
  //     toast({
  //       title: "Erreur",
  //       description: "Impossible de s'inscrire avec Facebook",
  //       variant: "destructive",
  //     })
  //   }
  // }

  const handleAppleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: "apple",
        callbackURL: "/signin",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de s'inscrire avec Apple",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`
      const result = await signUp(formData.email, formData.password, fullName)
      
      if (result.error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la création du compte",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Succès",
          description: "Compte créé avec succès",
        })
        // Rediriger vers la page de connexion ou le dashboard
        router.push("/signin")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du compte",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="firstName" className="text-responsive-sm font-medium text-foreground">
            Prénom
          </label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Jean"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="bg-background border-border text-responsive-base"
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <label htmlFor="lastName" className="text-responsive-sm font-medium text-foreground">
            Nom
          </label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Dupont"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="bg-background border-border text-responsive-base"
          />
        </div>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="email" className="text-responsive-sm font-medium text-foreground">
          Adresse email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="bg-background border-border text-responsive-base"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="password" className="text-responsive-sm font-medium text-foreground">
          Mot de passe
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          className="bg-background border-border text-responsive-base"
        />
        <p className="text-responsive-xs text-muted-foreground">Minimum 8 caractères</p>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="confirmPassword" className="text-responsive-sm font-medium text-foreground">
          Confirmer le mot de passe
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="bg-background border-border text-responsive-base"
        />
      </div>

      <div className="flex items-start">
        <input type="checkbox" id="terms" required className="rounded border-border w-4 h-4 mt-0.5" />
        <label htmlFor="terms" className="ml-2 text-responsive-xs text-muted-foreground leading-relaxed">
          J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité
        </label>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold btn-responsive"
      >
        {isLoading ? "Création du compte..." : "Créer un compte"}
      </Button>

      {/* Divider */}
      <div className="relative my-3 sm:my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-responsive-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Ou s&apos;inscrire avec</span>
        </div>
      </div>

      {/* Social Login - Apple pour tous */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-border text-foreground hover:bg-secondary bg-transparent btn-responsive"
          onClick={handleAppleSignUp}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="text-responsive-sm">Apple</span>
        </Button>
      </div>
    </form>
  )
}




