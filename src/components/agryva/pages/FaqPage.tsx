'use client';

import { HelpCircle, MessageCircle, Headphones } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'Comment créer un compte sur agryva ?',
    answer:
      'Pour créer un compte, téléchargez l\'application agryva ou visitez notre site web. Cliquez sur "S\'inscrire", puis renseignez votre nom complet, numéro de téléphone, adresse email et un mot de passe. Vous recevrez un code de vérification par SMS pour activer votre compte. L\'inscription est gratuite et ne prend que quelques minutes.',
  },
  {
    question: 'Comment publier une annonce ?',
    answer:
      'Une fois connecté, accédez à la section "Publier une annonce". Sélectionnez la catégorie de votre produit (cultures maraîchères, céréales, tubercules, bétail, etc.), ajoutez des photos, rédigez une description détaillée, indiquez le prix en FCFA et précisez votre localisation. Votre annonce sera visible après validation par notre équipe, généralement sous 24 heures.',
  },
  {
    question: 'Quels sont les tarifs des annonces ?',
    answer:
      'agryva propose trois formules :\n\n• Gratuit : 2 annonces par mois avec publication standard\n• Premium (5 000 FCFA/mois) : jusqu\'à 20 annonces, mise en avant et badge Premium\n• VIP (15 000 FCFA/mois) : annonces illimitées, priorité en tête des résultats, badge VIP vérifié, support prioritaire\n\nLe paiement peut se faire via Orange Money, MTN MoMo ou PayPal.',
  },
  {
    question: 'Quels modes de paiement sont acceptés ?',
    answer:
      'agryva accepte les modes de paiement suivants :\n\n• Orange Money : Envoyez le paiement au numéro dédié et saisissez le code de confirmation\n• MTN Mobile Money : Même procédure qu\'Orange Money via le service MoMo\n• PayPal : Pour les paiements internationaux et les abonnements\n\nToutes les transactions sont sécurisées et chiffrées.',
  },
  {
    question: 'Comment fonctionne la messagerie agryva ?',
    answer:
      'La messagerie intégrée vous permet de communiquer directement avec les acheteurs et vendeurs sans partager vos coordonnées personnelles. Vous pouvez envoyer des messages texte, des photos de produits et négocier les prix en toute sécurité. Un système de notification vous alerte dès qu\'un nouveau message est reçu.',
  },
  {
    question: 'Mes transactions sont-elles sécurisées ?',
    answer:
      'Oui, agryva met en place plusieurs mesures de sécurité :\n\n• Vérification des profils vendeurs avec badge de confiance\n• Système de signalement pour les comportements suspects\n• Messagerie interne protégée pour les négociations\n• Support client disponible pour résoudre les litiges\n\nNous vous recommandons toutefois de toujours vérifier les produits en personne avant le paiement final et d\'utiliser les modes de paiement sécurisés de la plateforme.',
  },
  {
    question: 'Quelles régions du Cameroun sont couvertes ?',
    answer:
      'agryva couvre l\'ensemble des 10 régions du Cameroun :\n\n• Adamaoua • Centre • Est • Extrême-Nord • Littoral\n• Nord • Nord-Ouest • Ouest • Sud • Sud-Ouest\n\nOù que vous soyez au Cameroun, vous pouvez publier ou rechercher des produits agricoles. Notre filtre géographique vous permet de trouver des offres proches de vous.',
  },
  {
    question: 'Comment devenir un vendeur vérifié ?',
    answer:
      'Pour obtenir le badge de vérification, vous devez :\n\n1. Avoir un compte actif depuis au moins 30 jours\n2. Avoir publié au moins 5 annonces\n3. Soumettre une pièce d\'identité valide (carte nationale d\'identité ou passeport)\n4. Avoir un historique positif (pas de signalement)\n\nUne fois vérifié, vous bénéficierez d\'une visibilité accrue et de la confiance des acheteurs. Le processus est gratuit.',
  },
  {
    question: 'Combien de temps une annonce reste-t-elle en ligne ?',
    answer:
      'La durée de validité dépend de votre formule :\n\n• Formule Gratuite : 30 jours par annonce\n• Formule Premium : 60 jours par annonce\n• Formule VIP : 90 jours par annonce\n\nVous pouvez renouveler votre annonce gratuitement avant son expiration. Les annonces expirées sont automatiquement archivées et peuvent être republiées.',
  },
  {
    question: 'Puis-je modifier ou supprimer mon annonce ?',
    answer:
      'Oui, vous pouvez modifier ou supprimer votre annonce à tout moment depuis votre espace personnel. Accédez à "Mes annonces", sélectionnez l\'annonce concernée et cliquez sur "Modifier" ou "Supprimer". Les modifications sont prises en compte après une nouvelle validation par notre équipe.',
  },
  {
    question: 'Comment contacter le support client ?',
    answer:
      'Vous pouvez joindre notre support client par :\n\n• Email : jmservicesafrica@gmail.com\n• Téléphone : +237 690 650 770\n• WhatsApp : +237 690 650 770\n• Formulaire de contact dans la section Aide & Support\n\nNotre équipe est disponible du lundi au vendredi, de 8h à 18h (heure de Yaoundé). Les utilisateurs Premium et VIP bénéficient d\'un support prioritaire.',
  },
  {
    question: 'agryva est-il gratuit pour les acheteurs ?',
    answer:
      'Oui, agryva est entièrement gratuit pour les acheteurs. Vous pouvez parcourir les annonces, contacter les vendeurs et utiliser la messagerie sans aucun frais. Seuls les vendeurs qui souhaitent publier des annonces supplémentaires ou bénéficier de fonctionnalités avancées souscrivent à nos formules payantes.',
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <HelpCircle className="w-8 h-8 text-emerald-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Questions fréquentes
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Trouvez les réponses aux questions les plus posées sur agryva. Si vous ne trouvez pas ce que vous cherchez, n&apos;hésitez pas à nous contacter.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 mb-10">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-[15px] font-medium text-gray-900 hover:text-emerald-700 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-line">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-orange-50 rounded-2xl p-6 md:p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-4">
          <MessageCircle className="w-7 h-7 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Vous n&apos;avez pas trouvé votre réponse ?
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Notre équipe de support est disponible pour répondre à toutes vos questions et vous accompagner.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
          >
            <Headphones className="w-4 h-4" />
            Accéder au support
          </button>
          <a
            href="mailto:jmservicesafrica@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl font-medium transition-colors"
          >
            Envoyer un email
          </a>
        </div>
      </div>

      {/* Back button */}
      <div className="text-center mt-8">
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          ← Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}
