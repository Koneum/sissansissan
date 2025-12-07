"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Shield, FileText } from "lucide-react"
import { usePages } from "@/lib/pages-context"
import { useFooter } from "@/lib/footer-context"
import { useLocale } from "@/lib/locale-context"

export default function PrivacyPolicyPage() {
  const { pagesData } = usePages()
  const { footerData } = useFooter()
  const { t } = useLocale()

  const generatePDF = async () => {
    // Create a printable version of the privacy policy
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour télécharger le document')
      return
    }

    const content = pagesData.privacyPolicy
    const companyName = "Sissan-Sissan"
    const date = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Convert markdown-like content to HTML
    const htmlContent = content
      .replace(/^# (.+)$/gm, '<h1 class="title">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="section">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="subsection">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Politique de Confidentialité - ${companyName}</title>
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
          h1.title {
            font-size: 22px;
            color: #1a1a1a;
            margin: 30px 0 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          h2.section {
            font-size: 18px;
            color: #333;
            margin: 25px 0 15px;
            padding-left: 15px;
            border-left: 4px solid #F97316;
          }
          h3.subsection {
            font-size: 16px;
            color: #444;
            margin: 20px 0 10px;
          }
          p {
            margin-bottom: 15px;
            text-align: justify;
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
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SISSAN-SISSAN</div>
          <h1 class="title">Politique de Confidentialité</h1>
          <p class="date">Document généré le ${date}</p>
        </div>
        
        <div class="content">
          <p>${htmlContent}</p>
        </div>
        
        <div class="footer">
          <p>${companyName} - ${footerData.contactInfo?.email || 'contact@sissan.com'}</p>
          <p>${footerData.contactInfo?.address || ''}</p>
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

  // Parse content for display
  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let currentList: string[] = []
    let key = 0

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${key++}`} className="list-disc list-inside space-y-2 ml-4 mb-4 text-muted-foreground">
            {currentList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
        currentList = []
      }
    }

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith('# ')) {
        flushList()
        elements.push(
          <h1 key={key++} className="text-3xl font-bold mt-8 mb-4 text-foreground">
            {trimmedLine.substring(2)}
          </h1>
        )
      } else if (trimmedLine.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={key++} className="text-2xl font-semibold mt-6 mb-3 text-foreground border-b pb-2">
            {trimmedLine.substring(3)}
          </h2>
        )
      } else if (trimmedLine.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={key++} className="text-xl font-semibold mt-5 mb-2 text-foreground">
            {trimmedLine.substring(4)}
          </h3>
        )
      } else if (trimmedLine.startsWith('- ')) {
        currentList.push(trimmedLine.substring(2))
      } else if (trimmedLine === '') {
        flushList()
      } else {
        flushList()
        elements.push(
          <p key={key++} className="text-muted-foreground mb-4 leading-relaxed">
            {trimmedLine}
          </p>
        )
      }
    })

    flushList()
    return elements
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F97316]/10 mb-4">
              <Shield className="w-8 h-8 text-[#F97316]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Politique de Confidentialité</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nous nous engageons à protéger votre vie privée et vos données personnelles.
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
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {renderContent(pagesData.privacyPolicy)}
            </div>
          </Card>

          {/* Contact Section */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Des questions concernant notre politique de confidentialité ?
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/contact'}
            >
              Nous contacter
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
