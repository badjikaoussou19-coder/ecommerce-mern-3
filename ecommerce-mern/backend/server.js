require('dotenv').config();
const connectDB = require('./config/db');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant : copiez .env.example vers .env');
  process.exit(1);
}

const app = require('./app');
const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`)));
