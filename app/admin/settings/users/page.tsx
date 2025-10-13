"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Search, UserPlus, Edit, Trash2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface User {
  id: number
  name: string
  email: string
  role: "Admin" | "Manager" | "Staff"
  status: "Active" | "Inactive"
}

const initialUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Manager", status: "Active" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Staff", status: "Inactive" },
]

export default function UserManagementPage() {
  const { t } = useLocale()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // États du formulaire
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formRole, setFormRole] = useState<string>("Staff")
  const [formStatus, setFormStatus] = useState<string>("Active")

  const resetForm = () => {
    setFormName("")
    setFormEmail("")
    setFormRole("Staff")
    setFormStatus("Active")
  }

  const handleCreateUser = () => {
    const newUser: User = {
      id: users.length + 1,
      name: formName,
      email: formEmail,
      role: formRole as "Admin" | "Manager" | "Staff",
      status: formStatus as "Active" | "Inactive",
    }
    setUsers([...users, newUser])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditUser = (user: User) => {
    setUserToEdit(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormStatus(user.status)
  }

  const handleSaveEdit = () => {
    if (userToEdit) {
      setUsers(users.map(u => 
        u.id === userToEdit.id 
          ? { ...u, name: formName, email: formEmail, role: formRole as "Admin" | "Manager" | "Staff", status: formStatus as "Active" | "Inactive" }
          : u
      ))
      setUserToEdit(null)
      resetForm()
    }
  }

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setUserToDelete(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.userManagement}</h1>
          <p className="text-muted-foreground">{t.admin.manageTeamMembers}</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="w-4 h-4" />
          {t.admin.addUser}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={t.admin.searchUsers}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t.admin.userName}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t.admin.userEmail}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t.admin.userRole}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t.admin.userStatus}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{t.admin.userActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-4 px-4 font-medium">{user.name}</td>
                    <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-4 px-4">{user.role}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {user.status === "Active" ? t.admin.userActive : t.admin.userInactive}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setUserToDelete(user)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de création d'utilisateur */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.addNewUser}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.admin.userName}</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.admin.userEmail}</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t.admin.userRole}</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t.admin.roleAdmin}</SelectItem>
                  <SelectItem value="Manager">{t.admin.roleManager}</SelectItem>
                  <SelectItem value="Staff">{t.admin.roleStaff}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t.admin.userStatus}</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t.admin.userActive}</SelectItem>
                  <SelectItem value="Inactive">{t.admin.userInactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateUser}>{t.admin.createUser}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition d'utilisateur */}
      <Dialog open={!!userToEdit} onOpenChange={() => { setUserToEdit(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.editUser}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.admin.userName}</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t.admin.userEmail}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t.admin.userRole}</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t.admin.roleAdmin}</SelectItem>
                  <SelectItem value="Manager">{t.admin.roleManager}</SelectItem>
                  <SelectItem value="Staff">{t.admin.roleStaff}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">{t.admin.userStatus}</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t.admin.userActive}</SelectItem>
                  <SelectItem value="Inactive">{t.admin.userInactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUserToEdit(null); resetForm(); }}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveEdit}>{t.admin.saveChanges}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression d'utilisateur */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.areYouSure}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteUserConfirm} <span className="font-semibold">{userToDelete?.name}</span>.
              {t.admin.actionCannotBeUndone}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.admin.deleteUser}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
