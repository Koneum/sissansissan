"use client"

import type React from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { useLocale } from "@/lib/locale-context"
import { useFooter } from "@/lib/footer-context"
import Image from "next/image"

export function Footer() {
  const { t } = useLocale()
  const { footerData } = useFooter()

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 mt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      {/* Top Decorative Border */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />

      <div className="relative container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-5">
            <Link href="/" className="inline-block group">
              <Image
                src={footerData.logoUrl || "/logo.png"}
                alt="Logo"
                width={140}
                height={50}
                className="h-10 sm:h-12 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {footerData.companyDescription}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href={`tel:${footerData.contactInfo.phone}`} className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 flex items-center justify-center group-hover:from-orange-500 group-hover:to-pink-500 transition-all">
                  <Phone className="w-4 h-4 group-hover:text-white" />
                </div>
                <span>{footerData.contactInfo.phone}</span>
              </a>
              <a href={`mailto:${footerData.contactInfo.email}`} className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 flex items-center justify-center group-hover:from-orange-500 group-hover:to-pink-500 transition-all">
                  <Mail className="w-4 h-4 group-hover:text-white" />
                </div>
                <span>{footerData.contactInfo.email}</span>
              </a>
              <div className="group flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{footerData.contactInfo.address}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-2">
              {footerData.socialMedia?.facebook && (
                <Link href={footerData.socialMedia.facebook} target="_blank">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25">
                    <Facebook className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              {footerData.socialMedia?.twitter && (
                <Link href={footerData.socialMedia.twitter} target="_blank">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              {footerData.socialMedia?.instagram && (
                <Link href={footerData.socialMedia.instagram} target="_blank">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25">
                    <Instagram className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              {footerData.socialMedia?.linkedin && (
                <Link href={footerData.socialMedia.linkedin} target="_blank">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25">
                    <Linkedin className="w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
              {t.footer.helpSupport}
            </h3>
            <ul className="space-y-3">
              {footerData.helpSupport.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    className="group flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
              {t.footer.account}
            </h3>
            <ul className="space-y-3">
              {footerData.accountLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    className="group flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
              Télécharger l&apos;App
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
              Commencez en quelques secondes – c&apos;est rapide et gratuit !
            </p>
            
            <div className="space-y-3">
              {/* App Store Button */}
              <Link 
                href={footerData.appDownload.appStoreUrl} 
                className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Télécharger sur</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">App Store</p>
                </div>
              </Link>

              {/* Google Play Button */}
              <Link 
                href={footerData.appDownload.googlePlayUrl} 
                className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Disponible sur</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Google Play</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-300/50 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>
                {footerData.copyrightText} Powered by{" "}
                <Link href={footerData.poweredByUrl} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 hover:underline">
                  {footerData.poweredByText}
                </Link>
              </span>
            </div>
            
            {/* Payment Methods */}
            {footerData.paymentMethods && footerData.paymentMethods.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nous acceptons</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {footerData.paymentMethods.map((method: any, index: number) => (
                    <div 
                      key={index} 
                      className="h-8 px-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-orange-500/50 transition-colors"
                    >
                      <Image 
                        src={method.image || method} 
                        alt={method.name || "Payment Method"} 
                        width={50} 
                        height={25} 
                        className="w-auto h-5 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}




