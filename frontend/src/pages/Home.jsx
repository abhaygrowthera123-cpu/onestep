import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { SEO } from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Mic, ShoppingCart, Heart, Star, ChevronRight, Tag, Zap, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { resolveImageUrl } from '../lib/imageUrl';

/* ─── Hero Banners ──────────────────────────────────────── */
const BANNERS = [
  {
    id: 1,
    tag: 'Haute Couture 2026 ✨',
    title: 'THE LUXE EDIT',
    sub: 'Exclusive wholesale collections from top designers',
    cta: 'Explore Collection',
    href: '/search',
    bg: 'from-slate-950 via-slate-900 to-slate-800',
    image: '/uploads/images/banner-couture.png',
  },
  {
    id: 2,
    tag: 'Bespoke Tailoring',
    title: 'MODERN GENTLEMEN',
    sub: 'Premium men\'s apparel for retail partners',
    cta: 'Shop Wholesale',
    href: '/search?category=Men',
    bg: 'from-blue-900 to-indigo-950',
    image: '/uploads/images/banner-men.png',
  },
  {
    id: 3,
    tag: 'Market Trends',
    title: 'SEASONAL SELECTIONS',
    sub: 'Stay ahead with high-demand trending styles',
    cta: 'View Trends',
    href: '/search?isTrending=true',
    bg: 'from-purple-900 via-violet-950 to-slate-900',
    image: '/uploads/images/banner-trending.png',
  },
];

/* ─── Mini Product Card ─────────────────────────────────── */
const MiniProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img
            src={resolveImageUrl(product.images?.[0]) || product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
            {discount}% OFF
          </div>
        )}
        {product.isTrending && (
          <div className="absolute top-2 right-2 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">
            TRENDING
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute bottom-2 right-2 p-1.5 rounded-xl shadow-md transition-all ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </button>
      </Link>
      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-1.5 group-hover:text-blue-600 transition-colors">{product.name}</p>
        </Link>
        <div className="flex items-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({product.reviewsCount || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-slate-900">₹{product.discountPrice || product.price}</span>
            {product.discountPrice && <span className="text-[10px] text-slate-400 line-through ml-1">₹{product.price}</span>}
          </div>
          <button
            onClick={() => addToCart(product, 1)}
            className="p-1.5 bg-blue-600 hover:bg-slate-900 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Home Component ───────────────────────────────── */
export const Home = () => {
  const [products, setProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, deals, cats] = await Promise.all([
          api.getProducts({ isTrending: true, limit: 8 }),
          api.getProducts({ sort: 'price-low', limit: 6 }),
          api.getCategories(),
        ]);
        setProducts(trending.data || []);
        setDealProducts(deals.data || []);
        setCategories(cats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const banner = BANNERS[bannerIdx];

  return (
    <div className="bg-white min-h-screen pb-24 md:pb-8 font-sans">
      <SEO title="Premium Fashion Marketplace" description="Shop Onestep-Hub for the latest in couture and wholesale fashion." />

      {/* ── Sticky Search Bar ─── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
              placeholder="What are you looking for today?"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600">
              <Mic className="h-4 w-4" />
            </button>
          </div>
          <button type="submit" className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap shadow-xl shadow-slate-200">
            Search
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ── Hero Banner Carousel ──── */}
        <div className="mx-4 mt-4 rounded-3xl overflow-hidden relative shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.45 }}
              className={`bg-gradient-to-r ${banner.bg} p-6 md:p-8 flex items-center justify-between min-h-[180px] md:min-h-[220px]`}
            >
              <div className="flex-1 space-y-2">
                <span className="inline-block bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {banner.tag}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">{banner.title}</h2>
                <p className="text-white/90 font-bold text-sm">{banner.sub}</p>
                <Link to={banner.href}
                  className="inline-block bg-white text-gray-900 font-black text-sm px-6 py-2.5 rounded-2xl hover:bg-gray-100 transition-all shadow-lg mt-2">
                  {banner.cta}
                </Link>
              </div>
              <div className="w-36 md:w-52 shrink-0">
                <img src={banner.image} alt="" className="w-full h-full object-cover rounded-2xl shadow-xl" />
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className={`h-2 rounded-full transition-all ${i === bannerIdx ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        </div>

        {/* ── Categories Grid ───── */}
        {categories.length > 0 && (
          <div className="px-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Shop by Category</h2>
              </div>
              <Link to="/search" className="text-blue-600 text-xs font-black flex items-center hover:underline">View All <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(Array.isArray(categories) ? categories : []).slice(0, 6).map(cat => (
                <Link key={cat.id} to={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                  <img src={resolveImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-[11px] font-black text-white uppercase tracking-wide block">{cat.name}</span>
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{cat.productCount || 0} Products</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Deal of the Day ──── */}
        {dealProducts.length > 0 && (
          <div className="mt-6">
            <div className="mx-4 mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-sm flex items-center space-x-2 shadow-lg shadow-slate-200">
                  <Tag className="h-4 w-4" />
                  <span>CURATED DEALS</span>
                  <span className="bg-blue-600 text-white text-xs rounded-lg px-1.5 py-0.5">%</span>
                </div>
              </div>
              <Link to="/search?sort=price-low" className="text-blue-600 text-xs font-black flex items-center">See All <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Array.isArray(dealProducts) ? dealProducts : []).map(product => (
                <MiniProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* ── Trending Products ─── */}
        <div className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Trending Now</h2>
            </div>
            <Link to="/search?isTrending=true" className="text-blue-600 text-xs font-black flex items-center">See All <ChevronRight className="h-4 w-4" /></Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-t-2xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">No trending products yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Array.isArray(products) ? products : []).map(product => (
                <MiniProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* ── Trust Badges ──── */}
        <div className="mx-4 mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Award, label: 'Quality Assured', sub: 'Premium Check' },
            { icon: Zap, label: 'Express Delivery', sub: 'AP & Telangana' },
            { icon: Tag, label: 'Value Pricing', sub: 'Best in Class' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-white rounded-2xl p-4 flex flex-col items-center text-center border border-slate-100 shadow-sm transition-all hover:scale-105">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-2">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
