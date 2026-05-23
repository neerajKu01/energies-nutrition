/**
 * SuppX Database Seeder
 * Run: node seeder.js         → seeds categories + products
 * Run: node seeder.js --clear → clears all data
 * Run: node seeder.js --admin → creates admin user
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected to MongoDB'));

// ─── Categories ────────────────────────────────────────────────────────────────
const categoriesData = [
  { name: 'Proteins', description: 'Whey, Casein, Plant-based protein powders' },
  { name: 'Pre-Workout', description: 'Energy, focus and pump formulas' },
  { name: 'Creatine', description: 'Creatine monohydrate and blends' },
  { name: 'Vitamins and Supplements', description: 'Multivitamins, vitamin D, vitamin C' },
  { name: 'Omega', description: 'Fish oil and omega-3 fatty acid supplements' },
  { name: 'Aminos', description: 'BCAAs, EAAs, and amino acid complexes' },
  { name: 'Gainer', description: 'Mass and weight gainer supplements' },
  { name: 'Health and Wellness', description: 'General health and wellness products' },
];

// ─── Products ───────────────────────────────────────────────────────────────────
// categoryId will be filled in dynamically
const getProducts = (catMap) => [
  {
    name: 'Whey Protein Gold Standard',
    description: 'Premium whey protein isolate with 24g protein per serving. Perfect for post-workout recovery and muscle building. Digestive enzymes added for better absorption.',
    price: 2999,
    originalPrice: 3999,
    brand: 'SuppX',
    stock: 150,
    category: catMap['Proteins'],
    flavors: ['Chocolate', 'Vanilla', 'Strawberry', 'Cookies & Cream'],
    weights: ['500g', '1kg', '2kg'],
    isFeatured: true,
    isBestSeller: true,
    rating: 4.7,
    numReviews: 124,
    tags: ['whey', 'protein', 'isolate', 'muscle'],
    images: ['https://placehold.co/600x600/1a1a1a/f5a623?text=Whey+Protein'],
  },
  {
    name: 'Pre-Workout Ignite X',
    description: 'Explosive pre-workout formula with 200mg caffeine, 6g citrulline, and 3.2g beta-alanine. Experience unmatched energy, pump, and focus every session.',
    price: 1999,
    originalPrice: 2999,
    brand: 'SuppX',
    stock: 80,
    category: catMap['Pre-Workout'],
    flavors: ['Blue Raspberry', 'Watermelon', 'Green Apple'],
    weights: ['300g (30 servings)', '600g (60 servings)'],
    isFeatured: true,
    isBestSeller: true,
    rating: 4.8,
    numReviews: 89,
    tags: ['pre-workout', 'caffeine', 'pump', 'energy'],
    images: ['https://placehold.co/600x600/1a1a1a/4cc9f0?text=Pre-Workout'],
  },
  {
    name: 'Creatine Monohydrate Pure',
    description: 'Micronized creatine monohydrate for faster dissolution and absorption. 5g per serving for maximum strength, power output, and muscle volumization.',
    price: 999,
    originalPrice: 1499,
    brand: 'SuppX',
    stock: 200,
    category: catMap['Creatine'],
    flavors: ['Unflavored'],
    weights: ['250g', '500g', '1kg'],
    isFeatured: false,
    isBestSeller: true,
    rating: 4.9,
    numReviews: 210,
    tags: ['creatine', 'strength', 'power', 'monohydrate'],
    images: ['https://placehold.co/600x600/1a1a1a/80ed99?text=Creatine'],
  },
  {
    name: 'BCAA 2:1:1 Intra-Workout',
    description: 'Optimal 2:1:1 ratio of leucine, isoleucine, and valine. Promotes muscle protein synthesis, reduces muscle soreness, and prevents muscle breakdown during training.',
    price: 1499,
    originalPrice: 1999,
    brand: 'SuppX',
    stock: 120,
    category: catMap['Aminos'],
    flavors: ['Mango', 'Pineapple', 'Lemon'],
    weights: ['250g', '500g'],
    isFeatured: false,
    isBestSeller: true,
    rating: 4.5,
    numReviews: 67,
    tags: ['bcaa', 'amino', 'recovery', 'intra-workout'],
    images: ['https://placehold.co/600x600/1a1a1a/f72585?text=BCAA'],
  },
  {
    name: 'Omega-3 Fish Oil 1000mg',
    description: '1000mg fish oil with 300mg EPA and 200mg DHA per softgel. Supports heart health, reduces inflammation, and improves joint mobility.',
    price: 699,
    originalPrice: 999,
    brand: 'SuppX',
    stock: 300,
    category: catMap['Omega'],
    flavors: [],
    weights: ['60 softgels', '120 softgels'],
    isFeatured: false,
    isBestSeller: true,
    rating: 4.6,
    numReviews: 145,
    tags: ['omega', 'fish-oil', 'heart', 'joints'],
    images: ['https://placehold.co/600x600/1a1a1a/7209b7?text=Omega+3'],
  },
  {
    name: 'Multivitamin Daily Shield',
    description: '23 essential vitamins and minerals in one daily tablet. Supports immunity, energy metabolism, and overall wellness. 100% RDA of key nutrients.',
    price: 599,
    originalPrice: 899,
    brand: 'SuppX',
    stock: 400,
    category: catMap['Vitamins and Supplements'],
    flavors: [],
    weights: ['30 tablets', '60 tablets', '90 tablets'],
    isFeatured: true,
    isBestSeller: false,
    rating: 4.4,
    numReviews: 88,
    tags: ['vitamins', 'multivitamin', 'immunity', 'wellness'],
    images: ['https://placehold.co/600x600/1a1a1a/f5a623?text=Multivitamin'],
  },
  {
    name: 'Mass Gainer 3000',
    description: '75g carbs and 27g protein per serving. Designed for hardgainers who struggle to build mass. Fortified with creatine, glutamine, and digestive enzymes.',
    price: 3499,
    originalPrice: 4999,
    brand: 'SuppX',
    stock: 60,
    category: catMap['Gainer'],
    flavors: ['Chocolate Fudge', 'Banana', 'Vanilla'],
    weights: ['1kg', '3kg', '5kg'],
    isFeatured: true,
    isBestSeller: false,
    rating: 4.3,
    numReviews: 52,
    tags: ['gainer', 'mass', 'bulk', 'calories'],
    images: ['https://placehold.co/600x600/1a1a1a/e63946?text=Mass+Gainer'],
  },
  {
    name: 'Plant Protein Vegan Blend',
    description: 'Complete vegan protein from pea, brown rice and hemp. 20g protein per serving with all essential amino acids. Dairy-free, gluten-free, and soy-free.',
    price: 2499,
    originalPrice: 3200,
    brand: 'SuppX',
    stock: 90,
    category: catMap['Proteins'],
    flavors: ['Chocolate', 'Vanilla Bean'],
    weights: ['500g', '1kg'],
    isFeatured: true,
    isBestSeller: false,
    rating: 4.5,
    numReviews: 43,
    tags: ['vegan', 'plant-protein', 'dairy-free', 'pea-protein'],
    images: ['https://placehold.co/600x600/1a1a1a/80ed99?text=Vegan+Protein'],
  },
  {
    name: 'EAA Complete Recovery',
    description: 'All 9 essential amino acids in clinically dosed amounts. Supports muscle recovery, reduces DOMS, and maintains positive nitrogen balance throughout the day.',
    price: 1799,
    originalPrice: 2299,
    brand: 'SuppX',
    stock: 75,
    category: catMap['Aminos'],
    flavors: ['Grape', 'Orange', 'Mixed Berry'],
    weights: ['300g'],
    isFeatured: false,
    isBestSeller: false,
    rating: 4.6,
    numReviews: 31,
    tags: ['eaa', 'amino', 'recovery', 'essential'],
    images: ['https://placehold.co/600x600/1a1a1a/f5a623?text=EAA'],
  },
  {
    name: 'Vitamin D3 + K2 5000 IU',
    description: 'Synergistic combination of vitamin D3 and K2 for optimal calcium absorption and bone health. Essential for those with limited sun exposure.',
    price: 499,
    originalPrice: 699,
    brand: 'SuppX',
    stock: 500,
    category: catMap['Vitamins and Supplements'],
    flavors: [],
    weights: ['60 capsules', '120 capsules'],
    isFeatured: false,
    isBestSeller: true,
    rating: 4.8,
    numReviews: 192,
    tags: ['vitamin-d', 'vitamin-k2', 'bone-health', 'immunity'],
    images: ['https://placehold.co/600x600/1a1a1a/ffc347?text=Vitamin+D3'],
  },
  {
    name: 'Caffeine + L-Theanine Focus',
    description: '200mg caffeine paired with 200mg L-theanine for clean, jitter-free energy and focus. The nootropic stack used by elite performers.',
    price: 799,
    originalPrice: 1200,
    brand: 'SuppX',
    stock: 150,
    category: catMap['Pre-Workout'],
    flavors: [],
    weights: ['60 capsules', '90 capsules'],
    isFeatured: false,
    isBestSeller: false,
    rating: 4.7,
    numReviews: 76,
    tags: ['caffeine', 'focus', 'nootropic', 'energy'],
    images: ['https://placehold.co/600x600/1a1a1a/4cc9f0?text=Focus+Stack'],
  },
  {
    name: 'Creatine HCL Advanced',
    description: 'Creatine hydrochloride — more soluble than monohydrate, no loading phase required, no bloating. 1.5g per serving is equivalent to 5g of monohydrate.',
    price: 1499,
    originalPrice: 1999,
    brand: 'SuppX',
    stock: 100,
    category: catMap['Creatine'],
    flavors: ['Unflavored', 'Fruit Punch'],
    weights: ['90g', '180g'],
    isFeatured: false,
    isBestSeller: false,
    rating: 4.5,
    numReviews: 38,
    tags: ['creatine', 'hcl', 'strength', 'no-loading'],
    images: ['https://placehold.co/600x600/1a1a1a/80ed99?text=Creatine+HCL'],
  },
];

// ─── Seed function ─────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    // Clear existing
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('🗑️  Cleared categories and products');

    // Insert categories
    const createdCats = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCats.forEach((c) => (catMap[c.name] = c._id));
    console.log(`✅ Seeded ${createdCats.length} categories`);

    // Insert products
    const products = getProducts(catMap);
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    console.log('\n🎉 Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

const clearAll = async () => {
  try {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('🗑️  All data cleared');
  } catch (err) {
    console.error('❌ Clear failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

const createAdmin = async () => {
  try {
    const existing = await User.findOne({ email: 'admin@suppx.com' });
    if (existing) {
      existing.isAdmin = true;
      await existing.save();
      console.log('✅ Existing user promoted to admin');
    } else {
      await User.create({
        name: 'SuppX Admin',
        email: 'admin@suppx.com',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('✅ Admin created: admin@suppx.com / admin123');
    }
  } catch (err) {
    console.error('❌ Admin creation failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

// Run based on CLI args
const arg = process.argv[2];
if (arg === '--clear') clearAll();
else if (arg === '--admin') createAdmin();
else seed();
