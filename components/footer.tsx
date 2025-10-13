"use client"

import type React from "react"
import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "./ui/button"
import { useLocale } from "@/lib/locale-context"
import { useFooter } from "@/lib/footer-context"
import Image from "next/image"

export function Footer() {
  const { t } = useLocale()
  const { footerData } = useFooter()

  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 motion-preset-fade motion-delay-100">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="Zissan-Sissan"
                width={120}
                height={40}
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {footerData.companyDescription}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 hover:text-[#2E5BA8] transition-colors">
                <Phone className="w-4 h-4" />
                <span>{footerData.contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#2E5BA8] transition-colors">
                <Mail className="w-4 h-4" />
                <span>{footerData.contactInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#2E5BA8] transition-colors">
                <MapPin className="w-4 h-4" />
                <span>{footerData.contactInfo.address}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-[#2E5BA8] hover:text-white transition-all hover:scale-110"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-[#F39C12] hover:text-white transition-all hover:scale-110"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-[#2E5BA8] hover:text-white transition-all hover:scale-110"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-[#F39C12] hover:text-white transition-all hover:scale-110"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Help & Support */}
          <div className="motion-preset-fade motion-delay-200">
            <h3 className="font-semibold mb-4 text-lg">{t.footer.helpSupport}</h3>
            <ul className="space-y-3">
              {footerData.helpSupport.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-[#2E5BA8] transition-all inline-block hover:translate-x-1 duration-200 hover:border-b-2 hover:border-[#F39C12]"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="motion-preset-fade motion-delay-300">
            <h3 className="font-semibold mb-4 text-lg">{t.footer.account}</h3>
            <ul className="space-y-3">
              {footerData.accountLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-[#2E5BA8] transition-all inline-block hover:translate-x-1 duration-200 hover:border-b-2 hover:border-[#F39C12]"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App */}
          <div className="motion-preset-fade motion-delay-[400ms]">
            <h3 className="font-semibold mb-3 text-lg text-[#1e293b] dark:text-white">Download App</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Get started in seconds – it&apos;s fast, free, and easy!
            </p>
            
            <div className="space-y-3">
              {/* App Store Button */}
              <Link 
                href={footerData.appDownload.appStoreUrl} 
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105 group"
              >
                <div className=" dark:bg-white p-2 rounded-lg">
                  <Image src="/apple-logo-svgrepo-com.svg" alt="App Store" width={24} height={24} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Download on the</p>
                  <p className="text-sm font-semibold text-[#1e293b] dark:text-white">App Store</p>
                </div>
              </Link>

              {/* Google Play Button */}
              <Link 
                href={footerData.appDownload.googlePlayUrl} 
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105 group"
              >
                <div className="bg-[#1e293b] dark:bg-white p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white dark:text-[#1e293b]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Get it On</p>
                  <p className="text-sm font-semibold text-[#1e293b] dark:text-white">Google Play</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            {footerData.copyrightText} Powered by <Link href={footerData.poweredByUrl} className="text-[#2E5BA8]">{footerData.poweredByText}</Link>
          </p>
          
          {/* Payment Methods */}
          <div className="flex justify-between items-center gap-6 mt-6">
              <p className="text-lg text-muted-foreground mb-2">We Accept</p>
              <div className="flex gap-2 flex-wrap">
                <div className="h-8 px-3  flex items-center justify-center ">
                  <Image src="/moov-money.png" alt="VISA" width={60} height={30} />
                </div>
                <div className="h-8 px-3 flex items-center justify-center ">
                  <Image src="/OM.jpg" alt="Orange Money" width={60} height={30} />
                </div>
                <div className="h-8 px-3 flex items-center justify-center ">
                  <Image src="/Sam.jpg" alt="Orange Money" width={60} height={30} />
                </div>
                <div className="h-8 px-3 flex items-center justify-center ">
                  <Image src="/MasterCard_Logo.svg.png" alt="MASTERCARD" width={60} height={30} />
                </div>
                <div className="h-8 px-3 flex items-center justify-center ">
                  <Image src="/Visa_Inc._logo.svg.png" alt="VISA" width={60} height={30} />
                </div>
              </div>
            </div>
        </div>
      </div>
    </footer>
  )
}
