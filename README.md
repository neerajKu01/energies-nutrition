# energie-nutrition — MERN Stack E-Commerce

A full-featured supplements & vitamins e-commerce website built with the MERN stack (MongoDB, Express, React, Node.js), inspired by [suppx.co.in](https://www.suppx.co.in/).

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Axios, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Styling | Pure CSS with CSS Variables |

---

## 📁 Project Structure

```
suppx-clone/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema + password hashing
│   │   ├── Product.js       # Product schema with reviews
│   │   ├── Category.js      # Category schema
│   │   └── Order.js         # Order schema
│   ├── routes/
│   │   ├── authRoutes.js    # Register, login, profile
│   │   ├── productRoutes.js # CRUD + search + reviews
│   │   ├── orderRoutes.js   # Place & manage orders
│   │   ├── cartRoutes.js    # Cart stored in MongoDB
│   │   └── categoryRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js # JWT protect + admin guard
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js + Navbar.css
        │   ├── ProductCard.js + ProductCard.css
        │   └── Footer.js + Footer.css
        ├── context/
        │   ├── AuthContext.js   # Login/register/logout state
        │   └── CartContext.js   # Cart state + API calls
        ├── pages/
        │   ├── Home.js          # Hero, categories, product grids
        │   ├── Products.js      # Listing with filters & pagination
        │   ├── ProductDetail.js # Detail + reviews
        │   ├── Cart.js          # Cart page
        │   ├── Checkout.js      # Order placement
        │   ├── Orders.js        # My orders list
        │   ├── Login.js
        │   └── Register.js
        ├── utils/
        │   └── api.js           # Axios instance with interceptors
        ├── App.js               # Routing
        └── index.css            # Global styles & design tokens
```

---

## ⚙️ Setup & Run

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/suppx
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev     # uses nodemon

# Terminal 2 — Frontend
cd frontend
npm start       # React dev server on port 3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | 🔒 | Get profile |
| PUT | `/api/auth/profile` | 🔒 | Update profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List (keyword, category, sort, page) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | 🔒 Admin | Create |
| PUT | `/api/products/:id` | 🔒 Admin | Update |
| DELETE | `/api/products/:id` | 🔒 Admin | Delete |
| POST | `/api/products/:id/reviews` | 🔒 | Add review |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | 🔒 | Place order |
| GET | `/api/orders/my` | 🔒 | My orders |
| GET | `/api/orders/:id` | 🔒 | Order detail |
| GET | `/api/orders` | 🔒 Admin | All orders |
| PUT | `/api/orders/:id/status` | 🔒 Admin | Update status |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | 🔒 | Get cart |
| POST | `/api/cart` | 🔒 | Add/update item |
| DELETE | `/api/cart/:itemId` | 🔒 | Remove item |
| DELETE | `/api/cart` | 🔒 | Clear cart |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | — | All categories |
| POST | `/api/categories` | 🔒 Admin | Create |
| PUT | `/api/categories/:id` | 🔒 Admin | Update |
| DELETE | `/api/categories/:id` | 🔒 Admin | Delete |

---

## 🌟 Features

- **Authentication** — Register, login, JWT-based protected routes
- **Product Catalog** — Search, filter by category, sort, pagination
- **Product Detail** — Image gallery, flavor/size variants, reviews & ratings
- **Shopping Cart** — Persisted in MongoDB per user
- **Checkout** — Shipping address + payment method selection
- **Order Management** — Full order history with status tracking
- **Admin Ready** — All admin routes gated behind `isAdmin` flag
- **Responsive** — Mobile-first design
- **Dark Theme** — Black & gold premium aesthetic matching SuppX brand

---

## 🧩 Seeding Sample Data

Create an admin user via the register API, then set `isAdmin: true` in MongoDB:
```js
// In MongoDB shell or Compass
db.users.updateOne({ email: "admin@suppx.com" }, { $set: { isAdmin: true } })
```

Then add categories and products via POST requests with the admin JWT token.

---

## 📦 Deployment

**Backend** → Deploy to Railway, Render, or any Node.js host. Set `MONGO_URI` to MongoDB Atlas URI.

**Frontend** → Build with `npm run build` and deploy to Vercel, Netlify, or serve via Express static.

```bash
# Add to backend server.js for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
}
```
