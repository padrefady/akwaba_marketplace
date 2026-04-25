'use client';

import { FileText } from 'lucide-react';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `Bienvenue sur agryva, la plateforme de mise en relation agricole au Cameroun, exploitée par JM Services Africa. En accédant et en utilisant notre plateforme, vous acceptez d'être lié par les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.

agryva est une marketplace dédiée à la connexion entre agriculteurs, éleveurs, pêcheurs, transformateurs et acheteurs à travers les dix régions du Cameroun. Notre mission est de faciliter les échanges commerciaux agricoles de manière sécurisée et transparente.`,
  },
  {
    id: 'inscription',
    title: '2. Inscription & Comptes',
    content: `Pour utiliser pleinement nos services, vous devez créer un compte en fournissant des informations exactes et à jour. Lors de votre inscription, vous vous engagez à :

• Fournir des informations d'identification véridiques (nom complet, numéro de téléphone, localisation)
• Ne pas créer de comptes multiples ou frauduleux
• Maintenir la confidentialité de vos identifiants de connexion
• Nous informer immédiatement de toute utilisation non autorisée de votre compte
• Mettre à jour vos informations personnelles en cas de changement

Les comptes sont strictement personnels et ne peuvent être cédés à des tiers sans autorisation préalable de JM Services Africa. Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de non-respect de ces conditions.`,
  },
  {
    id: 'annonces',
    title: '3. Annonces',
    content: `Les utilisateurs peuvent publier des annonces relatives à des produits et services agricoles. Les annonces doivent respecter les règles suivantes :

• Décrire fidèlement les produits ou services proposés (nature, quantité, qualité, prix)
• Indiquer un prix en Francs CFA (FCFA)
• Spécifier la localisation exacte du produit ou service
• Ne pas publier de produits illégaux, dangereux ou interdits par la législation camerounaise
• Ne pas inclure de fausses déclarations ou de publicités trompeuses
• Respecter les catégories définies par la plateforme

agryva se réserve le droit de modifier, suspendre ou supprimer toute annonce qui ne respecte pas ces règles, sans préavis ni compensation. Les annonces en vedette sont soumises à des conditions tarifaires spécifiques.`,
  },
  {
    id: 'transactions',
    title: '4. Transactions & Paiements',
    content: `agryva facilite la mise en relation entre vendeurs et acheteurs. Les transactions s'effectuent directement entre les parties, sauf indication contraire.

Modes de paiement acceptés sur la plateforme :
• Orange Money
• MTN Mobile Money (MoMo)
• PayPal (pour les transactions internationales)

Les vendeurs s'engagent à :
• Livrer les produits conformément à la description de l'annonce
• Respecter les conditions de vente convenues avec l'acheteur
• Fournir les documents légaux requis pour les transactions commerciales

agryva n'est pas partie aux transactions entre utilisateurs et ne saurait être tenue responsable des litiges liés aux paiements ou à la livraison. Cependant, nous mettons à disposition un système de signalement pour les transactions problématiques.`,
  },
  {
    id: 'propriete',
    title: '5. Propriété intellectuelle',
    content: `Tout le contenu de la plateforme agryva, y compris mais sans s'y limiter : le nom "agryva", les logos, les designs, les textes, les graphiques, les interfaces et le code source, est la propriété exclusive de JM Services Africa et est protégé par les lois camerounaises et internationales relatives à la propriété intellectuelle.

Les utilisateurs accordent à agryva une licence non-exclusive, mondiale, royaltie-free pour utiliser, reproduire et afficher le contenu qu'ils publient sur la plateforme dans le cadre de la fourniture des services.

Il est strictement interdit de :
• Copier, modifier ou redistribuer le contenu de la plateforme sans autorisation
• Utiliser la marque "agryva" à des fins commerciales sans accord écrit
• Extraire les données de la plateforme par des moyens automatisés`,
  },
  {
    id: 'responsabilite',
    title: '6. Responsabilité',
    content: `agryva agit en tant qu'intermédiaire entre les utilisateurs et ne garantit pas :

• La qualité, la sécurité ou la conformité des produits et services proposés par les vendeurs
• L'exactitude des informations publiées dans les annonces
• Le bon déroulement des transactions entre utilisateurs
• La disponibilité continue et sans interruption de la plateforme

JM Services Africa ne saurait être tenue responsable des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation de la plateforme. L'utilisateur utilise les services à ses propres risques.

agryva s'efforce de maintenir un environnement sécurisé mais ne peut garantir l'absence totale de risques liés aux transactions en ligne.`,
  },
  {
    id: 'resiliation',
    title: '7. Résiliation',
    content: `Vous pouvez résilier votre compte à tout moment en contactant notre service client ou via les paramètres de votre compte. La résiliation entraîne la suppression de vos données personnelles conformément à notre Politique de confidentialité, sous réserve des obligations légales de conservation.

agryva se réserve le droit de suspendre ou résilier votre compte en cas de :
• Violation des présentes conditions d'utilisation
• Activité frauduleuse ou suspecte
• Harcèlement envers d'autres utilisateurs
• Publication de contenus illicites
• Non-respect des lois et règlements en vigueur au Cameroun

En cas de résiliation pour faute, les abonnements en cours ne seront pas remboursés.`,
  },
  {
    id: 'modifications',
    title: '8. Modifications',
    content: `JM Services Africa se réserve le droit de modifier les présentes Conditions d'utilisation à tout moment. Les modifications seront publiées sur cette page et, le cas échéant, notifiées aux utilisateurs par email ou via la plateforme.

Les modifications prennent effet dès leur publication. L'utilisation continue de la plateforme après la publication des modifications constitue une acceptation des nouvelles conditions.

Nous encourageons les utilisateurs à consulter régulièrement cette page pour rester informés des éventuels changements.`,
  },
  {
    id: 'droit',
    title: '9. Droit applicable',
    content: `Les présentes Conditions d'utilisation sont régies par les lois de la République du Cameroun. Tout litige découlant de l'utilisation de la plateforme sera soumis à la compétence exclusive des tribunaux du Centre, à Yaoundé, Cameroun.

En cas de contradiction entre les présentes conditions et une disposition légale impérative applicable au Cameroun, la disposition légale prévaudra.

Pour toute question concernant ces conditions, veuillez nous contacter à :
• Email : jmservicesafrica@gmail.com
• Téléphone : +237 690 650 770
• Adresse : Yaoundé, Cameroun`,
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <FileText className="w-8 h-8 text-emerald-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Conditions d&apos;utilisation
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
