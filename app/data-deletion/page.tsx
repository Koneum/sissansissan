"use client"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useFooter } from "@/lib/footer-context"
import { AlertTriangle, CheckCircle, Download, FileText, Mail, MapPin, Phone, Shield, Trash2 } from "lucide-react"

const DATA_DELETION_CONTENT = {
  title: 'Politique de Suppression des Données',
  lastUpdate: 'Décembre 2024',
  sections: [
    {
      title: '1. Introduction',
      icon: Shield,
      content: `Chez Sissan-Sissan, nous respectons votre droit à la vie privée et à la protection de vos données personnelles. Cette politique explique comment vous pouvez demander la suppression de vos données et ce qui se passe lorsque vous le faites.`,
    },
    {
      title: '2. Vos Droits',
      icon: CheckCircle,
      content: `Conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois applicables, vous avez le droit de :`,
      items: [
        'Demander l\'accès à vos données personnelles',
        'Demander la rectification de vos données',
        'Demander la suppression de vos données (droit à l\'oubli)',
        'Demander la limitation du traitement',
        'Vous opposer au traitement de vos données',
        'Demander la portabilité de vos données',
      ],
    },
    {
      title: '3. Comment Supprimer Votre Compte',
      icon: Trash2,
      content: `Vous pouvez supprimer votre compte et toutes les données associées de plusieurs façons :`,
      items: [
        'Via l\'application mobile : Allez dans Profil > Paramètres > Supprimer mon compte',
        'Via notre site web : Connectez-vous et accédez aux paramètres de votre compte',
        'Par email : Envoyez une demande à privacy@sissan-sissan.net',
        'Par courrier : Envoyez une demande écrite à notre adresse postale',
      ],
    },
    {
      title: '4. Données Supprimées',
      icon: FileText,
      content: `Lorsque vous demandez la suppression de votre compte, nous supprimons :`,
      items: [
        'Vos informations personnelles (nom, email, téléphone)',
        'Votre photo de profil',
        'Vos adresses enregistrées',
        'Votre liste de souhaits',
        'Vos préférences et paramètres',
        'Votre historique de navigation sur le site et l\'application',
      ],
    },
    {
      title: '5. Données Conservées',
      icon: AlertTriangle,
      content: `Certaines données peuvent être conservées pour des raisons légales ou commerciales légitimes :`,
      items: [
        'Historique des commandes (obligations comptables et fiscales - 10 ans)',
        'Factures et documents de transaction',
        'Données nécessaires pour répondre à des réclamations en cours',
        'Logs de sécurité anonymisés',
      ],
    },
    {
      title: '6. Délai de Traitement',
      icon: FileText,
      content: `Votre demande de suppression sera traitée dans un délai de 30 jours. Vous recevrez une confirmation par email une fois la suppression effectuée. En cas de demande complexe, ce délai peut être étendu à 60 jours, auquel cas vous en serez informé.`,
    },
    {
      title: '7. Conséquences de la Suppression',
      icon: AlertTriangle,
      content: `La suppression de votre compte est irréversible. Après la suppression :`,
      items: [
        'Vous ne pourrez plus accéder à votre compte',
        'Vos commandes en cours seront annulées',
        'Vos points de fidélité seront perdus',
        'Vous devrez créer un nouveau compte pour utiliser nos services',
      ],
    },
  ],
}

export default function DataDeletionPage() {
  const { footerData } = useFooter()

  const generatePDF = async () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour télécharger le document')
      return
    }

    const companyName = "Sissan-Sissan"
    const date = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    let htmlContent = ''
    DATA_DELETION_CONTENT.sections.forEach(section => {
      htmlContent += `<h2 class="section">${section.title}</h2>`
      htmlContent += `<p>${section.content}</p>`
      if (section.items) {
        htmlContent += '<ul>'
        section.items.forEach(item => {
          htmlContent += `<li>${item}</li>`
        })
        htmlContent += '</ul>'
      }
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Politique de Suppression des Données - ${companyName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.8;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 60px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #F97316;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #F97316;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .date {
            font-size: 14px;
            color: #666;
          }
          h2.section {
            font-size: 18px;
            color: #333;
            margin: 25px 0 15px;
            padding-left: 15px;
            border-left: 4px solid #F97316;
          }
          p {
            margin-bottom: 15px;
            text-align: justify;
          }
          ul {
            margin-bottom: 15px;
            padding-left: 20px;
          }
          li {
            margin-left: 30px;
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #888;
          }
          @media print {
            body {
              padding: 20px 40px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SISSAN-SISSAN</div>
          <h1 class="title">Politique de Suppression des Données</h1>
          <p class="date">Document généré le ${date}</p>
        </div>
        
        <div class="content">
          ${htmlContent}
        </div>
        
        <div class="footer">
          <p>${companyName} - ${footerData.contactInfo?.email || 'support@sissan-sissan.net'}</p>
          <p>${footerData.contactInfo?.address || 'Bamako, Mali / Golonina - derrière l\'ORTM'}</p>
          <p>© ${new Date().getFullYear()} ${companyName}. Tous droits réservés.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print()
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{DATA_DELETION_CONTENT.title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nous respectons votre droit à la vie privée. Découvrez comment demander la suppression de vos données personnelles.
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center mb-8">
            <Button 
              onClick={generatePDF}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white gap-2"
              size="lg"
            >
              <Download className="w-5 h-5" />
              Télécharger en PDF
            </Button>
          </div>

          {/* Content Card */}
          <Card className="p-6 sm:p-8 md:p-10 shadow-lg">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <FileText className="w-5 h-5 text-[#F97316]" />
              <span className="text-sm text-muted-foreground">
                Dernière mise à jour : {DATA_DELETION_CONTENT.lastUpdate}
              </span>
            </div>
            
            <div className="space-y-8">
              {DATA_DELETION_CONTENT.sections.map((section, index) => {
                const Icon = section.icon
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F97316]/10">
                        <Icon className="w-5 h-5 text-[#F97316]" />
                      </div>
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed pl-12">
                      {section.content}
                    </p>
                    {section.items && (
                      <ul className="space-y-2 pl-12">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-[#F97316] mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Contact Section */}
          <Card className="mt-8 p-6 sm:p-8 bg-muted/50">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#F97316]" />
              Contact pour la suppression des données
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:support@sissan-sissan.net" className="text-[#F97316] hover:underline">
                    support@sissan-sissan.net
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-muted-foreground">+223 78 80 51 51</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-muted-foreground">Bamako, Mali / Golonina - derrière l&apos;ORTM</p>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Vous souhaitez supprimer votre compte ? Connectez-vous pour accéder aux paramètres de suppression.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/account'}
              >
                Mon compte
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/contact'}
              >
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
