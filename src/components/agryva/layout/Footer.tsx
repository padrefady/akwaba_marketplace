'use client'

import { Leaf, Mail, Phone, Facebook, Twitter, Instagram, Shield, CreditCard, Megaphone } from 'lucide-react'
import { useAppStore } from '@/components/agryva/store'
import { useT } from '@/lib/i18n'

const categories = [
  'Céréales',
  'Légumineuses',
  'Tubercules & Racines',
  'Fruits & Légumes',
  'Bétail & Volaille',
  'Poissons & Produits de la Mer',
  'Produits Forestiers',
  'Engrais & Intrants',
  'Équipements & Machineries',
  'Services Agricoles',
  'Terres & Propriétés',
  'Aliments Transformés',
]

const paymentMethods = [
  { name: 'Orange Money', color: 'bg-orange-500', letter: 'OM' },
  { name: 'MTN MoMo', color: 'bg-yellow-500', letter: 'Mo' },
  { name: 'Carte bancaire', color: 'bg-gray-600', letter: 'CB' },
  { name: 'PayPal', color: 'bg-blue-600', letter: 'PP' },
]

export function Footer() {
  const { navigateTo } = useAppStore()
  const { t } = useT()

  const usefulLinks = [
    { label: t('footer.terms'), page: 'terms' as const },
    { label: t('footer.privacy'), page: 'privacy' as const },
    { label: t('footer.faq'), page: 'faq' as const },
    { label: t('footer.support'), page: 'support' as const },
  ]

  return (
    <footer className="mt-auto border-t bg-emerald-950 text-gray-300 hidden md:block">
      {/* Ad Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  {t('footer.banner')}
                </p>
                <p className="text-xs text-orange-100">
                  {t('footer.bannerDesc')}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('register')}
              className="shrink-0 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-orange-600 shadow-md hover:bg-orange-50 transition-colors"
            >
              {t('footer.registerNow')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* À propos */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-lg font-bold text-white">Agr</span>
                <span className="text-lg font-bold text-orange-400">y</span>
                <span className="text-lg font-bold text-white">va</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              {t('footer.about')}
            </p>
            {/* Social Icons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.open('https://facebook.com', '_blank')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 text-gray-400 transition-colors hover:bg-emerald-800 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button
                onClick={() => window.open('https://twitter.com', '_blank')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 text-gray-400 transition-colors hover:bg-emerald-800 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                onClick={() => window.open('https://instagram.com', '_blank')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 text-gray-400 transition-colors hover:bg-emerald-800 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-orange-400">
              {t('footer.categories')}
            </h3>
            <ul className="space-y-2">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() =>
                      navigateTo('ads', { category: cat.toLowerCase() })
                    }
                    className="text-sm text-gray-400 transition-colors hover:text-orange-400"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-orange-400">
              {t('footer.usefulLinks')}
            </h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigateTo(link.page)}
                    className="text-sm text-gray-400 transition-colors hover:text-orange-400"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-orange-400">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">jmservicesafrica@gmail.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">+237 690 650 770</p>
                  <p className="text-xs text-gray-500">Lun - Ven, 8h - 18h</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">
                    Yaoundé, Centre, Cameroun
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Security Section */}
      <div className="border-t border-emerald-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">{t('footer.securePayment')}</span>
            </div>
            <div className="flex items-center gap-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.name}
                  className="flex h-9 items-center gap-1.5 rounded-md bg-emerald-900 px-3"
                  title={pm.name}
                >
                  <CreditCard className={`h-4 w-4 text-gray-500`} />
                  <span className="text-xs font-medium text-gray-400">{pm.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            {t('footer.copyright')}
          </p>
          <p className="text-xs text-gray-500">
            {t('footer.madeWith')}
          </p>
        </div>
      </div>
    </footer>
  )
}
