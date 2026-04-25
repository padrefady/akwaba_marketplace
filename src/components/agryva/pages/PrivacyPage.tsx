'use client';

import { Shield } from 'lucide-react';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `JM Services Africa, éditrice de la plateforme agryva, s'engage à protéger la vie privée de ses utilisateurs. La présente Politique de confidentialité décrit les types de données personnelles que nous collectons, comment nous les utilisons, et les mesures que nous prenons pour les protéger.

Cette politique est conforme aux principes de protection des données de l'Union Africaine et aux bonnes pratiques internationales en matière de confidentialité, adaptées au contexte législatif camerounais.

En utilisant agryva, vous consentez à la collecte et au traitement de vos données personnelles selon les modalités décrites ci-après.`,
  },
  {
    id: 'donnees',
    title: '2. Données collectées',
    content: `Nous collectons les données suivantes pour le bon fonctionnement de nos services :

Données d'identification :
• Nom complet et prénom
• Adresse email
• Numéro de téléphone
• Localisation (ville, région)
• Photo de profil (optionnelle)

Données de transaction :
• Historique des annonces publiées
• Informations de paiement (traitées de manière sécurisée par nos partenaires)
• Historique des messages échangés

Données techniques :
• Adresse IP
• Type de navigateur et système d'exploitation
• Identifiants de session
• Données de navigation sur la plateforme

Données de localisation :
• Position géographique approximative (avec votre consentement)
• Région de résidence pour le filtrage des annonces`,
  },
  {
    id: 'utilisation',
    title: '3. Utilisation des données',
    content: `Vos données personnelles sont utilisées pour les finalités suivantes :

• Fournir et améliorer nos services de marketplace agricole
• Faciliter la communication entre acheteurs et vendeurs
• Vérifier l'identité des utilisateurs (badge de vérification)
• Traiter les transactions et les paiements
• Envoyer des notifications relatives à vos annonces et messages
• Personnaliser votre expérience sur la plateforme
• Prévenir les fraudes et assurer la sécurité des transactions
• Respecter nos obligations légales et réglementaires
• Améliorer nos services par analyse statistique anonymisée

Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins commerciales.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies & Technologies similaires',
    content: `agryva utilise des cookies et technologies similaires pour :

Cookies essentiels :
• Maintenir votre session de connexion
• Mémoriser vos préférences linguistiques et d'affichage
• Assurer la sécurité de votre navigation

Cookies analytiques :
• Comprendre comment les utilisateurs interagissent avec la plateforme
• Améliorer les performances et l'ergonomie du service
• Mesurer les statistiques d'utilisation globales

Cookies publicitaires :
• Afficher des annonces pertinentes
• Mesurer l'efficacité des campagnes promotionnelles

Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. La désactivation de certains cookies peut affecter les fonctionnalités de la plateforme.`,
  },
  {
    id: 'partage',
    title: '5. Partage des données',
    content: `Vos données peuvent être partagées avec :

Partenaires de paiement :
• Orange Money et MTN Mobile Money pour le traitement des transactions
• PayPal pour les paiements internationaux

Ces partenaires sont tenus par des accords de confidentialité stricts et ne peuvent utiliser vos données que pour les services qui leur sont confiés.

Autorités légales :
• En cas d'obligation légale, nous pouvons être amenés à partager des données avec les autorités compétentes du Cameroun

Prestataires de services :
• Hébergeurs de données pour le stockage sécurisé
• Fournisseurs de services d'analyse pour l'amélioration de la plateforme

Autres utilisateurs :
• Les informations de votre profil public (nom, localisation) sont visibles par les autres utilisateurs
• Vos coordonnées ne sont partagées qu'avec votre consentement explicite`,
  },
  {
    id: 'securite',
    title: '6. Sécurité des données',
    content: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles :

• Chiffrement des données sensibles (mots de passe, informations bancaires) en transit et au repos
• Contrôle d'accès strict aux données personnelles
• Surveillance continue des activités suspectes
• Sauvegardes régulières et sécurisées
• Mises à jour régulières de nos systèmes de sécurité
• Formation de notre équipe aux bonnes pratiques de protection des données

Malgré nos efforts, aucune méthode de transmission sur Internet n'est totalement sûre. Nous ne pouvons garantir une sécurité absolue des données transmises via notre plateforme.`,
  },
  {
    id: 'droits',
    title: '7. Droits des utilisateurs',
    content: `Conformément aux principes de protection des données, vous disposez des droits suivants :

• Droit d'accès : Consulter les données personnelles que nous détenons sur vous
• Droit de rectification : Demander la correction de données inexactes ou incomplètes
• Droit à l'effacement : Demander la suppression de vos données personnelles
• Droit à la portabilité : Recevoir vos données dans un format structuré et courant
• Droit d'opposition : Vous opposer au traitement de vos données pour des raisons légitimes
• Droit de retrait du consentement : Retirer votre consentement à tout moment

Pour exercer ces droits, veuillez nous contacter à jmservicesafrica@gmail.com. Nous nous engageons à répondre à votre demande dans un délai de 30 jours ouvrables.`,
  },
  {
    id: 'contact',
    title: '8. Contact',
    content: `Pour toute question relative à la présente Politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter :

JM Services Africa
📍 Yaoundé, Cameroun
📧 jmservicesafrica@gmail.com
📞 +237 690 650 770

Nous vous encourageons à nous contacter directement pour toute préoccupation concernant la protection de vos données personnelles. Notre équipe se fera un plaisir de vous accompagner.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <Shield className="w-8 h-8 text-emerald-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-gray-500">
          Dernière mise à jour : 1er Janvier 2025
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {section.title}
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">
              {section.content}
            </div>
          </section>
        ))}

        {/* Separator */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} JM Services Africa. Tous droits réservés.
          </p>
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
