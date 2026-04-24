import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { Search as SearchIcon, Filter, ChevronDown, Star, X, SlidersHorizontal, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Single source of truth: URL Search Params
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseInt(searchParams.get('minPrice')) || 0;
    const maxPrice = parseInt(searchParams.get('maxPrice')) || 50000;
    const rating = parseFloat(searchParams.get('rating')) || 0;
    const sort = searchParams.get('sort') || 'newest';
    
    const [products, setProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await api.getCategories();
                setAllCategories(cats || []);
            } catch (err) { console.error(err); }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
            const params = {
                search: query,
                sort,
                limit: 100
            };
            if (category) params.category = category;
            if (minPrice > 0) params.minPrice = minPrice;
            if (maxPrice < 50000) params.maxPrice = maxPrice;
            if (rating > 0) params.rating = rating;
            
            const res = await api.getProducts(params);
                setProducts(res.data || []);
            } catch (error) { 
                console.error('Search failed:', error);
                setProducts([]);
            } finally { setLoading(false); }
        };
        fetchProducts();
    }, [query, category, minPrice, maxPrice, rating, sort]);

    const updateFilters = (newParams) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '' || (key === 'minPrice' && value === 0) || (key === 'maxPrice' && value === 50000) || (key === 'rating' && value === 0)) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    };

    const clearAll = () => {
        setSearchParams({});
        setShowMobileFilters(false);
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('Voice search is not supported.');
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (e) => navigate(`/search?q=${e.results[0][0].transcript}`);
        recognition.start();
    };

    const FilterSidebar = ({ isMobile = false }) => (
        <div className={cn(
            "space-y-10", 
            isMobile ? "pb-24" : "sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200"
        )}>
            {/* Sort (Only on Sidebar for Desktop) */}
            {!isMobile && (
                <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sort By</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'newest', label: 'Newest First' },
                            { id: 'price-low', label: 'Price: Low to High' },
                            { id: 'price-high', label: 'Price: High to Low' },
                            { id: 'rating', label: 'Highest Rated' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => updateFilters({ sort: opt.id })}
                                className={cn(
                                    "text-left px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border",
                                    sort === opt.id ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Brands */}
            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Popular Brands</h3>
                <div className="grid grid-cols-2 gap-2">
                    {['One Step', 'Nike', 'Adidas', 'Puma', 'Zara'].map(b => (
                        <button
                            key={b}
                            onClick={() => updateFilters({ q: query === b ? '' : b })}
                            className={cn(
                                "px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border",
                                query.toLowerCase() === b.toLowerCase() ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* Collections */}
            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Collections</h3>
                <div className="flex flex-wrap lg:grid lg:grid-cols-1 gap-2">
                    {allCategories.map(cat => {
                        const isSelected = category.split(',').includes(cat.name);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    const current = category ? category.split(',') : [];
                                    const next = isSelected 
                                        ? current.filter(c => c !== cat.name)
                                        : [...current, cat.name];
                                    updateFilters({ category: next.join(',') });
                                }}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border group",
                                    isSelected 
                                        ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" 
                                        : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                                )}
                            >
                                <span className="uppercase tracking-tight">{cat.name}</span>
                                <div className="flex items-center gap-2">
                                    {cat.productCount > 0 && (
                                        <span className={cn(
                                            "text-[9px] font-bold tabular-nums",
                                            isSelected ? "text-blue-400" : "text-slate-300"
                                        )}>{cat.productCount}</span>
                                    )}
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all",
                                        isSelected ? "bg-blue-600 scale-125" : "bg-slate-200 group-hover:bg-blue-400"
                                    )} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Price Range */}
            <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price Budget</h4>
                <div className="px-2">
                    <input
                        type="range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={maxPrice}
                        onChange={e => updateFilters({ maxPrice: e.target.value })}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase">₹0</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Up to ₹{maxPrice.toLocaleString()}</span>
                    </div>
                </div>
            </section>

            {/* Rating */}
            <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Rating</h4>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => updateFilters({ rating: rating === star ? 0 : star })}
                            className={cn("p-2 rounded-xl transition-all", rating >= star ? "text-amber-400 scale-110" : "text-slate-200 hover:text-slate-300")}
                        >
                            <Star className={cn("h-6 w-6", rating >= star && "fill-current")} />
                        </button>
                    ))}
                </div>
            </section>

            {isMobile && (
                <div className="pt-6 flex gap-4">
                    <button onClick={clearAll} className="flex-1 py-4 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        Reset
                    </button>
                    <button onClick={() => setShowMobileFilters(false)} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
                        View Results
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-20">
            <SEO title={query ? `Search: ${query}` : "All Collections"} />

            {/* Premium Sticky Search Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-50">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative group">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="text"
                                    defaultValue={query}
                                    onKeyDown={e => e.key === 'Enter' && updateFilters({ q: e.target.value })}
                                    placeholder="Search products, brands, categories..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
                                />
                                <button onClick={handleVoiceSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-xl text-blue-600 transition-colors">
                                    <Mic className="h-4 w-4" />
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200"
                            >
                                <Filter className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Active Filters Pill Bar */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                            {category && category.split(',').map(cat => (
                                <button key={cat} onClick={() => {
                                    const next = category.split(',').filter(c => c !== cat);
                                    updateFilters({ category: next.join(',') });
                                }} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-700 whitespace-nowrap">
                                    <span>{cat}</span>
                                    <X className="h-3 w-3" />
                                </button>
                            ))}
                            {rating > 0 && (
                                <button onClick={() => updateFilters({ rating: 0 })} className="flex items-center space-x-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-700 whitespace-nowrap">
                                    <span>{rating}+ Stars</span>
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            {maxPrice < 50000 && (
                                <button onClick={() => updateFilters({ maxPrice: 50000 })} className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-700 whitespace-nowrap">
                                    <span>Under ₹{maxPrice.toLocaleString()}</span>
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            {(category || rating > 0 || maxPrice < 50000) && (
                                <button onClick={clearAll} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 px-4">
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <FilterSidebar />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                {loading ? 'Discovering...' : `${products.length} Products Found`}
                            </h2>
                            <div className="lg:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Showing results for {query || 'All Collections'}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <SearchIcon className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No results matching your filters</h3>
                                <p className="text-slate-500 font-medium mb-8">Try adjusting your filters or search keywords.</p>
                                <button onClick={clearAll} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {products.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-50 p-8 shadow-2xl max-h-[90vh] overflow-y-auto lg:hidden"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Refine Collection</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <FilterSidebar isMobile />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

