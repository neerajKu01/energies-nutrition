/**
 * mockApi.js — Full offline API simulation using dummy data.
 * Activated when REACT_APP_USE_MOCK=true
 */
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_ORDERS, MOCK_USER } from './mockData';

const delay = (ms = 280) => new Promise((res) => setTimeout(res, ms));

// ── In-memory state (resets on page refresh — that's fine for demo) ──────────
let mockCart = {
  items: [
    { _id: 'ci1', product: MOCK_PRODUCTS[0], quantity: 1, flavor: 'Chocolate Fudge', weight: '1kg' },
    { _id: 'ci2', product: MOCK_PRODUCTS[2], quantity: 2, flavor: 'Unflavored', weight: '500g' },
    { _id: 'ci3', product: MOCK_PRODUCTS[10], quantity: 1, flavor: '', weight: '60 capsules' },
  ],
};
let mockOrders = [...MOCK_ORDERS];

const getStoredUser = () => JSON.parse(localStorage.getItem('energienutrition_user') || 'null');

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseUrl = (url) => {
  try { return new URL('http://mock' + url); }
  catch { return new URL('http://mock/'); }
};

// ─────────────────────────────────────────────────────────────────────────────
const mockApi = {

  // ── GET ────────────────────────────────────────────────────────────────────
  get: async (url) => {
    await delay();

    // /auth/me
    if (url === '/auth/me') {
      const user = getStoredUser();
      if (!user) throw { response: { status: 401, data: { message: 'Not authorized' } } };
      return { data: user };
    }

    // /categories
    if (url === '/categories') return { data: MOCK_CATEGORIES };

    // /cart
    if (url === '/cart') return { data: mockCart };

    // /orders/my  (must come BEFORE /orders/:id)
    if (url === '/orders/my') return { data: mockOrders };

    // /orders  (admin — all orders)
    if (url === '/orders') return { data: mockOrders };

    // /orders/:id
    const orderMatch = url.match(/^\/orders\/([\w]+)$/);
    if (orderMatch) {
      const order = mockOrders.find((o) => o._id === orderMatch[1]);
      if (!order) throw { response: { status: 404, data: { message: 'Order not found' } } };
      return { data: order };
    }

    // /products/:id  — must come BEFORE the generic /products handler
    const productIdMatch = url.match(/^\/products\/([\w]+)$/);
    if (productIdMatch) {
      const product = MOCK_PRODUCTS.find((p) => p._id === productIdMatch[1]);
      if (!product) throw { response: { status: 404, data: { message: 'Product not found' } } };
      return { data: product };
    }

    // /products  (with optional query params)
    if (url.startsWith('/products')) {
      const parsed   = parseUrl(url);
      const keyword    = parsed.searchParams.get('keyword')    || '';
      const category   = parsed.searchParams.get('category')   || '';
      const sort       = parsed.searchParams.get('sort')        || '';
      const limit      = parseInt(parsed.searchParams.get('limit'))  || 12;
      const page       = parseInt(parsed.searchParams.get('page'))   || 1;
      const featured   = parsed.searchParams.get('featured')   === 'true';
      const bestseller = parsed.searchParams.get('bestseller') === 'true';

      let products = [...MOCK_PRODUCTS];

      if (keyword)    products = products.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (p.tags || []).some((t) => t.includes(keyword.toLowerCase()))
      );
      if (category)   products = products.filter((p) =>
        p.category.slug === category ||
        p.category.name.toLowerCase().replace(/\s+/g, '-') === category ||
        p.category.name.toLowerCase() === category.toLowerCase()
      );
      if (featured)   products = products.filter((p) => p.isFeatured);
      if (bestseller) products = products.filter((p) => p.isBestSeller);

      if (sort === 'price_asc')  products.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
      else if (sort === 'rating')     products.sort((a, b) => b.rating - a.rating);
      else products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));

      const total = products.length;
      const paginated = products.slice((page - 1) * limit, page * limit);
      return { data: { products: paginated, total, page, pages: Math.ceil(total / limit) } };
    }

    return { data: null };
  },

  // ── POST ───────────────────────────────────────────────────────────────────
  post: async (url, body = {}) => {
    await delay(450);

    // /auth/login
    if (url === '/auth/login') {
      if (body.email === 'demo@energienutrition.com' && body.password === 'demo123') {
        return { data: MOCK_USER };
      }
      throw { response: { status: 401, data: { message: 'Invalid credentials — use demo@energienutrition.com / demo123' } } };
    }

    // /auth/register
    if (url === '/auth/register') {
      const newUser = { ...MOCK_USER, name: body.name, email: body.email, phone: body.phone || '', isAdmin: false };
      return { data: newUser };
    }

    // /cart  (add / update item)
    if (url === '/cart') {
      const { productId, quantity, flavor = '', weight = '' } = body;
      const product = MOCK_PRODUCTS.find((p) => p._id === productId);
      if (!product) throw { response: { status: 404, data: { message: 'Product not found' } } };

      const existIdx = mockCart.items.findIndex(
        (i) => i.product._id === productId && i.flavor === flavor && i.weight === weight
      );
      if (existIdx > -1) {
        mockCart.items[existIdx].quantity = quantity;
      } else {
        mockCart.items.push({ _id: 'ci' + Date.now(), product, quantity, flavor, weight });
      }
      return { data: { ...mockCart } };
    }

    // /orders  (place order)
    if (url === '/orders') {
      const newOrder = {
        _id: 'ord' + Date.now(),
        user: MOCK_USER,
        items: body.items || [],
        shippingAddress: body.shippingAddress,
        paymentMethod: body.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'placed',
        itemsPrice: body.itemsPrice,
        shippingPrice: body.shippingPrice,
        totalPrice: body.totalPrice,
        trackingNumber: null,
        createdAt: new Date().toISOString(),
      };
      mockOrders.unshift(newOrder);
      return { data: newOrder };
    }

    // /products/:id/reviews
    const reviewMatch = url.match(/^\/products\/([\w]+)\/reviews$/);
    if (reviewMatch) {
      const product = MOCK_PRODUCTS.find((p) => p._id === reviewMatch[1]);
      if (product) {
        const user = getStoredUser();
        const rev = {
          _id: 'r' + Date.now(),
          name: user?.name || 'Anonymous',
          rating: Number(body.rating),
          comment: body.comment,
          createdAt: new Date().toISOString().split('T')[0],
        };
        product.reviews.unshift(rev);
        product.numReviews = product.reviews.length;
        product.rating = +(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1);
      }
      return { data: { message: 'Review added' } };
    }

    // /products  (admin create)
    if (url === '/products') {
      const catObj = MOCK_CATEGORIES.find((c) => c._id === body.category) || MOCK_CATEGORIES[0];
      const newProduct = {
        _id: 'p' + Date.now(),
        ...body,
        category: catObj,
        images: Array.isArray(body.images) ? body.images : (body.images ? [body.images] : []),
        flavors: Array.isArray(body.flavors) ? body.flavors : [],
        weights: Array.isArray(body.weights) ? body.weights : [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        rating: 0,
        numReviews: 0,
        reviews: [],
      };
      MOCK_PRODUCTS.unshift(newProduct);
      return { data: newProduct };
    }

    // /categories  (admin create)
    if (url === '/categories') {
      const newCat = { _id: 'cat' + Date.now(), ...body, slug: body.name.toLowerCase().replace(/\s+/g, '-') };
      MOCK_CATEGORIES.push(newCat);
      return { data: newCat };
    }

    return { data: { message: 'OK' } };
  },

  // ── PUT ────────────────────────────────────────────────────────────────────
  put: async (url, body = {}) => {
    await delay(380);

    // /auth/profile
    if (url === '/auth/profile') {
      const stored = getStoredUser() || MOCK_USER;
      const updated = { ...stored, ...body, token: stored.token };
      localStorage.setItem('energienutrition_user', JSON.stringify(updated));
      return { data: updated };
    }

    // /orders/:id/status
    const orderStatusMatch = url.match(/^\/orders\/([\w]+)\/status$/);
    if (orderStatusMatch) {
      const order = mockOrders.find((o) => o._id === orderStatusMatch[1]);
      if (order) {
        order.orderStatus = body.status;
        if (body.trackingNumber) order.trackingNumber = body.trackingNumber;
      }
      return { data: order };
    }

    // /products/:id  (admin update)
    const productMatch = url.match(/^\/products\/([\w]+)$/);
    if (productMatch) {
      const idx = MOCK_PRODUCTS.findIndex((p) => p._id === productMatch[1]);
      if (idx > -1) {
        const catObj = body.category
          ? (MOCK_CATEGORIES.find((c) => c._id === body.category) || MOCK_PRODUCTS[idx].category)
          : MOCK_PRODUCTS[idx].category;
        Object.assign(MOCK_PRODUCTS[idx], { ...body, category: catObj });
      }
      return { data: MOCK_PRODUCTS[idx] };
    }

    // /categories/:id  (admin update)
    const catMatch = url.match(/^\/categories\/([\w]+)$/);
    if (catMatch) {
      const idx = MOCK_CATEGORIES.findIndex((c) => c._id === catMatch[1]);
      if (idx > -1) Object.assign(MOCK_CATEGORIES[idx], body);
      return { data: MOCK_CATEGORIES[idx] };
    }

    return { data: { message: 'Updated' } };
  },

  // ── DELETE ─────────────────────────────────────────────────────────────────
  delete: async (url) => {
    await delay(280);

    // /cart  (clear entire cart — check EXACT match FIRST)
    if (url === '/cart') {
      mockCart.items = [];
      return { data: { message: 'Cart cleared' } };
    }

    // /cart/:itemId  (remove single item)
    const cartMatch = url.match(/^\/cart\/([\w]+)$/);
    if (cartMatch) {
      mockCart.items = mockCart.items.filter((i) => i._id !== cartMatch[1]);
      return { data: { ...mockCart } };
    }

    // /products/:id  (admin delete)
    const productMatch = url.match(/^\/products\/([\w]+)$/);
    if (productMatch) {
      const idx = MOCK_PRODUCTS.findIndex((p) => p._id === productMatch[1]);
      if (idx > -1) MOCK_PRODUCTS.splice(idx, 1);
      return { data: { message: 'Product deleted' } };
    }

    // /categories/:id  (admin delete)
    const catMatch = url.match(/^\/categories\/([\w]+)$/);
    if (catMatch) {
      const idx = MOCK_CATEGORIES.findIndex((c) => c._id === catMatch[1]);
      if (idx > -1) MOCK_CATEGORIES.splice(idx, 1);
      return { data: { message: 'Category deleted' } };
    }

    return { data: { message: 'Deleted' } };
  },
};

export default mockApi;
