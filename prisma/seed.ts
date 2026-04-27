import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const REGIONS = [
  'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest',
  'Sud', 'Est', 'Adamaoua', 'Nord', 'Extrême-Nord'
];

const CITIES: Record<string, string[]> = {
  'Centre': ['Yaoundé', 'Obala', 'Bafia', 'Mbalmayo', 'Nkoteng', 'Mbandjock', 'Bokito'],
  'Littoral': ['Douala', 'Edéa', 'Kribi', 'Tiko', 'Bonabéri'],
  'Ouest': ['Bafoussam', 'Dschang', 'Foumban', 'Bafang', 'Bangangté', 'Mbouda'],
  'Nord-Ouest': ['Bamenda', 'Kumbo', 'Nkwen', 'Wum', 'Bafut'],
  'Sud-Ouest': ['Buea', 'Limbe', 'Tiko', 'Mundemba', 'Kumba'],
  'Sud': ['Ebolowa', 'Kribi', 'Sangmélima', 'Lolodorf', 'Ambam'],
  'Est': ['Bertoua', 'Abong-Mbang', 'Doumé', 'Yokadouma', 'Lomié'],
  'Adamaoua': ['Ngaoundéré', 'Tibati', 'Meiganga', 'Banyo', 'Tignère'],
  'Nord': ['Garoua', 'Maroua', 'Kousseri', 'Guider', 'Lagdo'],
  'Extrême-Nord': ['Maroua', 'Kousseri', 'Yagoua', 'Mokolo', 'Kaelé']
};

const CATEGORIES = [
  'Céréales', 'Légumes', 'Fruits', 'Tubercules', 'Épices',
  'Bétail', 'Volaille', 'Produits laitiers', 'Poissons',
  'Équipements agricoles', 'Engrais', 'Services agricoles'
];

// ===== PHOTOS DE PROFIL =====
const PROFILE_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506277886164-e25aa3f8e993?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=150&h=150&fit=crop&crop=face',
];

// ===== IMAGES PRÉCISES PAR PRODUIT =====
const PRODUCT_IMAGES: Record<string, string[]> = {
  // CÉRÉALES
  'Maïs blanc': ['https://images.unsplash.com/photo-1536304993881-460e32046c52?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop'],
  'Maïs jaune': ['https://images.unsplash.com/photo-1536304993881-460e32046c52?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop'],
  'Riz local parfumé': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop'],
  'Riz importé 25kg': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=600&h=400&fit=crop'],
  'Millet': ['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop'],
  'Sorgho blanc': ['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1536304993881-460e32046c52?w=600&h=400&fit=crop'],
  'Arachide décortiquée': ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=600&h=400&fit=crop'],
  'Semence de maïs améliorée': ['https://images.unsplash.com/photo-1536304993881-460e32046c52?w=600&h=400&fit=crop'],
  'Blé tendre': ['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop'],
  'Riz paddy': ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop'],

  // LÉGUMES
  'Tomates mûres': ['https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop'],
  'Piments rouges': ['https://images.unsplash.com/photo-1581783740319-2899fad280b8?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&h=400&fit=crop'],
  'Oignons secs': ['https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1596097635121-14b63a7a2c18?w=600&h=400&fit=crop'],
  'Aubergines': ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=400&fit=crop'],
  'Gombos frais': ['https://images.unsplash.com/photo-1601296738338-37eac4b7fb4c?w=600&h=400&fit=crop'],
  'Feuilles de manioc': ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=400&fit=crop'],
  'Ndolé frais': ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop'],
  'Carottes': ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&h=400&fit=crop'],
  'Choux vert': ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=400&fit=crop'],
  'Concombres': ['https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&h=400&fit=crop'],
  'Poivrons verts': ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&h=400&fit=crop'],

  // FRUITS
  'Mangues mûres': ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1583577612013-4f4de4459a13?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=400&fit=crop'],
  'Papayes': ['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=400&fit=crop'],
  'Ananas de Nkongsamba': ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&h=400&fit=crop'],
  'Bananes plantains': ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1530904041662-e1e3b5b75168?w=600&h=400&fit=crop'],
  'Agrumes (oranges)': ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop'],
  'Avocats mûrs': ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=400&fit=crop'],
  'Pastèques': ['https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=600&h=400&fit=crop'],
  'Goyaves': ['https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&h=400&fit=crop'],
  'Bananes douces': ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop'],

  // TUBERCULES
  'Manioc frais': ['https://images.unsplash.com/photo-1596097635121-14b63a7a2c18?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1604176214179-21f101d2c4e3?w=600&h=400&fit=crop'],
  'Ignames': ['https://images.unsplash.com/photo-1604176214179-21f101d2c4e3?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1596097635121-14b63a7a2c18?w=600&h=400&fit=crop'],
  'Patates douces': ['https://images.unsplash.com/photo-1596097635121-14b63a7a2c18?w=600&h=400&fit=crop'],
  'Taro': ['https://images.unsplash.com/photo-1604176214179-21f101d2c4e3?w=600&h=400&fit=crop'],
  'Macabo': ['https://images.unsplash.com/photo-1596097635121-14b63a7a2c18?w=600&h=400&fit=crop'],

  // ÉPICES
  'Poivre blanc de Penja AOC': ['https://images.unsplash.com/photo-1599909533601-aa23a47b4a48?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop'],
  'Gingembre frais': ['https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&h=400&fit=crop'],
  'Curcuma': ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&h=400&fit=crop'],
  'Piment séché': ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&h=400&fit=crop'],

  // BÉTAIL
  'Bœuf Zébu adulte': ['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1560707180-a0e20a57f584?w=600&h=400&fit=crop'],
  'Chèvre de race': ['https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop'],
  'Mouton (bélier)': ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&h=400&fit=crop'],
  'Porc d\'engraissement': ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1560707180-a0e20a57f584?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop'],
  'Vache laitière': ['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&h=400&fit=crop'],
  'Veau sevré': ['https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop'],

  // VOLAILLE
  'Poulets de chair (45 jours)': ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop'],
  'Poules pondeuses ISA Brown': ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1569173675610-56e0e4a3f753?w=600&h=400&fit=crop'],
  'Dindes de 5kg': ['https://images.unsplash.com/photo-1569173675610-56e0e4a3f753?w=600&h=400&fit=crop'],
  'Poussins d\'un jour': ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop'],
  'Canards de Barbarie': ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop'],
  'Œufs à couver (lot 30)': ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1569173675610-56e0e4a3f753?w=600&h=400&fit=crop'],

  // PRODUITS LAITIERS
  'Lait frais de vache': ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1570145820559-379835c3b9d5?w=600&h=400&fit=crop'],
  'Fromage Wagashi': ['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=400&fit=crop'],
  'Yaourt nature maison': ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1570145820559-379835c3b9d5?w=600&h=400&fit=crop'],
  'Beurre artisanal': ['https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600&h=400&fit=crop'],

  // POISSONS
  'Poissons fumés (Bar)': ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'],
  'Crevettes fraîches': ['https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&h=400&fit=crop'],
  'Tilapia frais': ['https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop'],
  'Huitres de Kribi': ['https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&h=400&fit=crop'],
  'Écrevisses': ['https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=400&fit=crop'],

  // ÉQUIPEMENTS AGRICOLES
  'Moto-cultivateur Honda': ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop'],
  'Pompe à eau diesel': ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop'],
  'Tracteur Massey Ferguson': ['https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600&h=400&fit=crop'],
  'Motopompe Koshin': ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop'],
  'Pulvérisateur à dos': ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop'],
  'Séchoir solaire': ['https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600&h=400&fit=crop'],

  // ENGRAIS
  'Engrais NPK 15-15-15 (50kg)': ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop'],
  'Uréée 46% (50kg)': ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop'],
  'Fumier de volaille composté': ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop'],
  'Compost organique': ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop'],

  // SERVICES
  'Labour mécanique avec tracteur': ['https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop'],
  'Transport agricole (camion 20T)': ['https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600&h=400&fit=crop'],
  'Installation d\'irrigation goutte-à-goutte': ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop'],
};

// ===== PRODUITS PAR CATÉGORIE =====
const PRODUCTS: Record<string, { name: string; type: string; unit: string; priceRange: [number, number] }[]> = {
  'Céréales': [
    { name: 'Maïs blanc', type: 'OFFER', unit: 'kg', priceRange: [300, 8000] },
    { name: 'Maïs jaune', type: 'OFFER', unit: 'kg', priceRange: [400, 9000] },
    { name: 'Riz local parfumé', type: 'OFFER', unit: 'kg', priceRange: [500, 7000] },
    { name: 'Riz importé 25kg', type: 'OFFER', unit: 'sac', priceRange: [12000, 18000] },
    { name: 'Millet', type: 'OFFER', unit: 'kg', priceRange: [400, 6000] },
    { name: 'Sorgho blanc', type: 'OFFER', unit: 'kg', priceRange: [350, 5000] },
    { name: 'Arachide décortiquée', type: 'OFFER', unit: 'kg', priceRange: [600, 4000] },
    { name: 'Semence de maïs améliorée', type: 'OFFER', unit: 'kg', priceRange: [1500, 5000] },
    { name: 'Blé tendre', type: 'OFFER', unit: 'kg', priceRange: [400, 6000] },
    { name: 'Riz paddy', type: 'OFFER', unit: 'kg', priceRange: [250, 4000] },
    { name: 'Maïs en grains', type: 'DEMAND', unit: 'tonne', priceRange: [150000, 300000] },
    { name: 'Riz local en gros', type: 'DEMAND', unit: 'tonne', priceRange: [250000, 400000] },
  ],
  'Légumes': [
    { name: 'Tomates mûres', type: 'OFFER', unit: 'kg', priceRange: [200, 3000] },
    { name: 'Piments rouges', type: 'OFFER', unit: 'kg', priceRange: [500, 5000] },
    { name: 'Oignons secs', type: 'OFFER', unit: 'kg', priceRange: [400, 4000] },
    { name: 'Aubergines', type: 'OFFER', unit: 'kg', priceRange: [150, 2500] },
    { name: 'Gombos frais', type: 'OFFER', unit: 'kg', priceRange: [200, 3000] },
    { name: 'Feuilles de manioc', type: 'OFFER', unit: 'botte', priceRange: [100, 500] },
    { name: 'Ndolé frais', type: 'OFFER', unit: 'kg', priceRange: [1000, 3000] },
    { name: 'Carottes', type: 'OFFER', unit: 'kg', priceRange: [300, 3500] },
    { name: 'Choux vert', type: 'OFFER', unit: 'pièce', priceRange: [200, 800] },
    { name: 'Concombres', type: 'OFFER', unit: 'kg', priceRange: [200, 2000] },
    { name: 'Poivrons verts', type: 'OFFER', unit: 'kg', priceRange: [400, 4000] },
    { name: 'Tomates en gros', type: 'DEMAND', unit: 'tonne', priceRange: [80000, 200000] },
    { name: 'Oignons secs en quantité', type: 'DEMAND', unit: 'tonne', priceRange: [150000, 300000] },
  ],
  'Fruits': [
    { name: 'Mangues mûres', type: 'OFFER', unit: 'kg', priceRange: [200, 3000] },
    { name: 'Papayes', type: 'OFFER', unit: 'pièce', priceRange: [100, 500] },
    { name: 'Ananas de Nkongsamba', type: 'OFFER', unit: 'pièce', priceRange: [200, 800] },
    { name: 'Bananes plantains', type: 'OFFER', unit: 'régime', priceRange: [1000, 5000] },
    { name: 'Agrumes (oranges)', type: 'OFFER', unit: 'kg', priceRange: [300, 4000] },
    { name: 'Avocats mûrs', type: 'OFFER', unit: 'kg', priceRange: [400, 5000] },
    { name: 'Pastèques', type: 'OFFER', unit: 'pièce', priceRange: [500, 3000] },
    { name: 'Goyaves', type: 'OFFER', unit: 'kg', priceRange: [300, 2500] },
    { name: 'Bananes douces', type: 'OFFER', unit: 'régime', priceRange: [500, 3000] },
    { name: 'Mangues en gros', type: 'DEMAND', unit: 'tonne', priceRange: [50000, 150000] },
  ],
  'Tubercules': [
    { name: 'Manioc frais', type: 'OFFER', unit: 'kg', priceRange: [100, 1500] },
    { name: 'Ignames', type: 'OFFER', unit: 'kg', priceRange: [200, 3500] },
    { name: 'Patates douces', type: 'OFFER', unit: 'kg', priceRange: [100, 2000] },
    { name: 'Taro', type: 'OFFER', unit: 'kg', priceRange: [150, 2500] },
    { name: 'Macabo', type: 'OFFER', unit: 'kg', priceRange: [100, 2000] },
    { name: 'Manioc pour transformation', type: 'DEMAND', unit: 'tonne', priceRange: [50000, 120000] },
    { name: 'Ignames en gros', type: 'DEMAND', unit: 'tonne', priceRange: [80000, 200000] },
  ],
  'Épices': [
    { name: 'Poivre blanc de Penja AOC', type: 'OFFER', unit: 'kg', priceRange: [5000, 15000] },
    { name: 'Gingembre frais', type: 'OFFER', unit: 'kg', priceRange: [500, 4000] },
    { name: 'Curcuma', type: 'OFFER', unit: 'kg', priceRange: [3000, 10000] },
    { name: 'Piment séché', type: 'OFFER', unit: 'kg', priceRange: [2000, 8000] },
    { name: 'Poivre de Penja en gros', type: 'DEMAND', unit: 'kg', priceRange: [8000, 18000] },
  ],
  'Bétail': [
    { name: 'Bœuf Zébu adulte', type: 'OFFER', unit: 'tête', priceRange: [150000, 350000] },
    { name: 'Chèvre de race', type: 'OFFER', unit: 'tête', priceRange: [25000, 80000] },
    { name: 'Mouton (bélier)', type: 'OFFER', unit: 'tête', priceRange: [35000, 120000] },
    { name: 'Porc d\'engraissement', type: 'OFFER', unit: 'tête', priceRange: [40000, 100000] },
    { name: 'Vache laitière', type: 'OFFER', unit: 'tête', priceRange: [200000, 400000] },
    { name: 'Veau sevré', type: 'OFFER', unit: 'tête', priceRange: [50000, 100000] },
    { name: 'Bœufs sur pied en gros', type: 'DEMAND', unit: 'tête', priceRange: [150000, 300000] },
    { name: 'Chèvres pour élevage', type: 'DEMAND', unit: 'tête', priceRange: [20000, 60000] },
  ],
  'Volaille': [
    { name: 'Poulets de chair (45 jours)', type: 'OFFER', unit: 'tête', priceRange: [1500, 3500] },
    { name: 'Poules pondeuses ISA Brown', type: 'OFFER', unit: 'tête', priceRange: [2500, 5000] },
    { name: 'Dindes de 5kg', type: 'OFFER', unit: 'tête', priceRange: [5000, 12000] },
    { name: 'Poussins d\'un jour', type: 'OFFER', unit: 'tête', priceRange: [200, 500] },
    { name: 'Canards de Barbarie', type: 'OFFER', unit: 'tête', priceRange: [2000, 5000] },
    { name: 'Œufs à couver (lot 30)', type: 'OFFER', unit: 'lot', priceRange: [3000, 8000] },
    { name: 'Poussins d\'un jour en gros', type: 'DEMAND', unit: 'tête', priceRange: [150, 400] },
  ],
  'Produits laitiers': [
    { name: 'Lait frais de vache', type: 'OFFER', unit: 'litre', priceRange: [400, 800] },
    { name: 'Fromage Wagashi', type: 'OFFER', unit: 'pièce', priceRange: [500, 1500] },
    { name: 'Yaourt nature maison', type: 'OFFER', unit: 'lot (6)', priceRange: [1500, 3000] },
    { name: 'Beurre artisanal', type: 'OFFER', unit: 'kg', priceRange: [3000, 6000] },
    { name: 'Lait frais en gros (journalier)', type: 'DEMAND', unit: 'litre', priceRange: [300, 600] },
  ],
  'Poissons': [
    { name: 'Poissons fumés (Bar)', type: 'OFFER', unit: 'kg', priceRange: [2000, 5000] },
    { name: 'Crevettes fraîches', type: 'OFFER', unit: 'kg', priceRange: [3000, 8000] },
    { name: 'Tilapia frais', type: 'OFFER', unit: 'kg', priceRange: [1500, 4000] },
    { name: 'Huitres de Kribi', type: 'OFFER', unit: 'plateau', priceRange: [5000, 15000] },
    { name: 'Écrevisses', type: 'OFFER', unit: 'kg', priceRange: [3000, 7000] },
    { name: 'Tilapia en gros pour poissonnerie', type: 'DEMAND', unit: 'kg', priceRange: [1500, 3500] },
  ],
  'Équipements agricoles': [
    { name: 'Moto-cultivateur Honda', type: 'OFFER', unit: 'pièce', priceRange: [150000, 400000] },
    { name: 'Pompe à eau diesel', type: 'OFFER', unit: 'pièce', priceRange: [80000, 250000] },
    { name: 'Tracteur Massey Ferguson', type: 'OFFER', unit: 'pièce', priceRange: [2000000, 8000000] },
    { name: 'Motopompe Koshin', type: 'OFFER', unit: 'pièce', priceRange: [50000, 150000] },
    { name: 'Pulvérisateur à dos', type: 'OFFER', unit: 'pièce', priceRange: [5000, 20000] },
    { name: 'Séchoir solaire', type: 'OFFER', unit: 'pièce', priceRange: [50000, 200000] },
    { name: 'Tracteur d\'occasion', type: 'DEMAND', unit: 'pièce', priceRange: [1500000, 5000000] },
  ],
  'Engrais': [
    { name: 'Engrais NPK 15-15-15 (50kg)', type: 'OFFER', unit: 'sac', priceRange: [15000, 25000] },
    { name: 'Uréée 46% (50kg)', type: 'OFFER', unit: 'sac', priceRange: [12000, 22000] },
    { name: 'Fumier de volaille composté', type: 'OFFER', unit: 'sac', priceRange: [3000, 8000] },
    { name: 'Compost organique', type: 'OFFER', unit: 'sac', priceRange: [2000, 6000] },
    { name: 'Engrais NPK en gros', type: 'DEMAND', unit: 'tonne', priceRange: [300000, 500000] },
  ],
  'Services agricoles': [
    { name: 'Labour mécanique avec tracteur', type: 'SERVICE', unit: 'hectare', priceRange: [15000, 35000] },
    { name: 'Transport agricole (camion 20T)', type: 'SERVICE', unit: 'voyage', priceRange: [80000, 200000] },
    { name: 'Conseil agronomique personnalisé', type: 'SERVICE', unit: 'forfait', priceRange: [20000, 100000] },
    { name: 'Installation d\'irrigation goutte-à-goutte', type: 'SERVICE', unit: 'hectare', priceRange: [150000, 500000] },
    { name: 'Récolte mécanisée', type: 'SERVICE', unit: 'hectare', priceRange: [20000, 50000] },
    { name: 'Emploi : Conducteur de tracteur', type: 'SERVICE', unit: 'forfait', priceRange: [80000, 150000] },
    { name: 'Emploi : Technicien agricole', type: 'SERVICE', unit: 'forfait', priceRange: [100000, 200000] },
    { name: 'Emploi : Gestionnaire de ferme', type: 'SERVICE', unit: 'forfait', priceRange: [120000, 250000] },
    { name: 'Emploi : Vétérinaire de campagne', type: 'SERVICE', unit: 'forfait', priceRange: [150000, 300000] },
    { name: 'Emploi : Ingénieur agronome', type: 'SERVICE', unit: 'forfait', priceRange: [200000, 400000] },
    { name: 'Demande d\'emploi : Agronome diplômé cherche poste', type: 'SERVICE', unit: 'forfait', priceRange: [150000, 250000] },
    { name: 'Demande d\'emploi : Ouvrier agricole polyvalent', type: 'SERVICE', unit: 'forfait', priceRange: [50000, 80000] },
    { name: 'Demande d\'emploi : Chauffeur livreur disponible', type: 'SERVICE', unit: 'forfait', priceRange: [60000, 100000] },
  ],
};

const FIRST_NAMES = [
  'Jean', 'Marie', 'Pierre', 'Fatou', 'Ibrahim', 'Amina', 'Paul', 'Grace',
  'Emmanuel', 'Esther', 'André', 'Chantal', 'Ngeh', 'Mbakam', 'Tanjong',
  'Kouemo', 'Ngassa', 'Eyenga', 'Fotso', 'Kamga', 'Tchinda', 'Ngo',
  'Mbarga', 'Atangana', 'Nkoulou', 'Moussa', 'Halima', 'Abdou', 'Ousman',
  'Ramatou', 'Bella', 'Célestin', 'Odile', 'Alain', 'Bernadette', 'Clément',
  'Dorothée', 'Edgar', 'Fabiola', 'Georges', 'Hélène', 'Juliette',
  'Karl', 'Louise', 'Maxime', 'Nathalie', 'Olivier', 'Prudence', 'Quentin',
  'René', 'Sylvie', 'Théodore', 'Ursule', 'Victor', 'Willy', 'Xavier', 'Yvette',
  'Zacharie', 'Anastasie', 'Brice', 'Coralie', 'Denis', 'Elsa', 'Fidèle',
  'Ghislain', 'Hortense', 'Isidore', 'Josiane', 'Kévin', 'Laurette', 'Maurice',
  'Nadège', 'Ophélie', 'Patrice', 'Rosalie', 'Stanislas', 'Thérèse', 'Urbain',
  'Veronique', 'Wilfried', 'Yolande', 'Zoé', 'Abel', 'Becky'
];

const LAST_NAMES = [
  'Nkoulou', 'Mbarga', 'Atangana', 'Fotso', 'Tchinda', 'Nganou', 'Kamga',
  'Eyenga', 'Ndongo', 'Mba', 'Tanjong', 'Ngeh', 'Mbakam', 'Kouemo',
  'Ngassa', 'Djom', 'Foe', 'Kana', 'Nguetsop', 'Wouatlong', 'Ngo',
  'Ngom', 'Bikay', 'Tchoumi', 'Ngueguim', 'Mbida', 'Fossi', 'Nganso',
  'Zang', 'Kengne', 'Yimga', 'Ngoe', 'Mendji', 'Noumba',
  'Tedjou', 'Focho', 'Djo', 'Hamadjoda', 'Djamen', 'Ngankam',
  'Ndi', 'Abba', 'Bakari', 'Gadji', 'Harouna', 'Idriss',
  'Moussa', 'Oumarou', 'Salifou', 'Yaya', 'Aboubakar', 'Bello', 'Djibril'
];

const DESCRIPTIONS: Record<string, Record<string, string[]>> = {
  'OFFER': {
    'default': [
      (p: string, c: string) => `${p} de première qualité, disponible immédiatement à ${c}. Contactez pour prix de gros.`,
      (p: string, c: string) => `Vente de ${p} en excellent état. Livraison possible à ${c} et dans les environs.`,
      (p: string, c: string) => `Stock de ${p} disponible à ${c}. Meilleur prix du marché, qualité garantie.`,
      (p: string, c: string) => `${p} cultivé/produit localement à ${c}. Sans intermédiaire, prix direct producteur.`,
    ],
  },
  'DEMAND': {
    'default': [
      (p: string, c: string) => `Recherche ${p} en quantité. Paiement comptant, disponible à ${c}.`,
      (p: string, c: string) => `Acheteur sérieux cherche ${p}. Meilleur prix accepté à ${c}.`,
      (p: string, c: string) => `Besoin urgent de ${p}. Fournisseurs de ${c} bienvenus.`,
    ],
  },
  'SERVICE': {
    'emploi': [
      (p: string, c: string) => `Poste : ${p.replace('Emploi : ', '')}. Rémunération attractive. Lieu : ${c}. Envoyez CV.`,
      (p: string, c: string) => `Recrutement : ${p.replace('Emploi : ', '')}. Expérience min. 2 ans. ${c}.`,
      (p: string, c: string) => `Opportunité : ${p.replace('Emploi : ', '')}. Salaire compétitif. Logement possible à ${c}.`,
    ],
    'candidature': [
      (p: string, c: string) => `${p.replace('Demande d\'emploi : ', '')} disponible immédiatement. 5 ans d'expérience. Basé à ${c}.`,
      (p: string, c: string) => `Diplômé en ${p.replace('Demande d\'emploi : ', '')} cherche poste. Motivé. ${c}.`,
      (p: string, c: string) => `${p.replace('Demande d\'emploi : ', '')} - Références disponibles. Disponible à ${c}.`,
    ],
    'default': [
      (p: string, c: string) => `Service de ${p.toLowerCase()} professionnel. Intervention rapide sur ${c}.`,
      (p: string, c: string) => `${p} - Service fiable. Disponible à ${c} et environs. Devis gratuit.`,
      (p: string, c: string) => `Expert en ${p.toLowerCase()}. Satisfaction garantie à ${c}.`,
    ],
  },
};

const REVIEW_TEMPLATES_POSITIVE = [
  'Excellent vendeur ! Produit conforme à la description. Livraison rapide.',
  'Très satisfait de la transaction. Je recommande vivement.',
  'Produit de haute qualité, communication excellente. Merci !',
  'Vendeur sérieux et fiable. Transaction sans problème.',
  'Prix compétitif et produit en bon état. Merci beaucoup !',
  'Très professionnel. Le produit correspond parfaitement à l\'annonce.',
  'Service au top ! Je reviendrai sûrement. 5 étoiles méritées.',
  'Communication parfaite, produit livré en temps et en heure.',
  'Rapport qualité/prix imbattable. Vendeur honnête.',
  'Transaction rapide et efficace. Produit exactement comme décrit.',
];

const REVIEW_TEMPLATES_NEGATIVE = [
  'Produit correct mais livraison en retard. À améliorer.',
  'Communication un peu lente mais produit acceptable.',
  'Le produit n\'était pas exactement comme sur la photo.',
  'Prix un peu élevé par rapport à la qualité. Correct dans l\'ensemble.',
];

const REVIEW_TEMPLATES_NEUTRAL = [
  'Transaction correcte, rien à redire de spécial.',
  'Produit conforme. Délai de livraison normal.',
  'Correct, je recommande pour les petites commandes.',
];

// ===== UTILITAIRES =====
function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomPhone(): string {
  const prefixes = ['237 6', '237 7', '237 9', '237 2'];
  return random(prefixes) + String(Math.floor(Math.random() * 90000000 + 10000000));
}

function getImagesForProduct(productName: string): string {
  const imgs = PRODUCT_IMAGES[productName];
  if (!imgs || imgs.length === 0) return '[]';
  const count = Math.floor(Math.random() * 3) + 1; // 1 à 3 images
  const shuffled = shuffleArray(imgs);
  return JSON.stringify(shuffled.slice(0, count));
}

function getDescription(product: { name: string; type: string }, city: string): string {
  let key = 'default';
  if (product.type === 'SERVICE' && product.name.includes('Emploi :')) key = 'emploi';
  if (product.type === 'SERVICE' && product.name.includes('Demande d\'emploi')) key = 'candidature';

  const templates = DESCRIPTIONS[product.type]?.[key] || DESCRIPTIONS['OFFER']['default'];
  const template = random(templates);
  return template(product.name, city);
}

function getTags(product: { name: string; type: string }, category: string): string {
  const tags = [category.toLowerCase()];
  if (product.type === 'OFFER') tags.push('vente');
  if (product.type === 'DEMAND') tags.push('achat');
  if (product.type === 'SERVICE') {
    if (product.name.includes('Emploi')) tags.push('emploi', 'recrutement');
    else if (product.name.includes('Demande')) tags.push('candidature');
    else tags.push('service');
  }
  return JSON.stringify(tags);
}

// ===== TYPES D'UTILISATEURS =====
const USER_PROFILES: { role: string; plan: string; bio: string; isVerified: boolean; weight: number }[] = [
  {
    role: 'ADMIN', plan: 'PREMIUM', isVerified: true, weight: 1,
    bio: 'Administrateur de la plateforme Agryva. Passionné par l\'agriculture camerounaise.',
  },
  {
    role: 'VERIFIED', plan: 'PREMIUM', isVerified: true, weight: 8,
    bio: 'Agriculteur professionnel depuis 15 ans. Spécialiste en cultures vivrières.',
  },
  {
    role: 'VERIFIED', plan: 'PRO', isVerified: true, weight: 12,
    bio: 'Éleveur certifié. Animaux vaccinés et bien nourris. Livraison partout au Cameroun.',
  },
  {
    role: 'USER', plan: 'FREE', isVerified: false, weight: 60,
    bio: 'Agriculteur de la région. Vente de produits frais de saison.',
  },
  {
    role: 'USER', plan: 'STARTER', isVerified: false, weight: 19,
    bio: 'Vendeur de produits agricoles. Qualité et ponctualité.',
  },
];

function pickUserProfile(): typeof USER_PROFILES[0] {
  const totalWeight = USER_PROFILES.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const profile of USER_PROFILES) {
    r -= profile.weight;
    if (r <= 0) return profile;
  }
  return USER_PROFILES[3];
}

async function main() {
  console.log('🌱 Seeding Agryva database...\n');

  // Clear
  await db.review.deleteMany();
  await db.ad.deleteMany();
  await db.user.deleteMany();
  await db.category.deleteMany();
  console.log('✅ Cleared existing data');

  // Create categories
  const categoryMap: Record<string, any> = {};
  for (const cat of CATEGORIES) {
    const created = await db.category.create({
      data: {
        name: cat,
        slug: cat.toLowerCase().replace(/[^a-zàâéèêëïîôùûüÿçœæ]/g, '-').replace(/-+/g, '-'),
      }
    });
    categoryMap[cat] = created;
  }
  console.log(`✅ Created ${Object.keys(categoryMap).length} categories`);

  // Create 100 users with different profiles
  const TOTAL_USERS = 100;
  const users: any[] = [];
  const usedEmails = new Set<string>();
  const shuffledPhotos = shuffleArray(PROFILE_PHOTOS);

  for (let i = 0; i < TOTAL_USERS; i++) {
    const firstName = random(FIRST_NAMES);
    const lastName = random(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
    if (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}${Math.floor(Math.random() * 100)}@gmail.com`;
    }
    usedEmails.add(email);

    const region = random(REGIONS);
    const city = random(CITIES[region] || ['Yaoundé']);
    const phone = randomPhone();
    const profile = pickUserProfile();
    const avatar = i < shuffledPhotos.length ? shuffledPhotos[i] : null;

    const user = await db.user.create({
      data: {
        name,
        email,
        password: 'hashed_' + email,
        phone,
        region,
        city,
        role: i === 0 ? 'ADMIN' : profile.role,
        plan: i === 0 ? 'PREMIUM' : profile.plan,
        bio: profile.bio,
        avatar,
        isVerified: i === 0 ? true : profile.isVerified,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      }
    });
    users.push(user);
  }

  const admins = users.filter(u => u.role === 'ADMIN').length;
  const verified = users.filter(u => u.role === 'VERIFIED').length;
  const regular = users.filter(u => u.role === 'USER').length;
  const withAvatar = users.filter(u => u.avatar).length;
  console.log(`✅ Created ${users.length} users (${admins} admin, ${verified} verified, ${regular} regular, ${withAvatar} with photo)`);

  // Create 500 ads
  const TOTAL_ADS = 500;
  const MIN_ADS_PER_USER = 5;
  let adCount = 0;
  const createdAds: any[] = [];

  // Phase 1: 5 ads per user in different categories
  console.log(`\n📝 Creating ${MIN_ADS_PER_USER} ads per user...`);

  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    const userCategories = shuffleArray(CATEGORIES).slice(0, MIN_ADS_PER_USER);
    const userRegion = user.region;
    const userCities = CITIES[userRegion] || ['Yaoundé'];

    for (let c = 0; c < userCategories.length; c++) {
      const categoryName = userCategories[c];
      const products = PRODUCTS[categoryName] || [];
      const product = random(products);
      const city = random(userCities);
      const price = Math.round((product.priceRange[0] + Math.random() * (product.priceRange[1] - product.priceRange[0])) / 50) * 50;
      const quantity = product.type === 'SERVICE' ? '1' : String(Math.floor(Math.random() * 500) + 1);
      const description = getDescription(product, city);
      const tags = getTags(product, categoryName);
      const images = getImagesForProduct(product.name);
      const hasImages = images !== '[]';
      const statuses: ('ACTIVE' | 'SOLD' | 'PENDING')[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'SOLD', 'PENDING'];
      const status = random(statuses);

      const ad = await db.ad.create({
        data: {
          title: `${product.name} à ${city}`,
          description,
          price,
          quantity,
          priceUnit: product.unit,
          type: product.type,
          region: userRegion,
          city,
          author: { connect: { id: user.id } },
          category: { connect: { id: categoryMap[categoryName].id } },
          phone: user.phone,
          status,
          images,
          isFeatured: hasImages && Math.random() > 0.5,
          isUrgent: Math.random() > 0.75,
          negociable: Math.random() > 0.3,
          delivery: Math.random() > 0.4,
          tags,
          viewsCount: Math.floor(Math.random() * 800) + 10,
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        }
      });
      createdAds.push(ad);
      adCount++;
    }
  }
  console.log(`✅ Created ${adCount} guaranteed ads`);

  // Phase 2: Fill remaining
  const remaining = TOTAL_ADS - adCount;
  if (remaining > 0) {
    console.log(`📝 Creating ${remaining} additional ads...`);
    for (let i = 0; i < remaining; i++) {
      const categoryName = random(CATEGORIES);
      const products = PRODUCTS[categoryName] || [];
      const product = random(products);
      const region = random(REGIONS);
      const city = random(CITIES[region] || ['Yaoundé']);
      const seller = random(users);
      const price = Math.round((product.priceRange[0] + Math.random() * (product.priceRange[1] - product.priceRange[0])) / 50) * 50;
      const quantity = product.type === 'SERVICE' ? '1' : String(Math.floor(Math.random() * 500) + 1);
      const description = getDescription(product, city);
      const tags = getTags(product, categoryName);
      const images = getImagesForProduct(product.name);
      const hasImages = images !== '[]';
      const statuses: ('ACTIVE' | 'SOLD' | 'PENDING')[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'SOLD', 'PENDING'];
      const status = random(statuses);

      const ad = await db.ad.create({
        data: {
          title: `${product.name} à ${city}`,
          description, price, quantity, priceUnit: product.unit, type: product.type,
          region, city,
          author: { connect: { id: seller.id } },
          category: { connect: { id: categoryMap[categoryName].id } },
          phone: seller.phone, status, images, tags,
          isFeatured: hasImages && Math.random() > 0.5,
          isUrgent: Math.random() > 0.75,
          negociable: Math.random() > 0.3,
          delivery: Math.random() > 0.4,
          viewsCount: Math.floor(Math.random() * 800) + 10,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        }
      });
      createdAds.push(ad);
      adCount++;
    }
  }
  console.log(`✅ Total ads: ${adCount}`);

  // ===== ADD REVIEWS =====
  console.log('\n💬 Creating reviews...');
  let reviewCount = 0;

  // Only review ads that are SOLD or ACTIVE from verified/premium users
  const reviewableAds = createdAds.filter(ad =>
    ad.status === 'SOLD' || (ad.status === 'ACTIVE' && ad.viewsCount > 200)
  );
  const shuffledReviewableAds = shuffleArray(reviewableAds);

  const reviewsToCreate = Math.min(Math.floor(shuffledReviewableAds.length * 0.6), 200);

  for (let i = 0; i < reviewsToCreate; i++) {
    const ad = shuffledReviewableAds[i];
    const reviewer = random(users.filter(u => u.id !== ad.authorId));

    // 70% positive, 15% neutral, 15% negative
    let rating: number;
    let comment: string;
    const r = Math.random();
    if (r < 0.7) {
      rating = Math.random() < 0.5 ? 5 : 4;
      comment = random(REVIEW_TEMPLATES_POSITIVE);
    } else if (r < 0.85) {
      rating = 3;
      comment = random(REVIEW_TEMPLATES_NEUTRAL);
    } else {
      rating = Math.random() < 0.5 ? 2 : 1;
      comment = random(REVIEW_TEMPLATES_NEGATIVE);
    }

    try {
      await db.review.create({
        data: {
          rating,
          comment,
          adId: ad.id,
          authorId: reviewer.id,
          sellerId: ad.authorId,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        }
      });
      reviewCount++;
    } catch (err: any) {
      // Skip if review already exists for this ad/user combo
    }
  }
  console.log(`✅ Created ${reviewCount} reviews`);

  // ===== FINAL STATS =====
  const totalAds = await db.ad.count();
  const totalUsers = await db.user.count();
  const totalReviews = await db.review.count();
  const activeAds = await db.ad.count({ where: { status: 'ACTIVE' } });
  const soldAds = await db.ad.count({ where: { status: 'SOLD' } });
  const featuredAds = await db.ad.count({ where: { isFeatured: true, status: 'ACTIVE' } });
  const adsWithImages = await db.ad.findMany({ where: { images: { not: '[]' } } });
  const offerAds = await db.ad.count({ where: { type: 'OFFER' } });
  const demandAds = await db.ad.count({ where: { type: 'DEMAND' } });
  const serviceAds = await db.ad.count({ where: { type: 'SERVICE' } });
  const avgRating = totalReviews > 0 ? ((await db.review.aggregate({ _avg: { rating: true } }))._avg.rating || 0).toFixed(1) : 'N/A';

  console.log('\n🎉 Seeding completed!');
  console.log(`   👤 ${totalUsers} users`);
  console.log(`      🔑 ${admins} admin | ✅ ${verified} verified | 👤 ${regular} regular`);
  console.log(`      📸 ${withAvatar} with profile photo`);
  console.log(`   📋 ${totalAds} ads`);
  console.log(`      ✅ ${activeAds} active | 💰 ${soldAds} sold`);
  console.log(`      🟢 ${offerAds} OFFRE | 🟡 ${demandAds} DEMANDE | 🔵 ${serviceAds} SERVICE`);
  console.log(`      ⭐ ${featuredAds} featured | 🖼️  ${adsWithImages.length} with images`);
  console.log(`   💬 ${totalReviews} reviews (avg: ${avgRating}/5)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());