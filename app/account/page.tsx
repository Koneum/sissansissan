"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Package, RefreshCw, CheckCircle, XCircle, Clock, Truck, AlertCircle, LayoutDashboard, Trash2, AlertTriangle } from "lucide-react"
import { formatPrice } from "@/lib/currency"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    slug: string
    thumbnail: string | null
    price: number
  }
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  paymentMethod: string
  createdAt: string
  items: OrderItem[]
}

export default function AccountPage() {
  const { user, signOut, isAdmin } = useAuth()
  const router = useRouter()

  // Guest order tracking
  const [guestOrderNumber, setGuestOrderNumber] = useState("")
  const [guestContact, setGuestContact] = useState("")
  const [guestOrder, setGuestOrder] = useState<Order | null>(null)
  const [isTrackingGuestOrder, setIsTrackingGuestOrder] = useState(false)

  // Profile state
  const [profileName, setProfileName] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [revalidatingOrderId, setRevalidatingOrderId] = useState<string | null>(null)

  // Password change state
  const [passwordStep, setPasswordStep] = useState<"email" | "code" | "password">("email")
  const [verificationEmail, setVerificationEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoadingProfile(true)
      const response = await fetch("/api/user/profile", {
        headers: {
          "x-user-id": user.id
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setProfileName(data.data.name || "")
          setProfilePhone(data.data.phone || "")
        }
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [user?.id])

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setIsLoadingOrders(true)
      const response = await fetch("/api/user/orders", {
        headers: {
          "x-user-id": user.id
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement commandes:", error)
    } finally {
      setIsLoadingOrders(false)
    }
  }, [user?.id])

  const handleTrackGuestOrder = async () => {
    try {
      if (!guestOrderNumber.trim() || !guestContact.trim()) {
        toast.error("Veuillez entrer le numéro de commande et votre téléphone")
        return
      }

      setIsTrackingGuestOrder(true)
      setGuestOrder(null)

      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: guestOrderNumber.trim(),
          phone: guestContact.trim(),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        toast.error(data?.error || "Impossible de retrouver cette commande")
        return
      }

      setGuestOrder(data?.data || null)
      toast.success("Commande retrouvée")
    } catch (e) {
      toast.error("Erreur de connexion")
    } finally {
      setIsTrackingGuestOrder(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchOrders()
    }
  }, [user, fetchProfile, fetchOrders])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Suivre ma commande</h1>
              <p className="text-muted-foreground text-sm">
                Entrez votre numéro de commande et le téléphone utilisé au checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Numéro de commande</Label>
                <Input
                  id="orderNumber"
                  value={guestOrderNumber}
                  onChange={(e) => setGuestOrderNumber(e.target.value)}
                  placeholder="Ex: ORD-12345678-ABCD"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Téléphone</Label>
                <Input
                  id="contact"
                  value={guestContact}
                  onChange={(e) => setGuestContact(e.target.value)}
                  placeholder="Ex: +223..."
                />
              </div>

              <Button onClick={handleTrackGuestOrder} disabled={isTrackingGuestOrder} className="w-full">
                {isTrackingGuestOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  "Rechercher"
                )}
              </Button>
            </div>

            {guestOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>Commande {guestOrder.orderNumber}</CardTitle>
                  <CardDescription>
                    Statut: {guestOrder.status} • Paiement: {guestOrder.paymentStatus}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    Total: <span className="font-semibold">{formatPrice(guestOrder.total)}</span>
                  </div>
                  <div className="space-y-2">
                    {guestOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.product.name} x{item.quantity}</span>
                        <span className="text-muted-foreground">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <Button variant="link" onClick={() => router.push("/signin")}>
                Se connecter
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Le nom est requis")
      return
    }

    try {
      setIsSavingProfile(true)
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Profil mis à jour avec succès")
        // Recharger le profil pour afficher les nouvelles données
        fetchProfile()
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur de connexion")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Handle send verification code
  const handleSendCode = async () => {
    if (!verificationEmail.trim()) {
      toast.error("Veuillez entrer votre email")
      return
    }

    try {
      setIsSendingCode(true)
      const response = await fetch("/api/user/reset-password/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({ email: verificationEmail })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Code envoyé par email")
        setPasswordStep("code")
        // En développement, afficher le code
        if (data.code) {
          setDevCode(data.code)
        }
      } else {
        toast.error(data.error || "Erreur lors de l'envoi du code")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur de connexion")
    } finally {
      setIsSendingCode(false)
    }
  }

  // Handle verify code and change password
  const handleVerifyAndChangePassword = async () => {
    if (!verificationCode.trim()) {
      toast.error("Veuillez entrer le code de vérification")
      return
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    try {
      setIsVerifying(true)
      const response = await fetch("/api/user/reset-password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({
          code: verificationCode,
          newPassword,
          confirmPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Mot de passe modifié avec succès")
        // Reset form
        setPasswordStep("email")
        setVerificationEmail("")
        setVerificationCode("")
        setNewPassword("")
        setConfirmPassword("")
        setDevCode(null)
      } else {
        toast.error(data.error || "Erreur lors du changement de mot de passe")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur de connexion")
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle revalidate failed payment
  const handleRevalidatePayment = async (order: Order) => {
    try {
      setRevalidatingOrderId(order.id)
      
      // Relancer le paiement VitePay
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          description: `Commande #${order.orderNumber} - ${order.items.length} article(s)`,
          email: user.email,
          phoneNumber: (user as { phone?: string }).phone || "",
        })
      })

      const data = await response.json()

      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        toast.error(data.error || "Erreur lors du paiement")
      }
    } catch (error) {
      console.error("Erreur paiement:", error)
      toast.error("Erreur de connexion")
    } finally {
      setRevalidatingOrderId(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<Order["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      PENDING: { variant: "secondary", label: "En attente", icon: <Clock className="w-3 h-3 mr-1" /> },
      PROCESSING: { variant: "default", label: "En traitement", icon: <Package className="w-3 h-3 mr-1" /> },
      SHIPPED: { variant: "default", label: "Expédiée", icon: <Truck className="w-3 h-3 mr-1" /> },
      DELIVERED: { variant: "outline", label: "Livrée", icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      CANCELLED: { variant: "destructive", label: "Annulée", icon: <XCircle className="w-3 h-3 mr-1" /> }
    }
    const { variant, label, icon } = variants[status]
    return <Badge variant={variant} className="flex items-center">{icon}{label}</Badge>
  }

  // Get payment status badge
  const getPaymentBadge = (status: Order["paymentStatus"]) => {
    const variants: Record<Order["paymentStatus"], { variant: "default" | "secondary" | "destructive"; label: string }> = {
      PENDING: { variant: "secondary", label: "En attente" },
      PAID: { variant: "default", label: "Payé" },
      FAILED: { variant: "destructive", label: "Échoué" }
    }
    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") {
      toast.error("Veuillez taper 'SUPPRIMER' pour confirmer")
      return
    }

    try {
      setIsDeletingAccount(true)
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ confirmText: deleteConfirmText })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Compte supprimé avec succès")
        // Déconnecter et rediriger
        await signOut()
        router.push("/")
      } else {
        toast.error(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur de connexion")
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h1 className="heading-responsive-h2">Mon Compte</h1>
            <div className="flex gap-2">
              {isAdmin && (
                <Button 
                  variant="default" 
                  onClick={() => router.push("/admin/dashboard")}
                  className="btn-responsive"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              )}
              <Button variant="outline" onClick={signOut}>
                Déconnexion
              </Button>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="text-responsive-sm">Profil</TabsTrigger>
              <TabsTrigger value="orders" className="text-responsive-sm">Commandes</TabsTrigger>
              <TabsTrigger value="settings" className="text-responsive-sm">Paramètres</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-card rounded-lg p-4 sm:p-6 border">
                <h2 className="heading-responsive-h4 mb-4">Informations du Profil</h2>
                
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-responsive-sm">Nom *</Label>
                      <Input 
                        id="name" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="text-responsive-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-responsive-sm">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user.email} 
                        disabled 
                        className="text-responsive-base bg-muted"
                      />
                      <p className="text-responsive-xs text-muted-foreground">L&apos;email ne peut pas être modifié</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-responsive-sm">Téléphone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+223 70 00 00 00"
                        className="text-responsive-base"
                      />
                    </div>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="btn-responsive"
                    >
                      {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Enregistrer
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <div className="bg-card rounded-lg p-4 sm:p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="heading-responsive-h4">Historique des Commandes</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchOrders}
                    disabled={isLoadingOrders}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {isLoadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune commande</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-responsive-base">#{order.orderNumber}</p>
                            <p className="text-responsive-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getStatusBadge(order.status)}
                            {getPaymentBadge(order.paymentStatus)}
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="space-y-2 mb-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              {item.product.thumbnail && (
                                <Image
                                  src={item.product.thumbnail}
                                  alt={item.product.name}
                                  width={40}
                                  height={40}
                                  className="rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-responsive-sm truncate">{item.product.name}</p>
                                <p className="text-responsive-xs text-muted-foreground">
                                  Qté: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-responsive-xs text-muted-foreground">
                              +{order.items.length - 3} autre(s) article(s)
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
                          <p className="font-semibold text-responsive-base">
                            Total: {formatPrice(order.total)}
                          </p>
                          
                          {/* Bouton revalider pour paiement échoué */}
                          {order.paymentStatus === "FAILED" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevalidatePayment(order)}
                              disabled={revalidatingOrderId === order.id}
                              className="btn-responsive"
                            >
                              {revalidatingOrderId === order.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <AlertCircle className="w-4 h-4 mr-2" />
                              )}
                              Revalider le paiement
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="bg-card rounded-lg p-4 sm:p-6 border">
                <h2 className="heading-responsive-h4 mb-4">Changer le mot de passe</h2>
                
                {passwordStep === "email" && (
                  <div className="space-y-4">
                    <p className="text-responsive-sm text-muted-foreground">
                      Pour changer votre mot de passe, entrez votre email. Un code de vérification vous sera envoyé.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="verificationEmail" className="text-responsive-sm">Votre email</Label>
                      <Input 
                        id="verificationEmail" 
                        type="email"
                        value={verificationEmail}
                        onChange={(e) => setVerificationEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="text-responsive-base"
                      />
                    </div>
                    <Button 
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                      className="btn-responsive"
                    >
                      {isSendingCode && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Envoyer le code
                    </Button>
                  </div>
                )}

                {passwordStep === "code" && (
                  <div className="space-y-4">
                    <p className="text-responsive-sm text-muted-foreground">
                      Un code de vérification a été envoyé à <strong>{verificationEmail}</strong>
                    </p>
                    
                    {/* Afficher le code en mode développement */}
                    {devCode && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                        <p className="text-responsive-xs text-orange-700 dark:text-orange-300">
                          💡 <strong>Mode Test:</strong> Votre code est <strong>{devCode}</strong>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="verificationCode" className="text-responsive-sm">Code de vérification</Label>
                      <Input 
                        id="verificationCode" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="text-responsive-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-responsive-sm">Nouveau mot de passe</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        className="text-responsive-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-responsive-sm">Confirmer le mot de passe</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmer le mot de passe"
                        className="text-responsive-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setPasswordStep("email")
                          setVerificationCode("")
                          setNewPassword("")
                          setConfirmPassword("")
                          setDevCode(null)
                        }}
                        className="btn-responsive"
                      >
                        Retour
                      </Button>
                      <Button 
                        onClick={handleVerifyAndChangePassword}
                        disabled={isVerifying}
                        className="btn-responsive"
                      >
                        {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Changer le mot de passe
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Account Section */}
              <div className="bg-card rounded-lg p-4 sm:p-6 border border-red-200 dark:border-red-900">
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <h2 className="heading-responsive-h4 text-red-600 dark:text-red-400">Supprimer mon compte</h2>
                </div>
                
                {!showDeleteConfirm ? (
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-responsive-sm font-medium text-red-700 dark:text-red-300">
                            Attention : Cette action est irréversible
                          </p>
                          <ul className="text-responsive-xs text-red-600 dark:text-red-400 mt-2 space-y-1 list-disc list-inside">
                            <li>Toutes vos informations personnelles seront supprimées</li>
                            <li>Votre historique de commandes sera anonymisé</li>
                            <li>Vos adresses et favoris seront effacés</li>
                            <li>Vous ne pourrez plus accéder à ce compte</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-responsive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-responsive-sm text-red-700 dark:text-red-300 mb-3">
                        Pour confirmer la suppression, tapez <strong>SUPPRIMER</strong> ci-dessous :
                      </p>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                        placeholder="Tapez SUPPRIMER"
                        className="text-responsive-base border-red-300 dark:border-red-700 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText("")
                        }}
                        className="btn-responsive"
                      >
                        Annuler
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount || deleteConfirmText !== "SUPPRIMER"}
                        className="btn-responsive"
                      >
                        {isDeletingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Confirmer la suppression
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}


