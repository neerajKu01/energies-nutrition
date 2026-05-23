import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;
  const featured = searchParams.get('featured') || '';
  const bestseller = searchParams.get('bestseller') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ keyword, category, sort, page, limit: 12 });
      if (featured) params.append('featured', featured);
      if (bestseller) params.append('bestseller', bestseller);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [keyword, category, sort, page, featured, bestseller]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const pageTitle = bestseller ? 'Best Sellers' : featured ? 'Featured Products' : keyword ? `Search: "${keyword}"` : 'All Products';

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-layout">
          {/* Sidebar filters */}
          <aside className="sidebar">
            <h3 className="sidebar-title">FILTERS</h3>

            <div className="filter-group">
              <h4>Categories</h4>
              <button className={`filter-btn ${!category ? 'active' : ''}`} onClick={() => setParam('category', '')}>All</button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  className={`filter-btn ${category === c.slug ? 'active' : ''}`}
                  onClick={() => setParam('category', c.slug)}
                >{c.name}</button>
              ))}
            </div>

            <div className="filter-group">
              <h4>Sort By</h4>
              {[
                { label: 'Newest', val: '' },
                { label: 'Price: Low to High', val: 'price_asc' },
                { label: 'Price: High to Low', val: 'price_desc' },
                { label: 'Top Rated', val: 'rating' },
              ].map((s) => (
                <button
                  key={s.val}
                  className={`filter-btn ${sort === s.val ? 'active' : ''}`}
                  onClick={() => setParam('sort', s.val)}
                >{s.label}</button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="products-main">
            <div className="products-header">
              <h1 className="products-heading">{pageTitle}</h1>
              <span className="products-count">{total} products</span>
            </div>

            {loading ? (
              <div className="products-grid-list">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 380 }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <p>😕 No products found.</p>
                <button className="btn btn-outline" onClick={() => setSearchParams({})}>Clear filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid-list">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-btn ${page === p ? 'active' : ''}`}
                        onClick={() => setParam('page', p)}
                      >{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
