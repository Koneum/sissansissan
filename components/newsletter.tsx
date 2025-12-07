"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Send, Sparkles, Gift, Bell, CheckCircle2, type LucideIcon } from "lucide-react"
import { useNewsletter } from "@/lib/newsletter-context"

// Map des icônes disponibles
const iconMap: Record<string, LucideIcon> = {
  Gift,
  Bell,
  Sparkles,
  Mail,
  Send,
}

export function Newsletter() {
  const { newsletterData } = useNewsletter()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    // TODO: Connecter à une vraie API newsletter
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubscribed(true)
    setIsSubmitting(false)
  }

  // Ne pas afficher si désactivé
  if (!newsletterData.enabled) {
    return null
  }

  // Convertir les bénéfices avec les icônes
  const benefits = newsletterData.benefits.map(b => ({
    icon: iconMap[b.icon] || Gift,
    text: b.text
  }))

  return (
    <section className="container mx-auto px-4 py-8 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        <div className="relative z-10 p-8 md:p-16">
          {isSubscribed ? (
            // Success state
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Merci de votre inscription !</h3>
              <p className="text-white/70 text-lg">Vous recevrez bientôt nos meilleures offres.</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">Newsletter</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  {newsletterData.title.split(' ').slice(0, -1).join(' ')}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400"> {newsletterData.title.split(' ').slice(-1)}</span>
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-lg">
                  {newsletterData.subtitle}
                </p>

                {/* Benefits */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2"
                    >
                      <benefit.icon className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white/80">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right form */}
              <div className="flex-1 w-full max-w-md">
                <form onSubmit={handleSubmit} className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-lg opacity-30" />
                  
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8">
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <Input 
                          type="email" 
                          placeholder="Votre adresse email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 py-6 rounded-xl focus:border-orange-400 focus:ring-orange-400/20"
                          required
                        />
                      </div>
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Inscription...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {newsletterData.buttonText}
                            <Send className="w-5 h-5" />
                          </span>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-white/50 text-center mt-4">
                      En vous inscrivant, vous acceptez notre politique de confidentialité.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}




