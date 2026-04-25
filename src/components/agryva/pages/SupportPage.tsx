'use client';

import { useState } from 'react';
import {
  Headphones,
  Search,
  UserPlus,
  Package,
  CreditCard,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Send,
} from 'lucide-react';

const helpCategories = [
  {
    icon: UserPlus,
    title: 'Compte & Inscription',
    description:
      'Créer un compte, modifier votre profil, vérification et sécurité de votre compte.',
    color: 'bg-emerald-100 text-emerald-700',
    questions: [
      'Comment créer un compte ?',
      'J\'ai oublié mon mot de passe',
      'Comment vérifier mon compte ?',
      'Modifier mes informations personnelles',
    ],
  },
  {
    icon: Package,
    title: 'Annonces & Ventes',
    description:
      'Publier, modifier ou supprimer une annonce, gérer vos ventes et vos produits.',
    color: 'bg-orange-100 text-orange-600',
    questions: [
      'Comment publier une annonce ?',
      'Modifier ou supprimer mon annonce',
      'Comprendre les formules tarifaires',
      'Renouveler une annonce expirée',
    ],
  },
  {
    icon: CreditCard,
    title: 'Paiements & Transactions',
    description:
      'Modes de paiement, problèmes de transaction, facturation et abonnements.',
    color: 'bg-blue-100 text-blue-700',
    questions: [
      'Modes de paiement acceptés',
      'Mon paiement a échoué',
      'Annuler un abonnement',
      'Demander un remboursement',
    ],
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <Headphones className="w-8 h-8 text-emerald-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Aide & Support
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Nous sommes là pour vous aider. Trouvez des réponses ou contactez notre équipe.
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les articles d'aide..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
        {searchQuery && (
          <p className="mt-4 text-sm text-gray-500">
            Aucun résultat trouvé pour « <span className="font-medium text-gray-700">{searchQuery}</span> ». Essayez un autre terme ou{' '}
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-600 hover:underline"
            >
              effacez la recherche
            </button>
            .
          </p>
        )}
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        {helpCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${category.color} mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {category.description}
              </p>
              <ul className="space-y-2">
                {category.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Nous contacter
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Email</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  jmservicesafrica@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Téléphone</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  +237 690 650 770
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Horaires</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  Lun - Ven, 8h - 18h
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Heure de Yaoundé (GMT+1)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">WhatsApp</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  +237 690 650 770
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Réponse rapide en messagerie
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="support-name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Nom complet
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="support-email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="support-subject"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Sujet
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Objet de votre demande"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="support-message"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Décrivez votre problème ou votre question..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-emerald-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <Send className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Message envoyé !
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 heures ouvrables.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormName('');
                    setFormEmail('');
                    setFormSubject('');
                    setFormMessage('');
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Envoyer un autre message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="text-center mt-8">
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
        >
          ← Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}
