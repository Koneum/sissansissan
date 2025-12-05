"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { Loader2, User, Phone, Lock, Mail, Shield, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminProfilePage() {
  const { user } = useAuth()
  
  // Profile state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  
  // Profile fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Charger le profil
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'x-user-id': user.id
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setName(data.data.name || "")
        setEmail(data.data.email || "")
        setPhone(data.data.phone || "")
        setRole(data.data.role || "")
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      toast.error("Erreur lors du chargement du profil")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!user?.id) return
    
    if (!name.trim()) {
      toast.error("Le nom est requis")
      return
    }

    try {
      setSaving(true)
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Profil mis à jour avec succès")
        await fetchProfile()
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour")
      }
    } catch {
      toast.error("Erreur lors de la mise à jour du profil")
    } finally {
      setSaving(false)
    }
  }

  // Changer le mot de passe
  const handleChangePassword = async () => {
    if (!user?.id) return
    
    if (!currentPassword) {
      toast.error("Le mot de passe actuel est requis")
      return
    }
    
    if (!newPassword) {
      toast.error("Le nouveau mot de passe est requis")
      return
    }
    
    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères")
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    try {
      setSavingPassword(true)
      
      const response = await fetch('/api/admin/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Mot de passe modifié avec succès")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || "Erreur lors du changement de mot de passe")
      }
    } catch {
      toast.error("Erreur lors du changement de mot de passe")
    } finally {
      setSavingPassword(false)
    }
  }

  const getRoleBadge = (userRole: string) => {
    const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      SUPER_ADMIN: { label: "Super Admin", variant: "destructive" },
      ADMIN: { label: "Admin", variant: "default" },
      MANAGER: { label: "Manager", variant: "secondary" },
      PERSONNEL: { label: "Personnel", variant: "outline" },
    }
    
    const config = roleConfig[userRole] || { label: userRole, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="heading-responsive-h1">Mon Profil</h1>
        <p className="text-responsive-sm text-muted-foreground">
          Gérez vos informations personnelles et votre mot de passe
        </p>
      </div>

      <div className="grid gap-6">
        {/* Informations du profil */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-responsive-lg">Informations personnelles</CardTitle>
                <CardDescription className="text-responsive-sm">
                  Modifiez votre nom et numéro de téléphone
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Role Badge */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-responsive-sm font-medium">Rôle</p>
                <p className="text-responsive-xs text-muted-foreground">Votre niveau d&apos;accès</p>
              </div>
              {getRoleBadge(role)}
            </div>

            {/* Email (lecture seule) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-responsive-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input 
                id="email" 
                type="email"
                value={email}
                disabled
                className="bg-muted text-responsive-base"
              />
              <p className="text-responsive-xs text-muted-foreground">
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-responsive-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet *
              </Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                className="text-responsive-base"
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-responsive-sm flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input 
                id="phone" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+223 70 00 00 00"
                className="text-responsive-base"
              />
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="btn-responsive w-full sm:w-auto"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Lock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-responsive-lg">Sécurité</CardTitle>
                <CardDescription className="text-responsive-sm">
                  Changez votre mot de passe
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Mot de passe actuel */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-responsive-sm">
                Mot de passe actuel *
              </Label>
              <div className="relative">
                <Input 
                  id="currentPassword" 
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-responsive-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-responsive-sm">
                Nouveau mot de passe *
              </Label>
              <div className="relative">
                <Input 
                  id="newPassword" 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-responsive-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-responsive-xs text-muted-foreground">
                Minimum 8 caractères
              </p>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-responsive-sm">
                Confirmer le nouveau mot de passe *
              </Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-responsive-base pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleChangePassword} 
              disabled={savingPassword}
              variant="outline"
              className="btn-responsive w-full sm:w-auto"
            >
              {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
