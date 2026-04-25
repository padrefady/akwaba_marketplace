import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting agryva database seed...\n");

  // Clean existing data (order matters due to relations)
  console.log("🧹 Cleaning existing data...");
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.paymentPlan.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Data cleaned\n");

  // ========================
  // 1. SEED CATEGORIES
  // ========================
  console.log("📦 Seeding categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Céréales",
        icon: "Wheat",
        slug: "cereales",
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Légumineuses",
        icon: "Bean",
        slug: "legumineuses",
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Tubercules & Racines",
        icon: "Carrot",
        slug: "tubercules",
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Fruits & Légumes",
        icon: "Apple",
        slug: "fruits-legumes",
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Bétail & Volaille",
        icon: "Cow",
        slug: "betail-volaille",
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: "Poissons & Produits de la Mer",
        icon: "Fish",
        slug: "poissons",
        order: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: "Produits Forestiers",
        icon: "TreePine",
        slug: "produits-forestiers",
        order: 7,
      },
    }),
    prisma.category.create({
      data: {
        name: "Engrais & Intrants",
        icon: "FlaskConical",
        slug: "engrais-intrants",
        order: 8,
      },
    }),
    prisma.category.create({
      data: {
        name: "Équipements & Machineries",
        icon: "Tractor",
        slug: "equipements",
        order: 9,
      },
    }),
    prisma.category.create({
      data: {
        name: "Services Agricoles",
        icon: "Wrench",
        slug: "services-agricoles",
        order: 10,
      },
    }),
    prisma.category.create({
      data: {
        name: "Terres & Propriétés",
        icon: "MapPin",
        slug: "terres",
        order: 11,
      },
    }),
    prisma.category.create({
      data: {
        name: "Aliments Transformés",
        icon: "Package",
        slug: "aliments-transformes",
        order: 12,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories seeded\n`);

  // ========================
  // 2. SEED PAYMENT PLANS
  // ========================
  console.log("💳 Seeding payment plans...");
  const plans = await Promise.all([
    prisma.paymentPlan.create({
      data: {
        name: "FREE",
        displayName: "Gratuit",
        price: 0,
        maxAds: 2,
        features: JSON.stringify([
          "2 annonces gratuites",
          "Espace publicitaire visible",
          "Messagerie illimitée",
          "Profil basique",
        ]),
        isPopular: false,
      },
    }),
    prisma.paymentPlan.create({
      data: {
        name: "PREMIUM",
        displayName: "Premium",
        price: 5000,
        maxAds: 50,
        features: JSON.stringify([
          "50 annonces maximum",
          "Sans publicité",
          "Annonces mises en avant",
          "Messagerie illimitée",
          "Badge Premium",
          "Support prioritaire",
        ]),
        isPopular: true,
      },
    }),
    prisma.paymentPlan.create({
      data: {
        name: "VIP",
        displayName: "VIP",
        price: 15000,
        maxAds: 999,
        features: JSON.stringify([
          "Annonces illimitées",
          "Sans publicité",
          "Annonces toujours en vedette",
          "Assistance IA (recommandations, traduction, analyse)",
          "Messagerie illimitée",
          "Badge VIP",
          "Support dédié 24/7",
          "Statistiques avancées",
        ]),
        isPopular: false,
      },
    }),
  ]);
  console.log(`✅ ${plans.length} payment plans seeded\n`);

  // ========================
  // 3. SEED USERS & ADS
  // ========================
  console.log("👥 Seeding demo users & ads...");

  const password = await hashPassword("Demo1234!");

  // Create demo users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "jean.mbi@gmail.com",
        password,
        name: "Jean Mbi Assoumou",
        phone: "+237 6 99 88 77 01",
        bio: "Agriculteur depuis 15 ans, spécialisé dans la production de plantains et de maïs dans la région du Centre.",
        location: "Nkolbisson, Yaoundé",
        region: "Centre",
        city: "Yaoundé",
        role: "SELLER",
        plan: "PREMIUM",
        isVerified: true,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "marie.tchinda@yahoo.fr",
        password,
        name: "Marie Tchinda",
        phone: "+237 6 55 44 33 02",
        bio: "Commerçante en produits agricoles, approvisionnement en gros pour les restaurants et hôtels à Douala.",
        location: "Bonabéri, Douala",
        region: "Littoral",
        city: "Douala",
        role: "BUYER",
        plan: "FREE",
        isVerified: true,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "paul.fofey@hotmail.com",
        password,
        name: "Paul Fofey Nkou",
        phone: "+237 6 77 66 55 03",
        bio: "Éleveur de volailles à Bafoussam, vente de poulets de chair et d'œufs frais. Livraison disponible.",
        location: "Bafoussam, Ouest",
        region: "Ouest",
        city: "Bafoussam",
        role: "SELLER",
        plan: "PREMIUM",
        isVerified: true,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: " grace.achu@gmail.com",
        password,
        name: "Grace Achu Fru",
        phone: "+237 6 33 22 11 04",
        bio: "Fermière piscicole à Buéa, élevage de tilapias et de crevettes. Poissons frais livrés quotidiennement.",
        location: "Bokova, Buéa",
        region: "Sud-Ouest",
        city: "Buéa",
        role: "SELLER",
        plan: "VIP",
        isVerified: true,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "emmanuel.nganou@gmail.com",
        password,
        name: "Emmanuel Nganou Djameni",
        phone: "+237 6 11 00 99 05",
        bio: "Ingénieur agronome et consultant. Services de conseil agricole, analyse des sols, et formation des agriculteurs.",
        location: "Nkwen, Bamenda",
        region: "Nord-Ouest",
        city: "Bamenda",
        role: "BOTH",
        plan: "VIP",
        isVerified: true,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "clarisse.ndongo@outlook.com",
        password,
        name: "Clarisse Ndongo Mbarga",
        phone: "+237 6 88 77 66 06",
        bio: "Fermière spécialisée dans la culture du manioc et du macabo. Production de bâtons de manioc et gari.",
        location: "Mbalmayo",
        region: "Centre",
        city: "Mbalmayo",
        role: "SELLER",
        plan: "FREE",
        isVerified: true,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "alain.kamga@gmail.com",
        password,
        name: "Alain Kamga Fotso",
        phone: "+237 6 44 33 22 07",
        bio: "Fournisseur d'équipements agricoles et d'engrais. Livraison dans toutes les régions du Cameroun.",
        location: "Makepe, Douala",
        region: "Littoral",
        city: "Douala",
        role: "SELLER",
        plan: "PREMIUM",
        isVerified: true,
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "issouf.abba@gmail.com",
        password,
        name: "Issouf Abba Mahamat",
        phone: "+237 6 22 11 00 08",
        bio: "Céréalier de l'Extrême-Nord. Production et vente de mil, sorgho et arachides en grande quantité.",
        location: "Maroua",
        region: "Extrême-Nord",
        city: "Maroua",
        role: "SELLER",
        plan: "PREMIUM",
        isVerified: true,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "veronica.esimi@gmail.com",
        password,
        name: "Veronica Esimi",
        phone: "+237 6 99 00 11 09",
        bio: "Propriétaire de terres agricoles dans la région du Sud. Location et vente de parcelles fertiles.",
        location: "Kribi",
        region: "Sud",
        city: "Kribi",
        role: "SELLER",
        plan: "FREE",
        isVerified: false,
        isOnline: false,
      },
    }),
    prisma.user.create({
      data: {
        email: "bertrand.tagne@gmail.com",
        password,
        name: "Bertrand Tagné Fotso",
        phone: "+237 6 55 66 77 10",
        bio: "Transformateur de produits agricoles. Production d'huile de palme, de beurre de karité et de café moulu.",
        location: "Dschang",
        region: "Ouest",
        city: "Dschang",
        role: "SELLER",
        plan: "PREMIUM",
        isVerified: true,
        isOnline: true,
      },
    }),
  ]);
  console.log(`✅ ${users.length} demo users created\n`);

  // Seed ads
  const adsData = [
    // Ad 1: Plantains (OFFER)
    {
      authorId: users[0].id,
      title: "Régimes de plantains mûrs disponibles — Livraison à Yaoundé",
      description:
        "Vente de régimes de plantains mûrs directement de la ferme à Nkolbisson. Récoltés ce matin, qualité premium. Idéal pour les vendeurs de alloco, les restaurants et les ménages. Prix dégressif à partir de 20 régimes. Livraison gratuite dans Yaoundé pour commande de 50+ régimes.",
      price: 2500,
      priceUnit: "régime",
      type: "OFFER",
      categorySlug: "fruits-legumes",
      condition: "FRESH",
      quantity: "Plus de 200 régimes disponibles",
      location: "Nkolbisson, Yaoundé",
      region: "Centre",
      city: "Yaoundé",
      images: JSON.stringify(["/seed/ad-plantains.png"]),
      status: "ACTIVE",
      isFeatured: true,
      isUrgent: false,
      viewsCount: 347,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["plantain", "alloco", "mûr", "yaoundé", "livraison"]),
    },
    // Ad 2: Maize / Maïs (DEMAND)
    {
      authorId: users[1].id,
      title: "Recherche maïs en gros — 5 tonnes minimum pour approvisionnement",
      description:
        "Je recherche un fournisseur fiable de maïs sec en grande quantité pour l'approvisionnement de ma chaîne de restaurants à Douala. Le maïs doit être bien séché, sans moisissure, et emballé dans des sacs de 50kg. Je peux prendre jusqu'à 10 tonnes par mois. Paiement rapide par MTN Mobile Money ou virement bancaire.",
      price: null,
      priceUnit: null,
      type: "DEMAND",
      categorySlug: "cereales",
      condition: null,
      quantity: "5 à 10 tonnes par mois",
      location: "Bonabéri, Douala",
      region: "Littoral",
      city: "Douala",
      images: JSON.stringify(["/seed/ad-maize.png"]),
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: true,
      viewsCount: 189,
      negociable: true,
      delivery: false,
      tags: JSON.stringify(["maïs", "gros", "restaurant", "douala", "approvisionnement"]),
    },
    // Ad 3: Poulets de chair (OFFER)
    {
      authorId: users[2].id,
      title: "Poulets de chair vifs — Ferme de Bafoussam, 1800 FCFA/pièce",
      description:
        "Élevage de poulets de chair en plein air à Bafoussam. Les poulets sont nourris avec des aliments naturels (sans antibiotiques). Poids moyen: 1.8 - 2.2 kg à 8 semaines. Livraison possible à Bafoussam, Dschang, et Douala (frais supplémentaires). Commandez directement à la ferme ou par téléphone. Réduction de 10% pour commande de 50+ pièces.",
      price: 1800,
      priceUnit: "pièce",
      type: "OFFER",
      categorySlug: "betail-volaille",
      condition: "NEW",
      quantity: "300 têtes disponibles",
      location: "Bafoussam, Ouest",
      region: "Ouest",
      city: "Bafoussam",
      images: JSON.stringify(["/seed/ad-poultry.png"]),
      status: "ACTIVE",
      isFeatured: true,
      isUrgent: false,
      viewsCount: 562,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["poulet", "chair", "volaille", "ferme", "bafoussam"]),
    },
    // Ad 4: Tilapia fish (OFFER)
    {
      authorId: users[3].id,
      title: "Tilapias frais d'élevage — Ferme piscicole de Buéa",
      description:
        "Poissons Tilapia frais de notre ferme piscicole à Bokova, Buéa. Élevés en eau propre sans produits chimiques. Tailles disponibles: petit (300g), moyen (500g), grand (800g+). Livraison quotidienne à Buéa, Limbé, et Tiko. Commandez la veille pour une livraison fraîche le matin. Acceptons commandes pour mariages, funérailles et événements.",
      price: 2000,
      priceUnit: "pièce",
      type: "OFFER",
      categorySlug: "poissons",
      condition: "FRESH",
      quantity: "500+ poissons en stock",
      location: "Bokova, Buéa",
      region: "Sud-Ouest",
      city: "Buéa",
      images: JSON.stringify(["/seed/ad-fish.png"]),
      status: "ACTIVE",
      isFeatured: true,
      isUrgent: false,
      viewsCount: 423,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["tilapia", "poisson", "frais", "buéa", "pisciculture"]),
    },
    // Ad 5: Agricultural consulting (SERVICE)
    {
      authorId: users[4].id,
      title: "Consultant agronome — Analyse des sols, conseil et formation",
      description:
        "Ingénieur agronome avec 10 ans d'expérience propose ses services: analyse de sol et d'eau, recommandations de fertilisation, plans de culture, formation des agriculteurs, diagnostics phytosanitaires. Intervention dans toutes les régions du Nord-Ouest et au-delà. Première consultation gratuite. Devis sur demande. Références disponibles.",
      price: 15000,
      priceUnit: "forfait",
      type: "SERVICE",
      categorySlug: "services-agricoles",
      condition: null,
      quantity: null,
      location: "Nkwen, Bamenda",
      region: "Nord-Ouest",
      city: "Bamenda",
      images: JSON.stringify([]),
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: false,
      viewsCount: 156,
      negociable: true,
      delivery: false,
      tags: JSON.stringify(["agronome", "consultant", "sol", "formation", "analyse"]),
    },
    // Ad 6: Manioc / Cassava (OFFER)
    {
      authorId: users[5].id,
      title: "Manioc frais et bâtons de manioc — Production artisanale",
      description:
        "Vente de manioc frais directement de la ferme à Mbalmayo. Variétés améliorées: 8086 et Macumba. Également disponible: bâtons de manioc (bobolo) préparés artisanalement, gari de qualité supérieure, et fufu de maïs. Prix de gros disponible pour revendeurs et restaurants. Le manioc est récolté le jour de la livraison pour garantir la fraîcheur.",
      price: 500,
      priceUnit: "kg",
      type: "OFFER",
      categorySlug: "tubercules",
      condition: "FRESH",
      quantity: "2 tonnes de manioc disponibles",
      location: "Mbalmayo",
      region: "Centre",
      city: "Mbalmayo",
      images: JSON.stringify(["/seed/ad-cassava.png"]),
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: false,
      viewsCount: 278,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["manioc", "cassava", "bobolo", "gari", "mbalmayo"]),
    },
    // Ad 7: NPK Fertilizer (OFFER)
    {
      authorId: users[6].id,
      title: "Engrais NPK 15-15-15 et Urée — Stocks disponibles à Douala",
      description:
        "Fournisseur certifié d'engrais et d'intrants agricoles. Stocks disponibles: NPK 15-15-15 (50kg), Urée 46% (50kg), Engrais organique, Herbicides, Pesticides. Prix compétitifs pour achats en gros. Livraison dans tout le Cameroun. Paiement à la livraison accepté pour clients vérifiés. Conseils agronomiques gratuits avec chaque achat.",
      price: 18000,
      priceUnit: "sac",
      type: "OFFER",
      categorySlug: "engrais-intrants",
      condition: "NEW",
      quantity: "500 sacs en stock",
      location: "Makepe, Douala",
      region: "Littoral",
        city: "Douala",
      images: JSON.stringify(["/seed/ad-fertilizer.png"]),
      status: "ACTIVE",
      isFeatured: true,
      isUrgent: false,
      viewsCount: 395,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["engrais", "NPK", "urée", "intrants", "douala"]),
    },
    // Ad 8: Mil / Sorgho (OFFER)
    {
      authorId: users[7].id,
      title: "Mil blanc et sorgho rouge de l'Extrême-Nord — Haute qualité",
      description:
        "Production de céréales traditionnelles de l'Extrême-Nord: mil blanc, sorgho rouge, et arachides décortiquées. Cultivés selon les méthodes traditionnelles sur des terres fertiles du Mayo-Kebbi. Stockage optimal garanti. Vente en sacs de 25kg et 50kg. Possibilité de livraison groupée vers Douala et Yaoundé par transport en commun.",
      price: 35000,
      priceUnit: "sac",
      type: "OFFER",
      categorySlug: "cereales",
      condition: "PROCESSED",
      quantity: "3 tonnes en stock",
      location: "Maroua",
      region: "Extrême-Nord",
      city: "Maroua",
      images: JSON.stringify([]),
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: false,
      viewsCount: 201,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["mil", "sorgho", "arachide", "maroua", "céréales"]),
    },
    // Ad 9: Terrain agricole (OFFER)
    {
      authorId: users[8].id,
      title: "Terrain agricole 2 hectares à Kribi — Sol fertile, accès rivière",
      description:
        "A vendre ou à louer: magnifique terrain agricole de 2 hectares à Kribi, à 5km de la route nationale. Sol argilo-sableux fertile, idéal pour cultures vivrières (manioc, macabo, plantain), maraîchage, ou élevage. Source d'eau permanante avec accès à la rivière Kienké. Titre foncier en cours d'obtention. Prix négociable pour achat comptant.",
      price: 5000000,
      priceUnit: "hectare",
      type: "OFFER",
      categorySlug: "terres",
      condition: null,
      quantity: "2 hectares",
      location: "Kribi",
      region: "Sud",
      city: "Kribi",
      images: JSON.stringify([]),
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: false,
      viewsCount: 412,
      negociable: true,
      delivery: false,
      tags: JSON.stringify(["terrain", "terre", "kribi", "hectare", "agricole"]),
    },
    // Ad 10: Café moulu transformé (OFFER)
    {
      authorId: users[9].id,
      title: "Café Arabica moulu de Dschang — Torréfaction artisanale",
      description:
        "Café 100% Arabica des hauts plateaux de l'Ouest Cameroun, torréfié et moulu artisanalement à Dschang. Disponible en grains ou moulu, conditionné en sachets de 250g et 500g. Saveur riche et aromatique. Idéal pour cafés, restaurants, et cadeaux. Commandes en gros bienvenues. Également disponible: beurre de karité et huile de palme vierge.",
      price: 3500,
      priceUnit: "sachet",
      type: "OFFER",
      categorySlug: "aliments-transformes",
      condition: "PROCESSED",
      quantity: "500 sachets en stock",
      location: "Dschang",
      region: "Ouest",
      city: "Dschang",
      images: JSON.stringify(["/seed/ad-coffee.png"]),
      status: "ACTIVE",
      isFeatured: true,
      isUrgent: false,
      viewsCount: 638,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["café", "arabica", "dschang", "torréfaction", "artisanal"]),
    },
    // Ad 11: Tractor service (SERVICE)
    {
      authorId: users[6].id,
      title: "Service de labour mécanique — Tracteur disponible toutes régions",
      description:
        "Service de préparation des sols avec tracteur agricole. Labour, hersage, buttage et semis mécanisés. Intervention rapide dans les régions du Littoral, Ouest et Centre. Tarif horaire ou au forfait selon la superficie. Forfait labour + semis disponible. Tracteur bien entretenu avec opérateur expérimenté.",
      price: 25000,
      priceUnit: "forfait",
      type: "SERVICE",
      categorySlug: "equipements",
      condition: null,
      quantity: null,
      location: "Douala",
      region: "Littoral",
      city: "Douala",
      images: JSON.stringify(["/seed/ad-tractor.png"]),
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: false,
      viewsCount: 312,
      negociable: true,
      delivery: true,
      tags: JSON.stringify(["tracteur", "labour", "mécanique", "préparation sol", "douala"]),
    },
    // Ad 12: Niébé / Cowpeas (DEMAND)
    {
      authorId: users[1].id,
      title: "Achat niébé (haricot) en quantité — Pour transformation",
      description:
        "Je recherche des producteurs de niébé (haricot cornille) dans les régions du Nord et de l'Extrême-Nord pour approvisionnement régulier. Je cherche des variétés locales de bonne qualité, bien séchées et triées. Quantité souhaitée: 1 à 3 tonnes par mois. Paiement comptant à la livraison. Intéressés, me contacter par message ou téléphone.",
      price: null,
      priceUnit: null,
      type: "DEMAND",
      categorySlug: "legumineuses",
      condition: null,
      quantity: "1 à 3 tonnes par mois",
      location: "Douala",
      region: "Littoral",
      city: "Douala",
      images: JSON.stringify([]),
      status: "ACTIVE",
      isFeatured: false,
      isUrgent: false,
      viewsCount: 98,
      negociable: true,
      delivery: false,
      tags: JSON.stringify(["niébé", "haricot", "cornille", "achat", "nord"]),
    },
  ];

  const ads = [];
  for (const adData of adsData) {
    const ad = await prisma.ad.create({ data: adData });
    ads.push(ad);
  }
  console.log(`✅ ${ads.length} ads seeded\n`);

  // ========================
  // 4. SEED ADVERTISEMENTS
  // ========================
  console.log("📢 Seeding advertisements...");
  const advertisements = await Promise.all([
    prisma.advertisement.create({
      data: {
        title: "Bienvenue sur agryva — Inscrivez-vous gratuitement !",
        imageUrl: "/seed/banner-new-users.png",
        linkUrl: "/auth/register",
        position: "BANNER_TOP",
        isActive: true,
        clicksCount: 0,
        impressionsCount: 0,
        targetPlan: "FREE",
        priority: 10,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    }),
    prisma.advertisement.create({
      data: {
        title: "Équipez votre ferme — Matériel agricole à prix réduits",
        imageUrl: "/seed/banner-equipment.png",
        linkUrl: "/categories/equipements",
        position: "BANNER_TOP",
        isActive: true,
        clicksCount: 0,
        impressionsCount: 0,
        targetPlan: "FREE",
        priority: 8,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    }),
    prisma.advertisement.create({
      data: {
        title: "Services agricoles professionnels — Consultez un expert",
        imageUrl: "/seed/banner-services.png",
        linkUrl: "/categories/services-agricoles",
        position: "BANNER_TOP",
        isActive: true,
        clicksCount: 0,
        impressionsCount: 0,
        targetPlan: "FREE",
        priority: 6,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    }),
  ]);
  console.log(`✅ ${advertisements.length} advertisements seeded\n`);

  // ========================
  // SEED REVIEWS (bonus)
  // ========================
  console.log("⭐ Seeding sample reviews...");
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Excellents plantains ! Très frais et bien mûrs. Livraison rapide à Yaoundé. Je recommande fortement.",
        adId: ads[0].id,
        reviewerId: users[1].id,
        reviewedId: users[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Bons poulets, bien nourris. Le poids est conforme à la description. Seul bémol, le délai de livraison un peu long vers Douala.",
        adId: ads[2].id,
        reviewerId: users[6].id,
        reviewedId: users[2].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Les tilapias sont très frais et de bonne taille. Parfait pour mon restaurant. Client fidèle depuis 6 mois.",
        adId: ads[3].id,
        reviewerId: users[4].id,
        reviewedId: users[3].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Le café de Dschang est exceptionnel ! Torréfaction parfaite, arôme intense. Mes clients adorent.",
        adId: ads[9].id,
        reviewerId: users[0].id,
        reviewedId: users[9].id,
      },
    }),
  ]);
  console.log(`✅ ${reviews.length} reviews seeded\n`);

  // ========================
  // SEED CONVERSATIONS & MESSAGES (bonus)
  // ========================
  console.log("💬 Seeding sample conversations...");
  const conversation1 = await prisma.conversation.create({
    data: {
      user1Id: users[1].id,
      user2Id: users[0].id,
      adId: ads[0].id,
    },
  });
  await prisma.message.create({
    data: {
      content: "Bonjour, quel est votre prix pour 50 régimes de plantain ?",
      type: "TEXT",
      conversationId: conversation1.id,
      senderId: users[1].id,
      receiverId: users[0].id,
    },
  });
  await prisma.message.create({
    data: {
      content: "Bonjour Marie ! Pour 50 régimes, c'est 2200 FCFA/régime soit 110 000 FCFA au total. Livraison gratuite à Bonabéri.",
      type: "TEXT",
      conversationId: conversation1.id,
      senderId: users[0].id,
      receiverId: users[1].id,
      isRead: true,
      readAt: new Date(),
    },
  });
  await prisma.message.create({
    data: {
      content: "C'est un bon prix. Pouvez-vous livrer demain matin ?",
      type: "TEXT",
      conversationId: conversation1.id,
      senderId: users[1].id,
      receiverId: users[0].id,
    },
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      user1Id: users[4].id,
      user2Id: users[6].id,
      adId: ads[10].id,
    },
  });
  await prisma.message.create({
    data: {
      content: "Bonjour, avez-vous disponible cette semaine pour labourer 3 hectares à Bamenda ?",
      type: "TEXT",
      conversationId: conversation2.id,
      senderId: users[4].id,
      receiverId: users[6].id,
    },
  });
  await prisma.message.create({
    data: {
      content: "Oui, je suis disponible jeudi et vendredi. Le tarif serait de 75 000 FCFA pour 3 hectares. L'opérateur se déplace de Douala.",
      type: "TEXT",
      conversationId: conversation2.id,
      senderId: users[6].id,
      receiverId: users[4].id,
      isRead: true,
      readAt: new Date(),
    },
  });
  console.log(`✅ 2 conversations with messages seeded\n`);

  // ========================
  // SUMMARY
  // ========================
  console.log("═══════════════════════════════════════════");
  console.log("🎉 agryva seed completed successfully!");
  console.log("═══════════════════════════════════════════");
  console.log(`  📦 Categories:        ${categories.length}`);
  console.log(`  💳 Payment Plans:     ${plans.length}`);
  console.log(`  👥 Users:             ${users.length}`);
  console.log(`  📋 Ads:               ${ads.length}`);
  console.log(`  ⭐ Reviews:           ${reviews.length}`);
  console.log(`  💬 Conversations:     2`);
  console.log(`  📢 Advertisements:    ${advertisements.length}`);
  console.log("═══════════════════════════════════════════");
  console.log("\n🔑 Demo credentials: password = Demo1234!");
  console.log("   All emails: userX.agryva@gmail.com\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
