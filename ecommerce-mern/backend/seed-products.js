// Ajoute des produits supplémentaires SANS effacer les données existantes
// (utilisateurs, commandes, produits déjà créés restent intacts).
// Usage : npm run seed:products
// Pour ajouter vos propres produits, complétez simplement la liste ci-dessous.
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const PRODUITS = [
  // Électronique
  { categorie: 'Électronique', name: 'Écouteurs sans fil', price: 15000, stock: 35, description: 'Écouteurs Bluetooth 5.3 avec boîtier de charge, 24 h d\'autonomie.' },
  { categorie: 'Électronique', name: 'Clavier sans fil', price: 14000, stock: 28, description: 'Clavier compact AZERTY, touches silencieuses.' },
  { categorie: 'Électronique', name: 'Power bank 20 000 mAh', price: 17500, stock: 45, description: 'Batterie externe avec deux ports USB et un port USB-C.' },
  { categorie: 'Électronique', name: 'Webcam Full HD', price: 19000, stock: 18, description: 'Webcam 1080p avec microphone intégré, idéale pour les cours en ligne.' },
  { categorie: 'Électronique', name: 'Clé USB 64 Go', price: 5500, stock: 100, description: 'Clé USB 3.0 compacte et rapide.' },
  { categorie: 'Électronique', name: 'Montre connectée', price: 38000, stock: 14, description: 'Suivi d\'activité, notifications et écran AMOLED.' },
  { categorie: 'Électronique', name: 'Lampe de bureau LED', price: 11000, stock: 26, description: 'Lampe réglable avec 3 niveaux de luminosité.' },
  { categorie: 'Électronique', name: 'Câble USB-C 2 m', price: 3000, stock: 120, description: 'Câble renforcé, charge rapide et transfert de données.' },

  // Vêtements
  { categorie: 'Vêtements', name: 'Chemise en lin', price: 14500, stock: 30, description: 'Chemise légère et respirante, parfaite pour la chaleur.' },
  { categorie: 'Vêtements', name: 'Robe wax', price: 25000, stock: 16, description: 'Robe en tissu wax aux motifs colorés, coupe évasée.' },
  { categorie: 'Vêtements', name: 'Pantalon chino', price: 16000, stock: 34, description: 'Pantalon droit en coton, plusieurs coloris.' },
  { categorie: 'Vêtements', name: 'Sweat à capuche', price: 19500, stock: 40, description: 'Sweat molletonné avec poche kangourou.' },
  { categorie: 'Vêtements', name: 'Polo piqué', price: 9500, stock: 55, description: 'Polo en coton piqué, col classique.' },
  { categorie: 'Vêtements', name: 'Ensemble sportif', price: 21000, stock: 22, description: 'Veste et pantalon de jogging respirants.' },
  { categorie: 'Vêtements', name: 'Jupe longue', price: 12500, stock: 19, description: 'Jupe fluide taille élastique.' },

  // Chaussures
  { categorie: 'Chaussures', name: 'Chaussures de running', price: 32000, stock: 20, description: 'Semelle amortissante et tige respirante.' },
  { categorie: 'Chaussures', name: 'Mocassins en cuir', price: 26000, stock: 15, description: 'Mocassins élégants, cuir souple.' },
  { categorie: 'Chaussures', name: 'Tongs de plage', price: 3500, stock: 90, description: 'Tongs légères et antidérapantes.' },
  { categorie: 'Chaussures', name: 'Bottines en cuir', price: 34000, stock: 9, description: 'Bottines robustes avec semelle crantée.' },
  { categorie: 'Chaussures', name: 'Sandales à talon', price: 18000, stock: 17, description: 'Sandales confortables avec talon de 5 cm.' },
  { categorie: 'Chaussures', name: 'Baskets montantes', price: 30000, stock: 21, description: 'Baskets hautes style streetwear.' },

  // Accessoires
  { categorie: 'Accessoires', name: 'Ceinture en cuir', price: 8000, stock: 40, description: 'Ceinture réversible noir et marron.' },
  { categorie: 'Accessoires', name: 'Portefeuille homme', price: 7500, stock: 33, description: 'Portefeuille en cuir avec 6 emplacements pour cartes.' },
  { categorie: 'Accessoires', name: 'Sac à main', price: 24000, stock: 13, description: 'Sac à main élégant avec bandoulière amovible.' },
  { categorie: 'Accessoires', name: 'Casquette', price: 5000, stock: 60, description: 'Casquette réglable en coton.' },
  { categorie: 'Accessoires', name: 'Bracelet en perles', price: 4500, stock: 48, description: 'Bracelet artisanal fait à la main.' },
  { categorie: 'Accessoires', name: 'Foulard en soie', price: 9500, stock: 25, description: 'Foulard léger aux motifs africains.' },
  { categorie: 'Accessoires', name: 'Parapluie pliant', price: 6000, stock: 38, description: 'Parapluie compact résistant au vent.' },

  // Nouvelle catégorie
  { categorie: 'Maison', name: 'Bouilloire électrique', price: 13500, stock: 24, description: 'Bouilloire 1,7 L avec arrêt automatique.' },
  { categorie: 'Maison', name: 'Ventilateur sur pied', price: 28000, stock: 12, description: 'Ventilateur 3 vitesses, hauteur réglable.' },
  { categorie: 'Maison', name: 'Set de 6 verres', price: 6500, stock: 50, description: 'Verres en verre trempé, passent au lave-vaisselle.' },
  { categorie: 'Maison', name: 'Oreiller ergonomique', price: 9000, stock: 27, description: 'Oreiller à mémoire de forme, housse lavable.' },
  { categorie: 'Maison', name: 'Thermos 1 L', price: 8500, stock: 31, description: 'Garde les boissons chaudes 12 h et froides 24 h.' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');

  let ajoutes = 0;
  let ignores = 0;
  const cache = {};

  for (const { categorie, ...data } of PRODUITS) {
    if (!cache[categorie]) {
      cache[categorie] = (await Category.findOne({ name: categorie })) || (await Category.create({ name: categorie }));
    }
    if (await Product.exists({ name: data.name })) {
      ignores++;
      continue;
    }
    await Product.create({ ...data, category: cache[categorie]._id });
    ajoutes++;
  }

  console.log(`${ajoutes} produit(s) ajouté(s), ${ignores} déjà présent(s) (ignoré(s)).`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});