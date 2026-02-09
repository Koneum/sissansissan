"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, UserPlus, Edit, Trash2, Shield, Users, Loader2, Eye, EyeOff } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"
import { PermissionButton } from "@/components/permission-button"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface UserPermission {
  id: string
  permission: Permission
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  permissions: UserPermission[]
}

interface PermissionGroup {
  category: string
  permissions: Permission[]
}

export default function UserManagementPage() {
  const { t } = useLocale()
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<PermissionGroup[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "PERSONNEL",
  })
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    password: false,
  })
  const [selectedPermissions, setSelectedPermissions] = useState<{
    [key: string]: {
      canView: boolean
      canCreate: boolean
      canEdit: boolean
      canDelete: boolean
    }
  }>({})

  useEffect(() => {
    fetchUsers()
    fetchPermissions()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/staff')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions')
      if (response.ok) {
        const data = await response.json()
        
        // Group by category
        const grouped = data.reduce((acc: PermissionGroup[], perm: Permission) => {
          const existing = acc.find(g => g.category === perm.category)
          if (existing) {
            existing.permissions.push(perm)
          } else {
            acc.push({ category: perm.category, permissions: [perm] })
          }
          return acc
        }, [])
        
        setPermissions(grouped)
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "PERSONNEL",
    })
    setSelectedPermissions({})
    setFormErrors({
      name: false,
      email: false,
      password: false,
    })
  }

  const handlePermissionChange = (permId: string, action: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permId]: {
        ...(prev[permId] || { canView: false, canCreate: false, canEdit: false, canDelete: false }),
        [action]: checked,
      }
    }))
  }

  const handlePermissionAllChange = (permId: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permId]: {
        ...(prev[permId] || { canView: false, canCreate: false, canEdit: false, canDelete: false }),
        canView: checked,
        canCreate: checked,
        canEdit: checked,
        canDelete: checked,
      }
    }))
  }

  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !formData.email.includes('@'),
      password: !formData.password || formData.password.length < 6,
    }
    
    setFormErrors(errors)
    
    if (errors.name) {
      toast.error("Le nom est obligatoire")
      return false
    }
    if (errors.email) {
      if (!formData.email.trim()) {
        toast.error("L'email est obligatoire")
      } else {
        toast.error("L'email n'est pas valide")
      }
      return false
    }
    if (errors.password) {
      if (!formData.password) {
        toast.error("Le mot de passe est obligatoire")
      } else {
        toast.error("Le mot de passe doit contenir au moins 6 caractères")
      }
      return false
    }
    
    return true
  }

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      const permissionsData = Object.entries(selectedPermissions)
        .filter(([_, perms]) => Object.values(perms).some(v => v))
        .map(([permId, perms]) => ({
          permissionId: permId,
          ...perms,
        }))

      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          permissions: permissionsData,
        }),
      })

      if (response.ok) {
        toast.success("✅ Utilisateur créé avec succès")
        setIsCreateDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const error = await response.json()
        if (error.message?.includes('email') || error.message?.includes('Email')) {
          toast.error("❌ Cet email existe déjà")
        } else {
          toast.error("❌ Erreur lors de la création: " + (error.message || "Erreur inconnue"))
        }
      }
    } catch (error) {
      toast.error("❌ Erreur lors de la création de l'utilisateur")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditUser = (user: User) => {
    setUserToEdit(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    })
    
    // Load existing permissions
    const perms: any = {}
    user.permissions.forEach(up => {
      perms[up.permission.id] = {
        canView: up.canView,
        canCreate: up.canCreate,
        canEdit: up.canEdit,
        canDelete: up.canDelete,
      }
    })
    setSelectedPermissions(perms)
  }

  const validateEditForm = () => {
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !formData.email.includes('@'),
      password: formData.password.length > 0 && formData.password.length < 6,
    }
    
    setFormErrors(errors)
    
    if (errors.name) {
      toast.error("Le nom est obligatoire")
      return false
    }
    if (errors.email) {
      if (!formData.email.trim()) {
        toast.error("L'email est obligatoire")
      } else {
        toast.error("L'email n'est pas valide")
      }
      return false
    }
    if (errors.password) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères")
      return false
    }
    
    return true
  }

  const handleSaveEdit = async () => {
    if (!userToEdit) return
    
    if (!validateEditForm()) {
      return
    }

    setIsSaving(true)
    try {
      const permissionsData = Object.entries(selectedPermissions)
        .filter(([_, perms]) => Object.values(perms).some(v => v))
        .map(([permId, perms]) => ({
          permissionId: permId,
          ...perms,
        }))

      const response = await fetch(`/api/admin/staff/${userToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          permissions: permissionsData,
        }),
      })

      if (response.ok) {
        toast.success("✅ Utilisateur modifié avec succès")
        setUserToEdit(null)
        resetForm()
        fetchUsers()
      } else {
        const error = await response.json()
        if (error.message?.includes('email') || error.message?.includes('Email')) {
          toast.error("❌ Cet email existe déjà")
        } else {
          toast.error("❌ Erreur lors de la modification: " + (error.message || "Erreur inconnue"))
        }
      }
    } catch (error) {
      toast.error("❌ Erreur lors de la modification de l'utilisateur")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/admin/staff/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("✅ Utilisateur supprimé avec succès")
        setUserToDelete(null)
        fetchUsers()
      } else {
        toast.error("❌ Erreur lors de la suppression")
      }
    } catch (error) {
      toast.error("❌ Erreur lors de la suppression de l'utilisateur")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'MANAGER':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'PERSONNEL':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMIN': 'Administrateur',
      'MANAGER': 'Manager',
      'PERSONNEL': 'Personnel',
      'CUSTOMER': 'Client',
    }
    return labels[role] || role
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      dashboard: "📊",
      products: "📦",
      orders: "🛒",
      customers: "👥",
      categories: "📁",
      reviews: "⭐",
      coupons: "🎫",
      settings: "⚙️",
      staff: "👔",
    }
    return icons[category] || "📋"
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderPermissionsTab = () => (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      {permissions.length === 0 ? (
        <div className="text-sm text-muted-foreground">Aucune permission disponible</div>
      ) : (
        permissions.map((group) => {
          // Une seule permission par catégorie (seed v2)
          const perm = group.permissions[0]
          if (!perm) return null

          const current = selectedPermissions[perm.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false }
          const isAllChecked = Boolean(current.canView && current.canCreate && current.canEdit && current.canDelete)
          const label = perm.description || group.category

          return (
            <div key={perm.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{getCategoryIcon(group.category)}</span>
                <span className="font-semibold">{label}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${perm.id}-all`}
                    checked={isAllChecked}
                    onCheckedChange={(checked) => handlePermissionAllChange(perm.id, checked as boolean)}
                  />
                  <label htmlFor={`${perm.id}-all`} className="text-sm cursor-pointer font-medium">
                    Tout
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${perm.id}-view`}
                    checked={current.canView}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(perm.id, 'canView', checked as boolean)
                    }
                  />
                  <label htmlFor={`${perm.id}-view`} className="text-sm cursor-pointer font-medium">
                    Voir
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${perm.id}-create`}
                    checked={current.canCreate}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(perm.id, 'canCreate', checked as boolean)
                    }
                  />
                  <label htmlFor={`${perm.id}-create`} className="text-sm cursor-pointer font-medium">
                    Créer
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${perm.id}-edit`}
                    checked={current.canEdit}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(perm.id, 'canEdit', checked as boolean)
                    }
                  />
                  <label htmlFor={`${perm.id}-edit`} className="text-sm cursor-pointer font-medium">
                    Modifier
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${perm.id}-delete`}
                    checked={current.canDelete}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(perm.id, 'canDelete', checked as boolean)
                    }
                  />
                  <label htmlFor={`${perm.id}-delete`} className="text-sm cursor-pointer font-medium">
                    Supprimer
                  </label>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Personnel</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les membres du personnel et leurs permissions
          </p>
        </div>
        <PermissionButton 
          category="staff" 
          action="create"
          className="gap-2" 
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un Membre
        </PermissionButton>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'MANAGER').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'PERSONNEL').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un utilisateur..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rôle</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Permissions</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="py-4 px-4 font-medium">{user.name}</td>
                      <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.length > 0 ? (
                            user.permissions.slice(0, 2).map((perm) => (
                              <span
                                key={perm.id}
                                className="text-xs bg-secondary px-2 py-1 rounded"
                              >
                                {perm.permission.category}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Aucune</span>
                          )}
                          {user.permissions.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <PermissionButton 
                            category="staff"
                            action="edit"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </PermissionButton>
                          <PermissionButton 
                            category="staff"
                            action="delete"
                            variant="ghost" 
                            size="sm"
                            onClick={() => setUserToDelete(user)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </PermissionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Membre</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau membre du personnel et définissez ses permissions
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom Complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      setFormErrors({ ...formErrors, name: false })
                    }}
                    placeholder="Jean Dupont"
                    className={formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">Le nom est obligatoire</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      setFormErrors({ ...formErrors, email: false })
                    }}
                    placeholder="jean.dupont@sissan.com"
                    className={formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">
                      {!formData.email.trim() ? "L'email est obligatoire" : "L'email n'est pas valide"}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de Passe *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        setFormErrors({ ...formErrors, password: false })
                      }}
                      placeholder="••••••••"
                      minLength={6}
                      className={formErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formErrors.password ? (
                    <p className="text-sm text-red-500">
                      {!formData.password ? "Le mot de passe est obligatoire" : "Le mot de passe doit contenir au moins 6 caractères"}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSONNEL">Personnel</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="mt-4">
              {renderPermissionsTab()}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleCreateUser} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'Utilisateur"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!userToEdit} onOpenChange={(open) => {
        if (!open) {
          setUserToEdit(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations et permissions de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom Complet *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      setFormErrors({ ...formErrors, name: false })
                    }}
                    className={formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">Le nom est obligatoire</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      setFormErrors({ ...formErrors, email: false })
                    }}
                    className={formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">
                      {!formData.email.trim() ? "L'email est obligatoire" : "L'email n'est pas valide"}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Nouveau Mot de Passe</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        setFormErrors({ ...formErrors, password: false })
                      }}
                      placeholder="Laisser vide pour ne pas changer"
                      className={formErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formErrors.password && formData.password.length > 0 && (
                    <p className="text-sm text-red-500">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSONNEL">Personnel</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="permissions" className="mt-4">
              {renderPermissionsTab()}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setUserToEdit(null); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'utilisateur{" "}
              <span className="font-semibold">{userToDelete?.name}</span>.
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


