# Boutik — Application e-commerce MERN

Application web de vente en ligne (MongoDB, Express, React, Node.js) réalisée d'après le cahier des charges.

## Prérequis
- Node.js 18 ou plus
- MongoDB en local (`mongodb://127.0.0.1:27017`) ou une base MongoDB Atlas

## Installation

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # puis adaptez MONGO_URI et JWT_SECRET
npm run seed                # crée l'admin, un client, les catégories et 12 produits
npm run dev                 # API sur http://localhost:5000
```

### 2. Frontend (dans un second terminal)
```bash
cd frontend
npm install
npm run dev                 # site sur http://localhost:5173
```

## Comptes de test (créés par `npm run seed`)
| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@boutik.sn | Admin123! |
| Client | client@boutik.sn | Client123! |

Codes promo de démonstration : `BIENVENUE10` (−10 %) et `TABASKI5000` (−5 000 FCFA dès 20 000 FCFA). Le seed crée aussi 18 commandes sur 30 jours (pour les graphiques) et quelques avis.

## Fonctionnalités
**Client** : inscription, connexion, catalogue, recherche par nom, filtre par catégorie, détail produit, panier (ajout, suppression, quantité, total), commande avec adresse de livraison, suivi de « Mes commandes » (annulation tant que la commande est en attente), modification du profil.

**Administrateur** : tableau de bord (produits, clients, commandes, ventes), ajout / modification / suppression de produits (avec envoi d'image), création de catégories, consultation de toutes les commandes et changement de statut (En attente → Confirmée → Expédiée → Livrée, ou Annulée).

**Codes promo** : le client saisit un code dans le panier (aperçu de la remise) ; l'admin crée des codes en pourcentage ou en montant fixe, avec minimum de commande, nombre d'utilisations maximum et date d'expiration, et peut les activer / désactiver (page *Codes promo*). La remise est recalculée et l'utilisation du code réservée côté serveur ; une commande annulée rend l'utilisation du code.

**Avis et favoris** : un client peut noter un produit (1 à 5 étoiles + commentaire) une fois sa commande livrée, un seul avis par produit (un nouvel envoi le remplace) ; la note moyenne s'affiche sur les cartes et la fiche produit. Le cœur ajoute un produit aux favoris (page *Favoris*).

**Tableau de bord** : histogramme des ventes sur 30 jours, 5 meilleurs produits, commandes par statut.

**Sécurité** : mots de passe hachés avec bcrypt, authentification JWT, routes protégées côté API et côté React, gestion des rôles (le rôle admin ne peut pas être choisi à l'inscription).

**Règles métier** : le prix et le total d'une commande sont recalculés côté serveur ; le stock est décrémenté à la commande et remis en vente si la commande est annulée ; numéros de commande #1001, #1002…

## API
| Méthode | Route | Accès |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET / PUT | /api/auth/profile | connecté |
| GET | /api/products?search=&category= | public |
| GET | /api/products/:id | public |
| POST / PUT / DELETE | /api/products, /api/products/:id | admin |
| POST | /api/products/upload | admin |
| GET | /api/categories | public |
| POST / DELETE | /api/categories, /api/categories/:id | admin |
| GET | /api/orders | admin (toutes les commandes) |
| GET | /api/orders/mine | connecté (mes commandes) |
| POST | /api/orders | connecté |
| GET | /api/orders/:id | propriétaire ou admin |
| PUT | /api/orders/:id | admin (statut) ; client (annuler si en attente) |
| GET | /api/stats | admin (ventes par jour, meilleurs produits, statuts) |
| POST | /api/coupons/validate | connecté |
| GET / POST / PUT / DELETE | /api/coupons, /api/coupons/:id | admin |
| GET | /api/products/:id/reviews | public |
| POST | /api/products/:id/reviews | client ayant reçu le produit |
| DELETE | /api/reviews/:id | auteur ou admin |
| GET | /api/favorites | connecté |
| PUT / DELETE | /api/favorites/:productId | connecté |
| GET | /api/health | public (contrôle de santé) |

## Structure
```
backend/   app.js, server.js, config, models (User, Product, Category, Order, Coupon, Review), controllers, routes, middleware, utils, tests, seed.js
frontend/  src/pages (+ admin), components, context (Auth, Cart, Favorites), api.js, styles.css
docker-compose.yml, render.yaml, .github/workflows/ci.yml
```

## Tests
```bash
cd backend
npm install
npm test
```
Jest + Supertest, avec une base MongoDB en mémoire (`mongodb-memory-server` télécharge un binaire MongoDB au premier lancement, une connexion Internet est donc nécessaire la première fois). Ils couvrent l'authentification et les rôles, le calcul des commandes côté serveur, le stock, les codes promo (expiration, minimum, épuisement, annulation), les avis, les favoris et les statistiques. L'intégration continue (GitHub Actions) lance les tests et le build du frontend à chaque push.

## Déploiement

### Docker (tout-en-un)
```bash
cp .env.docker.example .env      # puis changez JWT_SECRET
docker compose up --build
docker compose exec backend node seed.js   # données de démonstration (efface la base)
```
La boutique est disponible sur http://localhost:8080 (nginx sert le frontend et redirige `/api` et `/uploads` vers le backend). MongoDB et les images envoyées sont conservées dans des volumes Docker.

### Render + MongoDB Atlas
1. Créez un cluster gratuit sur MongoDB Atlas et récupérez l'URI de connexion (autorisez l'accès réseau depuis Render).
2. Poussez le projet sur GitHub, puis sur Render : *New → Blueprint* (le fichier `render.yaml` crée l'API et le site statique).
3. Renseignez `MONGO_URI`, `CLIENT_URL` (URL du site) et `VITE_API_URL` (URL de l'API, sans `/api`), puis redéployez le site statique pour que la variable soit prise en compte.
4. Lancez le seed une fois (onglet *Shell* du service API : `node seed.js`), puis **changez les mots de passe des comptes de démonstration**.

Les images envoyées sont stockées sur le disque du serveur : sur Render, il faut un disque persistant (offre payante, déjà prévu dans `render.yaml`), sinon elles disparaissent à chaque redéploiement. Pour éviter cette contrainte, utilisez des URL d'images externes ou un stockage type Cloudinary.

### Vercel pour le frontend
Importez le dossier `frontend`, définissez `VITE_API_URL` avec l'URL du backend ; `vercel.json` gère les routes React Router. Définissez aussi `CLIENT_URL` côté backend avec l'URL Vercel (CORS).

## Idées pour aller plus loin
Paiement en ligne (Wave, Orange Money, Stripe), notifications par e-mail ou SMS, plusieurs images par produit, stockage d'images externe (Cloudinary), limitation de débit et en-têtes de sécurité (helmet).
