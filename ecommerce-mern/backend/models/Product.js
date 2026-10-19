const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Le nom du produit est obligatoire'], trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: [true, 'Le prix est obligatoire'], min: [0, 'Le prix doit être positif'] },
    image: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'La catégorie est obligatoire'] },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    stock: { type: Number, required: [true, 'Le stock est obligatoire'], min: [0, 'Le stock ne peut pas être négatif'], default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
