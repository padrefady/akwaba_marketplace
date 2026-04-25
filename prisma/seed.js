const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Starting Agryva database seed...\n");

  console.log("Cleaning existing data...");
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
  console.log("Data cleaned\n");

  // CATEGORIES
  console.log("Seeding categories...");
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Cereales", icon: "Wheat", slug: "cereales", order: 1 } }),
    prisma.category.create({ data: { name: "Legumineuses", icon: "Bean", slug: "legumineuses", order: 2 } }),
    prisma.category.create({ data: { name: "Tubercules & Racines", icon: "Carrot", slug: "tubercules", order: 3 } }),
    prisma.category.create({ data: { name: "Fruits & Legumes", icon: "Apple", slug: "fruits-legumes", order: 4 } }),
    prisma.category.create({ data: { name: "Betail & Volaille", icon: "Cow", slug: "betail-volaille", order: 5 } }),
    prisma.category.create({ data: { name: "Poissons & Produits de la Mer", icon: "Fish", slug: "poissons", order: 6 } }),
    prisma.category.create({ data: { name: "Produits Forestiers", icon: "TreePine", slug: "produits-forestiers", order: 7 } }),
    prisma.category.create({ data: { name: "Engrais & Intrants", icon: "FlaskConical", slug: "engrais-intrants", order: 8 } }),
    prisma.category.create({ data: { name: "Equipements & Machineries", icon: "Tractor", slug: "equipements", order: 9 } }),
    prisma.category.create({ data: { name: "Services Agricoles", icon: "Wrench", slug: "services-agricoles", order: 10 } }),
    prisma.category.create({ data: { name: "Terres & Proprietes", icon: "MapPin", slug: "terres", order: 11 } }),
    prisma.category.create({ data: { name: "Aliments Transformes", icon: "Package", slug: "aliments-transformes", order: 12 } }),
  ]);
  console.log(categories.length + " categories seeded\n");

  // PAYMENT PLANS
  console.log("Seeding payment plans...");
  const plans = await Promise.all([
    prisma.paymentPlan.create({ data: { name: "FREE", displayName: "Gratuit", price: 0, maxAds: 2, features: JSON.stringify(["2 annonces gratuites", "Messagerie illimitee", "Profil basique"]), isPopular: false } }),
    prisma.paymentPlan.create({ data: { name: "PREMIUM", displayName: "Premium", price: 5000, maxAds: 50, features: JSON.stringify(["50 annonces maximum", "Sans publicite", "Annonces mises en avant", "Badge Premium", "Support prioritaire"]), isPopular: true } }),
    prisma.paymentPlan.create({ data: { name: "VIP", displayName: "VIP", price: 15000, maxAds: 999, features: JSON.stringify(["Annonces illimitees", "Sans publicite", "Annonces toujours en vedette", "Assistance IA", "Badge VIP", "Support dedie 24/7", "Statistiques avancees"]), isPopular: false } }),
  ]);
  console.log(plans.length + " payment plans seeded\n");

  // USERS
  console.log("Seeding demo users...");
  const password = await hashPassword("Demo1234!");
  const users = await Promise.all([
    prisma.user.create({ data: { email: "jean.mbi@gmail.com", password, name: "Jean Mbi Assoumou", phone: "+237 699887701", bio: "Agriculteur depuis 15 ans, specialise dans la production de plantains et de mais dans la region du Centre.", location: "Nkolbisson, Yaounde", region: "Centre", city: "Yaounde", role: "SELLER", plan: "PREMIUM", isVerified: true, isOnline: true } }),
    prisma.user.create({ data: { email: "marie.tchinda@yahoo.fr", password, name: "Marie Tchinda", phone: "+237 655443302", bio: "Commercante en produits agricoles, approvisionnement en gros pour les restaurants et hotels a Douala.", location: "Bonaberi, Douala", region: "Littoral", city: "Douala", role: "BUYER", plan: "FREE", isVerified: true, isOnline: false } }),
    prisma.user.create({ data: { email: "paul.fofey@hotmail.com", password, name: "Paul Fofey Nkou", phone: "+237 677665503", bio: "Eleveur de volailles a Bafoussam, vente de poulets de chair et d oeufs frais.", location: "Bafoussam, Ouest", region: "Ouest", city: "Bafoussam", role: "SELLER", plan: "PREMIUM", isVerified: true, isOnline: true } }),
    prisma.user.create({ data: { email: "grace.achu@gmail.com", password, name: "Grace Achu Fru", phone: "+237 633221104", bio: "Fermiere piscicole a Buea, elevage de tilapias et de crevettes.", location: "Bokova, Buea", region: "Sud-Ouest", city: "Buea", role: "SELLER", plan: "VIP", isVerified: true, isOnline: false } }),
    prisma.user.create({ data: { email: "emmanuel.nganou@gmail.com", password, name: "Emmanuel Nganou Djameni", phone: "+237 611009905", bio: "Ingenieur agronome et consultant. Services de conseil agricole et formation.", location: "Nkwen, Bamenda", region: "Nord-Ouest", city: "Bamenda", role: "BOTH", plan: "VIP", isVerified: true, isOnline: true } }),
    prisma.user.create({ data: { email: "clarisse.ndongo@outlook.com", password, name: "Clarisse Ndongo Mbarga", phone: "+237 688776606", bio: "Fermiere specialisee dans la culture du manioc et du macabo.", location: "Mbalmayo", region: "Centre", city: "Mbalmayo", role: "SELLER", plan: "FREE", isVerified: true, isOnline: false } }),
    prisma.user.create({ data: { email: "alain.kamga@gmail.com", password, name: "Alain Kamga Fotso", phone: "+237 644332207", bio: "Fournisseur d equipements agricoles et d engrais. Livraison dans toutes les regions.", location: "Makepe, Douala", region: "Littoral", city: "Douala", role: "SELLER", plan: "PREMIUM", isVerified: true, isOnline: true } }),
    prisma.user.create({ data: { email: "issouf.abba@gmail.com", password, name: "Issouf Abba Mahamat", phone: "+237 622110008", bio: "Cerealier de l Extreme-Nord. Production et vente de mil, sorgho et arachides.", location: "Maroua", region: "Extreme-Nord", city: "Maroua", role: "SELLER", plan: "PREMIUM", isVerified: true, isOnline: false } }),
    prisma.user.create({ data: { email: "veronica.esimi@gmail.com", password, name: "Veronica Esimi", phone: "+237 699001109", bio: "Proprietaire de terres agricoles dans la region du Sud.", location: "Kribi", region: "Sud", city: "Kribi", role: "SELLER", plan: "FREE", isVerified: false, isOnline: false } }),
    prisma.user.create({ data: { email: "bertrand.tagne@gmail.com", password, name: "Bertrand Tagne Fotso", phone: "+237 655667710", bio: "Transformateur de produits agricoles. Huile de palme, beurre de karite et cafe moulu.", location: "Dschang", region: "Ouest", city: "Dschang", role: "SELLER", plan: "PREMIUM", isVerified: true, isOnline: true } }),
  ]);
  console.log(users.length + " users created\n");

  // ADS
  console.log("Seeding ads...");
  const adsData = [
    { authorId: users[0].id, title: "Regimes de plantains murs disponibles - Livraison a Yaounde", description: "Vente de regimes de plantains murs directement de la ferme a Nkolbisson. Recoltes ce matin, qualite premium. Prix degressif a partir de 20 regimes. Livraison gratuite dans Yaounde pour commande de 50+ regimes.", price: 2500, priceUnit: "regime", type: "OFFER", categorySlug: "fruits-legumes", condition: "FRESH", quantity: "Plus de 200 regimes disponibles", location: "Nkolbisson, Yaounde", region: "Centre", city: "Yaounde", images: JSON.stringify(["/seed/ad-plantains.png"]), status: "ACTIVE", isFeatured: true, isUrgent: false, viewsCount: 347, negociable: true, delivery: true, tags: JSON.stringify(["plantain", "alloco", "mur", "yaounde"]) },
    { authorId: users[1].id, title: "Recherche mais en gros - 5 tonnes minimum", description: "Je recherche un fournisseur fiable de mais sec en grande quantite pour l approvisionnement de ma chaine de restaurants a Douala. Le mais doit etre bien seche, sans moisissure. Je peux prendre jusqu a 10 tonnes par mois.", price: null, priceUnit: null, type: "DEMAND", categorySlug: "cereales", condition: null, quantity: "5 a 10 tonnes par mois", location: "Bonaberi, Douala", region: "Littoral", city: "Douala", images: JSON.stringify(["/seed/ad-maize.png"]), status: "ACTIVE", isFeatured: false, isUrgent: true, viewsCount: 189, negociable: true, delivery: false, tags: JSON.stringify(["mais", "gros", "restaurant", "douala"]) },
    { authorId: users[2].id, title: "Poulets de chair vifs - Ferme de Bafoussam, 1800 FCFA/piece", description: "Elevage de poulets de chair en plein air a Bafoussam. Nourris avec des aliments naturels. Poids moyen: 1.8 - 2.2 kg. Livraison possible a Bafoussam, Dschang, et Douala. Reduction de 10% pour commande de 50+ pieces.", price: 1800, priceUnit: "piece", type: "OFFER", categorySlug: "betail-volaille", condition: "NEW", quantity: "300 tetes disponibles", location: "Bafoussam, Ouest", region: "Ouest", city: "Bafoussam", images: JSON.stringify(["/seed/ad-poultry.png"]), status: "ACTIVE", isFeatured: true, isUrgent: false, viewsCount: 562, negociable: true, delivery: true, tags: JSON.stringify(["poulet", "chair", "volaille", "ferme"]) },
    { authorId: users[3].id, title: "Tilapias frais d elevage - Ferme piscicole de Buea", description: "Poissons Tilapia frais de notre ferme piscicole a Bokova, Buea. Tailles disponibles: petit (300g), moyen (500g), grand (800g+). Livraison quotidienne a Buea, Limbe, et Tiko.", price: 2000, priceUnit: "piece", type: "OFFER", categorySlug: "poissons", condition: "FRESH", quantity: "500+ poissons en stock", location: "Bokova, Buea", region: "Sud-Ouest", city: "Buea", images: JSON.stringify(["/seed/ad-fish.png"]), status: "ACTIVE", isFeatured: true, isUrgent: false, viewsCount: 423, negociable: true, delivery: true, tags: JSON.stringify(["tilapia", "poisson", "frais", "buea"]) },
    { authorId: users[4].id, title: "Consultant agronome - Analyse des sols, conseil et formation", description: "Ingenieur agronome avec 10 ans d experience. Analyse de sol et d eau, recommandations de fertilisation, plans de culture, formation des agriculteurs. Premiere consultation gratuite.", price: 15000, priceUnit: "forfait", type: "SERVICE", categorySlug: "services-agricoles", condition: null, quantity: null, location: "Nkwen, Bamenda", region: "Nord-Ouest", city: "Bamenda", images: JSON.stringify([]), status: "ACTIVE", isFeatured: false, isUrgent: false, viewsCount: 156, negociable: true, delivery: false, tags: JSON.stringify(["agronome", "consultant", "sol", "formation"]) },
    { authorId: users[5].id, title: "Manioc frais et batons de manioc - Production artisanale", description: "Vente de manioc frais directement de la ferme a Mbalmayo. Varietes ameliorees. Egalement disponible: batons de manioc (bobolo), gari de qualite superieure, et fufu de mais.", price: 500, priceUnit: "kg", type: "OFFER", categorySlug: "tubercules", condition: "FRESH", quantity: "2 tonnes de manioc disponibles", location: "Mbalmayo", region: "Centre", city: "Mbalmayo", images: JSON.stringify(["/seed/ad-cassava.png"]), status: "ACTIVE", isFeatured: false, isUrgent: false, viewsCount: 278, negociable: true, delivery: true, tags: JSON.stringify(["manioc", "cassava", "bobolo", "gari"]) },
    { authorId: users[6].id, title: "Engrais NPK 15-15-15 et Uree - Stocks disponibles a Douala", description: "Fournisseur certifie d engrais et d intrants agricoles. Stocks disponibles: NPK 15-15-15 (50kg), Uree 46% (50kg), Engrais organique, Herbicides, Pesticides. Livraison dans tout le Cameroun.", price: 18000, priceUnit: "sac", type: "OFFER", categorySlug: "engrais-intrants", condition: "NEW", quantity: "500 sacs en stock", location: "Makepe, Douala", region: "Littoral", city: "Douala", images: JSON.stringify(["/seed/ad-fertilizer.png"]), status: "ACTIVE", isFeatured: true, isUrgent: false, viewsCount: 395, negociable: true, delivery: true, tags: JSON.stringify(["engrais", "NPK", "uree", "douala"]) },
    { authorId: users[7].id, title: "Mil blanc et sorgho rouge de l Extreme-Nord", description: "Production de cereales traditionnelles de l Extreme-Nord: mil blanc, sorgho rouge, et arachides decortiquees. Vente en sacs de 25kg et 50kg. Livraison groupee vers Douala et Yaounde.", price: 35000, priceUnit: "sac", type: "OFFER", categorySlug: "cereales", condition: "PROCESSED", quantity: "3 tonnes en stock", location: "Maroua", region: "Extreme-Nord", city: "Maroua", images: JSON.stringify([]), status: "ACTIVE", isFeatured: false, isUrgent: false, viewsCount: 201, negociable: true, delivery: true, tags: JSON.stringify(["mil", "sorgho", "arachide", "maroua"]) },
    { authorId: users[8].id, title: "Terrain agricole 2 hectares a Kribi - Sol fertile", description: "A vendre ou a louer: terrain agricole de 2 hectares a Kribi. Sol argilo-sableux fertile, ideal pour cultures vivrieres, maraichage, ou elevage. Source d eau permanente avec acces a la riviere.", price: 5000000, priceUnit: "hectare", type: "OFFER", categorySlug: "terres", condition: null, quantity: "2 hectares", location: "Kribi", region: "Sud", city: "Kribi", images: JSON.stringify([]), status: "ACTIVE", isFeatured: false, isUrgent: false, viewsCount: 412, negociable: true, delivery: false, tags: JSON.stringify(["terrain", "terre", "kribi", "hectare"]) },
    { authorId: users[9].id, title: "Cafe Arabica moulu de Dschang - Torrefaction artisanale", description: "Cafe 100% Arabica des hauts plateaux de l Ouest Cameroun, torrefie et moulu artisanalement a Dschang. Conditionne en sachets de 250g et 500g. Saveur riche et aromatique.", price: 3500, priceUnit: "sachet", type: "OFFER", categorySlug: "aliments-transformes", condition: "PROCESSED", quantity: "500 sachets en stock", location: "Dschang", region: "Ouest", city: "Dschang", images: JSON.stringify(["/seed/ad-coffee.png"]), status: "ACTIVE", isFeatured: true, isUrgent: false, viewsCount: 638, negociable: true, delivery: true, tags: JSON.stringify(["cafe", "arabica", "dschang", "torrefaction"]) },
    { authorId: users[6].id, title: "Service de labour mecanique - Tracteur disponible", description: "Service de preparation des sols avec tracteur agricole. Labour, hersage, buttage et semis mecanises. Intervention rapide dans les regions du Littoral, Ouest et Centre.", price: 25000, priceUnit: "forfait", type: "SERVICE", categorySlug: "equipements", condition: null, quantity: null, location: "Douala", region: "Littoral", city: "Douala", images: JSON.stringify(["/seed/ad-tractor.png"]), status: "ACTIVE", isFeatured: false, isUrgent: false, viewsCount: 312, negociable: true, delivery: true, tags: JSON.stringify(["tracteur", "labour", "mecanique", "douala"]) },
    { authorId: users[1].id, title: "Achat niebe (haricot) en quantite - Pour transformation", description: "Je recherche des producteurs de niebe (haricot cornille) dans les regions du Nord et de l Extreme-Nord. Quantite souhaitee: 1 a 3 tonnes par mois. Paiement comptant a la livraison.", price: null, priceUnit: null, type: "DEMAND", categorySlug: "legumineuses", condition: null, quantity: "1 a 3 tonnes par mois", location: "Douala", region: "Littoral", city: "Douala", images: JSON.stringify([]), status: "ACTIVE", isFeatured: false, isUrgent: false, viewsCount: 98, negociable: true, delivery: false, tags: JSON.stringify(["niebe", "haricot", "achat", "nord"]) },
  ];

  const ads = [];
  for (const adData of adsData) {
    const ad = await prisma.ad.create({ data: adData });
    ads.push(ad);
  }
  console.log(ads.length + " ads seeded\n");

  // ADVERTISEMENTS
  console.log("Seeding advertisements...");
  await Promise.all([
    prisma.advertisement.create({ data: { title: "Bienvenue sur Agryva - Inscrivez-vous gratuitement !", imageUrl: "/seed/banner-new-users.png", linkUrl: "/auth/register", position: "BANNER_TOP", isActive: true, clicksCount: 0, impressionsCount: 0, targetPlan: "FREE", priority: 10, startsAt: new Date(), expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } }),
    prisma.advertisement.create({ data: { title: "Equipez votre ferme - Materiel agricole a prix reduits", imageUrl: "/seed/banner-equipment.png", linkUrl: "/categories/equipements", position: "BANNER_TOP", isActive: true, clicksCount: 0, impressionsCount: 0, targetPlan: "FREE", priority: 8, startsAt: new Date(), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) } }),
  ]);
  console.log("2 advertisements seeded\n");

  // REVIEWS
  console.log("Seeding reviews...");
  await Promise.all([
    prisma.review.create({ data: { rating: 5, comment: "Excellents plantains ! Tres frais et bien murs. Livraison rapide.", adId: ads[0].id, reviewerId: users[1].id, reviewedId: users[0].id } }),
    prisma.review.create({ data: { rating: 4, comment: "Bons poulets, bien nourris. Le poids est conforme.", adId: ads[2].id, reviewerId: users[6].id, reviewedId: users[2].id } }),
    prisma.review.create({ data: { rating: 5, comment: "Les tilapias sont tres frais. Client fidelle depuis 6 mois.", adId: ads[3].id, reviewerId: users[4].id, reviewedId: users[3].id } }),
    prisma.review.create({ data: { rating: 5, comment: "Le cafe de Dschang est exceptionnel ! Mes clients adorent.", adId: ads[9].id, reviewerId: users[0].id, reviewedId: users[9].id } }),
  ]);
  console.log("4 reviews seeded\n");

  // CONVERSATIONS
  console.log("Seeding conversations...");
  const conv1 = await prisma.conversation.create({ data: { user1Id: users[1].id, user2Id: users[0].id, adId: ads[0].id } });
  await prisma.message.create({ data: { content: "Bonjour, quel est votre prix pour 50 regimes de plantain ?", type: "TEXT", conversationId: conv1.id, senderId: users[1].id, receiverId: users[0].id } });
  await prisma.message.create({ data: { content: "Bonjour Marie ! Pour 50 regimes, c est 2200 FCFA/regime soit 110 000 FCFA au total.", type: "TEXT", conversationId: conv1.id, senderId: users[0].id, receiverId: users[1].id, isRead: true, readAt: new Date() } });
  const conv2 = await prisma.conversation.create({ data: { user1Id: users[4].id, user2Id: users[6].id, adId: ads[10].id } });
  await prisma.message.create({ data: { content: "Bonjour, avez-vous disponible cette semaine pour labourer 3 hectares ?", type: "TEXT", conversationId: conv2.id, senderId: users[4].id, receiverId: users[6].id } });
  await prisma.message.create({ data: { content: "Oui, disponible jeudi et vendredi. Tarif: 75 000 FCFA pour 3 hectares.", type: "TEXT", conversationId: conv2.id, senderId: users[6].id, receiverId: users[4].id, isRead: true, readAt: new Date() } });
  console.log("2 conversations seeded\n");

  console.log("========================================");
  console.log("  Agryva seed completed successfully!");
  console.log("========================================");
  console.log("  Categories:   " + categories.length);
  console.log("  Plans:        " + plans.length);
  console.log("  Users:        " + users.length);
  console.log("  Ads:          " + ads.length);
  console.log("  Reviews:      4");
  console.log("  Conversations:2");
  console.log("========================================");
  console.log("\nDemo password: Demo1234!");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
