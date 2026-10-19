const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const payload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  token: sign(user._id),
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (await User.findOne({ email: String(email || '').toLowerCase() })) {
    res.status(400);
    throw new Error('Un compte existe déjà avec cet email');
  }
  // Le rôle est toujours "client" à l'inscription (un admin se crée via le seed)
  const user = await User.create({ name, email, password, phone, address, role: 'client' });
  res.status(201).json(payload(user));
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect');
  }
  res.json(payload(user));
});

// GET /api/auth/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json(payload(req.user));
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, email, phone, address, password } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (password) user.password = password;
  await user.save();
  res.json(payload(user));
});
