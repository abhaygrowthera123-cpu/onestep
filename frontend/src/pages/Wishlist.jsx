import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
export const Wishlist = () => {
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    return (<div className="max-w-7xl mx-auto px-4 py-12 sm:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
        <div className="space-y-2">
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Your Selection</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Favorites</h1>
        </div>
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">
          {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} Saved
        </p>
      </div>

      {wishlist.length === 0 ? (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
            <Heart className="h-10 w-10"/>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Your favorites list is empty</h2>
          <p className="text-slate-500 font-medium mb-8">Save pieces you love to keep track of them.</p>
          <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
            Explore Collection
          </button>
        </motion.div>) : (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {wishlist.map((product) => (<motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <ProductCard product={product}/>
              </motion.div>))}
          </AnimatePresence>
        </div>)}

      {/* Recommended Section */}
      <div className="mt-32 space-y-12">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Curated for you</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Trending Now</h2>
          </div>
          <Link to="/search" className="group flex items-center space-x-2 text-slate-400 hover:text-blue-600 transition-colors font-black text-sm uppercase tracking-widest">
            <span>View All</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
        {/* We can add a few trending products here if needed, or just a placeholder */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 opacity-40 grayscale pointer-events-none">
           {[1, 2, 3, 4].map(i => (<div key={i} className="aspect-[3/4] bg-slate-100 rounded-[2rem] animate-pulse"/>))}
        </div>
      </div>
    </div>);
};
