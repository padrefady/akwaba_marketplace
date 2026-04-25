const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const REGIONS = ["Centre","Littoral","Ouest","Nord-Ouest","Sud-Ouest","Sud","Est","Nord","Extreme-Nord","Adamaoua"];
const CITIES = {Centre:["Yaounde","Mbalmayo","Bafia","Obala","Sangmelima","Ebolowa","Mfou","Soa","Bokito"],Littoral:["Douala","Bonaberi","Makepe","Kumba","Edea","Loum","Manjo"],Ouest:["Bafoussam","Dschang","Foumban","Mbouda","Bafang"],"Nord-Ouest":["Bamenda","Nkwen","Bui","Ndu","Wum","Kumbo"],"Sud-Ouest":["Buea","Limbe","Tiko","Mamfe","Bokova"],Sud:["Ebolowa","Kribi","Campo","Lolodorf","Ambam"],Est:["Bertoua","Abong-Mbang","Doume","Yokadouma","Batouri"],Nord:["Garoua","Ngaoundere","Guider","Lagdo","Tchollire"],"Extreme-Nord":["Maroua","Kousseri","Yagoua","Mokolo","Kaele","Mora"],Adamaoua:["Ngaoundere","Meiganga","Tibati","Banyo","Ngaoundal"]};
const FIRST = ["Jean","Marie","Paul","Grace","Emmanuel","Clarisse","Alain","Issouf","Veronica","Bertrand","Anastasie","Fabrice","Carine","Patrice","Nadege","Herve","Brigitte","Rodrigue","Estelle","Gilbert","Gisele","Maurice","Serge","Therese","Armand","Beatrice","Celestin","Denise","Edouard","Florence","Gaston","Henriette","Ibrahim","Juliette","Karl","Leontine","Maxime","Noelle","Olivier","Prudence","Quentin","Rosalie","Samuel","Tresor","Valentin","Willy","Xavier","Yolande","Zacharie","Adele","Blaise","Cynthia","Didier","Eugenie","Felicite","Gervais","Hortense","Josiane","Kevin","Lucie","Modeste","Nathalie","Oscar","Pascaline","Raoul","Sylvie","Thierry","Virginie","Wenceslas","Abel","Belinda","Dorothée","Elisee","Fabiola","Gael","Helene","Irene","Jerome","Kenza","Lionel","Murielle"];
const LAST = ["Mbi","Tchinda","Fofey","Achu","Nganou","Ndongo","Kamga","Abba","Esimi","Tagne","Nkoulou","Mbarga","Fotso","Nkou","Assoumou","Djameni","Tamen","Ngassa","Eyenga","Ngo","Moukouri","Biyong","Ebane","Njike","Tchouanku","Mboupda","Nguedia","Yonta","Kouam","Ngoe","Mandombe","Fezeu","Sop","Ndi","Njifor","Tchamda","Ngamaleu","Fossi","Kuete","Nguetseng","Makoge","Ekom","Nchare","Abolo","Mey","Tchoupo","Nsame","Fondja","Ngansop","Eyong","Enow","Mbella","Ayangma","Ngwa","Alobwede","Mvondo","Nkotto","Ngnitedem","Manga","Tchuente","Ngakout","Feudjio","Moukoko","Zanga","Nke","Bessa"];
const CATS = ["cereales","legumineuses","tubercules","fruits-legumes","betail-volaille","poissons","produits-forestiers","engrais-intrants","equipements","services-agricoles","terres","aliments-transformes"];
const CAT_NAMES = {cereales:"Cereales",legumineuses:"Legumineuses",tubercules:"Tubercules & Racines","fruits-legumes":"Fruits & Legumes","betail-volaille":"Betail & Volaille",poissons:"Poissons & Produits de la Mer","produits-forestiers":"Produits Forestiers","engrais-intrants":"Engrais & Intrants",equipements:"Equipements & Machineries","services-agricoles":"Services Agricoles",terres:"Terres & Proprietes","aliments-transformes":"Aliments Transformes"};
const CAT_ICONS = {cereales:"Wheat",legumineuses:"Bean",tubercules:"Carrot","fruits-legumes":"Apple","betail-volaille":"Cow",poissons:"Fish","produits-forestiers":"TreePine","engrais-intrants":"FlaskConical",equipements:"Tractor","services-agricoles":"Wrench",terres:"MapPin","aliments-transformes":"Package"};
const PRODS = {cereales:{n:["Mais","Riz","Mil","Sorgho","Arachide","Avoine","Sesame"],u:["sac 50kg","sac 25kg","kg","tonne"],p:[3000,80000],a:["de qualite superieure","bio certifie","sec et trie","fraichement recolte","stock optimal"]},legumineuses:{n:["Niebe","Haricot rouge","Haricot blanc","Pois d angole","Soja","Voandzou"],u:["kg","sac 50kg","sac 25kg"],p:[1500,45000],a:["bien sec","sans parasite","recolte recente","variété locale"]},tubercules:{n:["Manioc","Macabo","Igname","Patate douce","Tarot","Gingembre"],u:["kg","botte","tonne"],p:[200,35000],a:["frais du jour","variété amelioree","sans traitement chimique"]},"fruits-legumes":{n:["Plantain","Banane","Tomate","Piment","Oignon","Ail","Carotte","Chou","Epinard"],u:["regime","kg","caisse","botte"],p:[500,25000],a:["mur et pret","bio","sans pesticide","frais de la ferme"]},"betail-volaille":{n:["Poulet de chair","Poule pondeuse","Chevre","Mouton","Bouf","Porc","Canard","Lapin","Pintade"],u:["piece","tete","kg","lot de 10"],p:[1500,350000],a:["sain et vaccine","nourri aux aliments naturels","de race amelioree"]},poissons:{n:["Tilapia","Poisson-chat","Bar","Sardine","Crevette","Carpe"],u:["piece","kg","plateau","caisse"],p:[1000,45000],a:["frais du jour","d elevage","grand calibre","vivant"]},"produits-forestiers":{n:["Bois de chauffe","Charbon","Njansang","Kernels","Bambou","Rotin"],u:["sac","stere","kg","botte"],p:[2000,120000],a:["sec","de qualite","certifie"]},"engrais-intrants":{n:["NPK 15-15-15","Uree 46%","Engrais organique","Herbicide","Pesticide","Semences ameliorees","Compost"],u:["sac 50kg","sac 25kg","litre","kg"],p:[5000,85000],a:["certifie","haut rendement","bio"]},equipements:{n:["Tracteur","Moteur-pompe","Pulverisateur","Decortiqueuse","Batteuse","Charrue","Motoculteur","Sechoir","Balance"],u:["piece","ensemble","forfait jour","heure"],p:[15000,8500000],a:["etat neuf","bon etat","revisé","garantie 1 an"]},"services-agricoles":{n:["Labour mecanique","Analyse de sol","Formation agricole","Conseil phytosanitaire","Transport","Emballage","Transformation","Location d entrepot","Gestion de ferme"],u:["forfait","heure","hectare","jour"],p:[5000,200000],a:["professionnel","experié","rapide","fiable"]},terres:{n:["Terrain agricole","Parcelle fertile","Ferme complete","Riziere","Plantation","Verger","Serre"],u:["hectare","m2","parcelle"],p:[500000,50000000],a:["sol fertile","titre foncier","eau disponible"]},"aliments-transformes":{n:["Cafe moulu","Huile de palme","Beurre de karite","Gari","Farine de manioc","Bobolo","Fufu","Miondo","Miel"],u:["sachet","litre","bouteille","kg","seau"],p:[500,25000],a:["artisanal","100% naturel","sans conservateur","certifie bio"]}};

function R(a){return a[Math.floor(Math.random()*a.length)]}
function RI(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function RP(a,b){return Math.round((Math.random()*(b-a)+a)/50)*50}
function mkEmail(f,l){const d=["gmail.com","yahoo.fr","hotmail.com","outlook.com"];const c=(s)=>String(s).toLowerCase().replace(/[^a-z]/g,"").substring(0,8);return c(f)+"."+c(l)+RI(1,999)+"@"+R(d)}
function mkPhone(){return "+237 6 "+RI(10,99)+" "+RI(10,99)+" "+RI(10,99)+" "+RI(10,99)}

async function main(){
  console.log("=== AGRYVA MASS SEED ===");
  console.log("Cleaning...");
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

  console.log("Creating 12 categories...");
  const cats=[];
  for(let i=0;i<CATS.length;i++){cats.push(await prisma.category.create({data:{name:CAT_NAMES[CATS[i]],icon:CAT_ICONS[CATS[i]],slug:CATS[i],order:i+1}}))}

  console.log("Creating 3 plans...");
  await prisma.paymentPlan.createMany({data:[
    {name:"FREE",displayName:"Gratuit",price:0,maxAds:2,features:JSON.stringify(["2 annonces gratuites","Messagerie illimitee","Profil basique"]),isPopular:false},
    {name:"PREMIUM",displayName:"Premium",price:5000,maxAds:50,features:JSON.stringify(["50 annonces","Sans publicite","Badge Premium","Support prioritaire"]),isPopular:true},
    {name:"VIP",displayName:"VIP",price:15000,maxAds:999,features:JSON.stringify(["Annonces illimitees","Assistance IA","Badge VIP","Support 24/7"]),isPopular:false}
  ]});

  console.log("Creating 100 users...");
  const pw=await bcrypt.hash("Demo1234!",12);
  const users=[];
  const emails=new Set();
  for(let i=0;i<100;i++){
    const f=FIRST[i],l=LAST[i];
    let em=mkEmail(f,l);
    let tries=0;
    while(emails.has(em)&&tries<50){em=mkEmail(f,l)+tries;tries++;}
    emails.add(em);
    const reg=R(REGIONS);
    const city=R(CITIES[reg]||["Yaounde"]);
    const role=i<55?"SELLER":i<75?"BUYER":"BOTH";
    const plan=i<25?"FREE":i<65?R(["PREMIUM","FREE"]):R(["VIP","PREMIUM"]);
    users.push(await prisma.user.create({data:{
      email:em,password:pw,name:f+" "+l,phone:mkPhone(),
      bio:"Acteur du secteur agricole en "+reg+".",
      location:city+", "+reg,region:reg,city:city,
      role:role,plan:plan,isVerified:Math.random()>0.25,isOnline:Math.random()>0.6
    }}));
  }
  console.log("100 users done.");

  console.log("Creating 500 ads...");
  const imgs=["/seed/ad-plantains.png","/seed/ad-maize.png","/seed/ad-poultry.png","/seed/ad-fish.png","/seed/ad-cassava.png","/seed/ad-fertilizer.png","/seed/ad-tractor.png","/seed/ad-coffee.png"];
  const cond=["FRESH","NEW","PROCESSED","USED"];
  let count=0;
  const perCat=Math.floor(500/CATS.length);

  for(let c=0;c<CATS.length;c++){
    const slug=CATS[c];
    const cat=PRODS[slug];
    const n=cat.n, u=cat.u, adj=cat.a;
    const max=c<CATS.length-1?perCat:500-count;

    for(let i=0;i<max;i++){
      count++;
      const name=R(n);
      const ad=R(adj);
      const unit=R(u);
      const reg=R(REGIONS);
      const city=R(CITIES[reg]||["Yaounde"]);
      const type=slug==="services-agricoles"?"SERVICE":(Math.random()>0.15?"OFFER":"DEMAND");
      const price=type==="DEMAND"?null:RP(cat.p[0],cat.p[1]);
      const author=R(users.filter(u=>type==="DEMAND"?(u.role==="BUYER"||u.role==="BOTH"):(u.role==="SELLER"||u.role==="BOTH")));

      let title=name+" "+(type==="DEMAND"?"recherche":"disponible")+" - "+city+", "+reg;
      let desc="Proposition de "+name+" "+ad+" a "+city+", "+reg+". Qualite garantie, prix competitive. Contactez-nous pour toute commande.";
      if(type==="DEMAND"){
        title="Recherche "+name+" - "+city+", "+reg;
        desc="Je recherche "+name+" "+ad+" en quantite. Livraison souhaitee a "+city+". Paiement comptant.";
      }
      if(type==="SERVICE"){
        title="Service "+name+" professionnel - "+city+", "+reg;
        desc="Prestation de "+name+" "+ad+" a "+city+", "+reg+". Intervention rapide, resultat garanti. Devis gratuit.";
      }

      try{
        await prisma.ad.create({data:{
          authorId:author.id,title:title,description:desc,
          price:price,priceUnit:type==="DEMAND"?null:unit,
          type:type,categorySlug:slug,
          condition:type==="SERVICE"?null:R(cond),
          quantity:type==="SERVICE"?null:(type==="DEMAND"?RI(1,10)+" "+unit+"(s) par mois":RI(10,500)+" "+unit+"(s)"),
          location:city+", "+reg,region:reg,city:city,
          images:JSON.stringify(Math.random()>0.5?[R(imgs)]:[]),
          status:Math.random()>0.1?"ACTIVE":"SOLD",
          isFeatured:Math.random()>0.7,isUrgent:Math.random()>0.8,
          viewsCount:RI(5,1200),negociable:Math.random()>0.2,delivery:Math.random()>0.3,
          tags:JSON.stringify([name.toLowerCase(),slug,reg.toLowerCase(),city.toLowerCase()])
        }});
      }catch(e){}
      if(count%100===0) console.log("  "+count+" ads...");
    }
  }
  console.log(count+" ads created.");

  console.log("Creating reviews and conversations...");
  for(let i=0;i<150;i++){
    const allAds=await prisma.ad.findMany({take:500});
    if(!allAds.length)break;
    const ad=R(allAds);
    const rev=R(users.filter(u=>u.id!==ad.authorId));
    try{await prisma.review.create({data:{rating:RI(3,5),comment:"Bon produit, je recommande.",adId:ad.id,reviewerId:rev.id,reviewedId:ad.authorId}});}catch(e){}
  }
  for(let i=0;i<60;i++){
    const allAds=await prisma.ad.findMany({take:500});
    if(!allAds.length)break;
    const ad=R(allAds);
    const other=R(users.filter(u=>u.id!==ad.authorId));
    try{
      const conv=await prisma.conversation.create({data:{user1Id:other.id,user2Id:ad.authorId,adId:ad.id}});
      await prisma.message.createMany({data:[
        {content:"Bonjour, est-ce encore disponible ?",type:"TEXT",conversationId:conv.id,senderId:other.id,receiverId:ad.authorId},
        {content:"Bonjour, oui disponible ! Combien en souhaitez-vous ?",type:"TEXT",conversationId:conv.id,senderId:ad.authorId,receiverId:other.id,isRead:true,readAt:new Date()}
      ]});
    }catch(e){}
  }

  console.log("========================================");
  console.log("  AGRYVA MASS SEED COMPLETED!");
  console.log("  Users: 100 | Ads: "+count+" | Reviews: 150 | Convos: 60");
  console.log("  Password: Demo1234!");
  console.log("========================================");
}

main().catch(e=>{console.error("FAILED:",e);process.exit(1)}).finally(()=>prisma.$disconnect());