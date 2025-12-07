"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Eye, 
  Trash2, 
  MessageSquare,
  Loader2,
  RefreshCw,
  User,
  Clock,
  CheckCircle,
  Archive,
  Reply
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/lib/locale-context"

interface ContactMessage {
  id: string
  firstName: string
  lastName?: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function MessagesPage() {
  const { t } = useLocale()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contact")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes })
      })

      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === id ? { ...msg, status: status as any, notes } : msg
          )
        )
        toast({
          title: "Succès",
          description: "Statut mis à jour"
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== id))
        toast({
          title: "Succès",
          description: "Message supprimé"
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive"
      })
    }
  }

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setAdminNotes(message.notes || "")
    setIsDialogOpen(true)
    
    // Mark as read if new
    if (message.status === "NEW") {
      updateMessageStatus(message.id, "READ")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      NEW: { variant: "destructive", label: "Nouveau", icon: MessageSquare },
      READ: { variant: "secondary", label: "Lu", icon: Eye },
      REPLIED: { variant: "default", label: "Répondu", icon: Reply },
      ARCHIVED: { variant: "outline", label: "Archivé", icon: Archive }
    }
    const config = variants[status] || variants.NEW
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || msg.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === "NEW").length,
    read: messages.filter(m => m.status === "READ").length,
    replied: messages.filter(m => m.status === "REPLIED").length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-muted-foreground">Chargement des messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Messages de contact</h1>
          <p className="text-muted-foreground">Gérez les messages reçus via le formulaire de contact</p>
        </div>
        <Button onClick={fetchMessages} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <MessageSquare className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-xs text-muted-foreground">Nouveaux</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.read}</p>
                <p className="text-xs text-muted-foreground">Lus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.replied}</p>
                <p className="text-xs text-muted-foreground">Répondus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, sujet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="NEW">Nouveaux</SelectItem>
                <SelectItem value="READ">Lus</SelectItem>
                <SelectItem value="REPLIED">Répondus</SelectItem>
                <SelectItem value="ARCHIVED">Archivés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun message trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    message.status === "NEW" 
                      ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800" 
                      : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {message.firstName} {message.lastName}
                        </span>
                        {getStatusBadge(message.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{message.email}</p>
                      <p className="font-medium text-sm mb-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(message.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Message de {selectedMessage.firstName} {selectedMessage.lastName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedMessage.email}`} className="text-sm hover:text-orange-600">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedMessage.phone}`} className="text-sm hover:text-orange-600">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(selectedMessage.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                </div>

                {/* Subject & Message */}
                <div>
                  <h4 className="font-semibold mb-2">Sujet</h4>
                  <p className="text-muted-foreground">{selectedMessage.subject}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Message</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h4 className="font-semibold mb-2">Notes internes</h4>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ajoutez des notes sur ce message..."
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Select 
                    value={selectedMessage.status} 
                    onValueChange={(value) => updateMessageStatus(selectedMessage.id, value, adminNotes)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">Nouveau</SelectItem>
                      <SelectItem value="READ">Lu</SelectItem>
                      <SelectItem value="REPLIED">Répondu</SelectItem>
                      <SelectItem value="ARCHIVED">Archivé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={() => updateMessageStatus(selectedMessage.id, selectedMessage.status, adminNotes)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sauvegarder notes
                  </Button>

                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                    <Button variant="outline" className="gap-2">
                      <Reply className="w-4 h-4" />
                      Répondre par email
                    </Button>
                  </a>

                  <Button 
                    variant="destructive" 
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
