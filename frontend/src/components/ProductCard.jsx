import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'motion/react';
import { resolveImageUrl } from '../lib/imageUrl';

export const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const discount = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full"
        >
            {/* Image */}
            <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                    src={resolveImageUrl(product.images?.[0]) || product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                />

                {/* Discount badge */}
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                        {discount}% OFF
                    </div>
                )}

                {/* Trending badge */}
                {product.isTrending && (
                    <div className="absolute top-2 right-10 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                        TRENDING
                    </div>
                )}

                {/* Wishlist */}
                <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                    className={`absolute top-2 right-2 p-2 rounded-xl shadow-md transition-all ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
                >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
            </Link>

            {/* Info */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Category tag */}
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{product.brand || product.category}</span>

                <Link to={`/product/${product.id}`} className="mb-2">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Stars */}
                <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating || 4) ? 'text-blue-500 fill-blue-500' : 'text-slate-200 fill-slate-200'}`} />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">{product.reviewsCount || 0} Ratings</span>
                </div>

                {/* Price + Cart */}
                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <div className="text-lg font-black text-slate-900">₹{product.discountPrice || product.price}</div>
                        {product.discountPrice && (
                            <div className="text-xs text-slate-400 line-through">₹{product.price}</div>
                        )}
                    </div>
                    <button
                        onClick={() => addToCart(product, 1)}
                        className="flex items-center space-x-1.5 bg-slate-900 hover:bg-black text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-100"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
