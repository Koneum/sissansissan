"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { authClient } from "@/lib/auth-client"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAppleSignUp = () => {
    // Utiliser la route personnalisée avec action=register
    const state = Buffer.from(JSON.stringify({ 
      action: 'register', 
      redirect: '/' 
    })).toString('base64')
    window.location.href = `/api/auth/signin/apple?state=${state}`
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

    if (!acceptTerms) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les conditions d'utilisation",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })
      
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error.message || "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Succès",
          description: "Compte créé avec succès! Veuillez vous connecter.",
        })
        router.push("/signin")
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
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
              Créer un compte
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              Rejoignez-nous et commencez votre aventure
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nom complet
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

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
                  placeholder="Minimum 8 caractères"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-orange-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="border-slate-300 dark:border-slate-700 mt-0.5"
              />
              <label 
                htmlFor="terms" 
                className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-tight"
              >
                J&apos;accepte les{" "}
                <Link href="/terms" className="text-orange-600 hover:underline">
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-orange-600 hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold rounded-lg transition-all"
            >
              {isLoading ? "Création..." : "Créer mon compte"}
            </Button>

            {/* Apple Sign Up */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAppleSignUp}
              className="w-full h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              S&apos;inscrire avec Apple
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Vous avez déjà un compte?{" "}
            <Link 
              href="/signin" 
              className="font-semibold text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition"
            >
              Se connecter
            </Link>
          </p>
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


