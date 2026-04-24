import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Star, ArrowLeft, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cn } from '../lib/utils';
import { SEO } from '../components/SEO';
import { resolveImageUrl } from '../lib/imageUrl';
export const CategoryProducts = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    useEffect(() => {
        const fetchData = async () => {
            if (!id)
                return;
            setLoading(true);
            try {
                // First fetch the category to get its name
                const categoryData = await api.getCategory(id);
                setCategory(categoryData);
                // Then fetch products using the category name (not UUID)
                const productsRes = await api.getProducts({ category: categoryData.name });
                setProducts(productsRes.data || []);
            }
            catch (error) {
                console.error('Error fetching category products:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"/>
      </div>);
    }
    if (!category) {
        return (<div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Category Not Found</h2>
        <Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200">
          Back to Home
        </Link>
      </div>);
    }
    return (<div className="max-w-7xl mx-auto px-4 py-12 sm:py-20">
      <SEO title={`${category.name}`} description={`Explore our premium collection of ${category.name}. High-quality fashion at the best prices.`}/>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-brand-600 transition-colors font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4"/>
            <span>Back to Home</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">{category.name}</h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl">{category.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setViewMode('grid')} className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
              <LayoutGrid className="h-5 w-5"/>
            </button>
            <button onClick={() => setViewMode('list')} className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
              <List className="h-5 w-5"/>
            </button>
          </div>
          <button className="flex items-center space-x-3 bg-white border border-slate-200 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm">
            <SlidersHorizontal className="h-4 w-4"/>
            <span>Filter</span>
          </button>
        </div>
      </div>

      {products.length === 0 ? (<div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <ShoppingCart className="h-16 w-16 text-slate-200 mx-auto mb-6"/>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No Products Yet</h3>
          <p className="text-slate-400 font-medium">We're currently updating our {category.name} collection.</p>
        </div>) : (<div className={cn("grid gap-8 sm:gap-10", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
          {products.map((product) => (<motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500", viewMode === 'list' && "flex flex-col sm:flex-row")}>
              <div className={cn("relative overflow-hidden", viewMode === 'grid' ? "aspect-[4/5]" : "w-full sm:w-72 aspect-[4/5] sm:aspect-square")}>
                <Link to={`/product/${product.id}`}>
                  <img src={resolveImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer"/>
                </Link>
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {product.discountPrice && (<div className="bg-brand-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-brand-200">
                      -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                    </div>)}
                  {product.isTrending && (<div className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-slate-200">
                      Trending
                    </div>)}
                </div>
                <button onClick={() => toggleWishlist(product)} className={cn("absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md", isInWishlist(product.id) ? "bg-rose-500 text-white shadow-rose-200" : "bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white")}>
                  <Heart className={cn("h-6 w-6", isInWishlist(product.id) && "fill-current")}/>
                </button>
              </div>

              <div className="p-8 sm:p-10 flex flex-col flex-grow">
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{product.brand || 'One Step'}</p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                      </Link>
                    </div>
                    <div className="flex items-center space-x-1 bg-slate-50 px-3 py-1.5 rounded-xl">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-current"/>
                      <span className="text-xs font-black text-slate-700">{product.rating}</span>
                    </div>
                  </div>
                  
                  {viewMode === 'list' && (<p className="text-slate-500 text-sm line-clamp-2 font-medium leading-relaxed">
                      {product.description}
                    </p>)}

                  <div className="flex items-baseline space-x-3">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">₹{product.discountPrice || product.price}</span>
                    {product.discountPrice && (<span className="text-sm font-bold text-slate-400 line-through">₹{product.price}</span>)}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
                  <button onClick={() => addToCart(product, 1)} className="flex-grow bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center space-x-3 active:scale-95">
                    <ShoppingCart className="h-4 w-4"/>
                    <span>Add to Cart</span>
                  </button>
                  <Link to={`/product/${product.id}`} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 transition-all">
                    <ArrowLeft className="h-5 w-5 rotate-180"/>
                  </Link>
                </div>
              </div>
            </motion.div>))}
        </div>)}
    </div>);
};
