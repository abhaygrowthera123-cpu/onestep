import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { 
  Star, 
  ShoppingCart, 
  Zap, 
  Heart, 
  Share2, 
  ChevronLeft, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Package,
  Truck,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { cn } from '../lib/utils';
import { resolveImageUrl } from '../lib/imageUrl';

export const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ count: 0, rating: 0 });
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const productData = await api.getProduct(id);
                if (productData) {
                    setProduct(productData);
                    if (productData.sizes?.length > 0) setSelectedSize(productData.sizes[0]);
                    if (productData.colors?.length > 0) setSelectedColor(productData.colors[0]);
                    
                    // Fetch reviews
                    const reviewsRes = await api.getReviews(id);
                    setReviews(reviewsRes.data || []);
                    setReviewStats({ count: productData.reviewsCount, rating: productData.rating });

                    // Fetch related
                    const productsRes = await api.getProducts();
                    setRelatedProducts(productsRes.data.filter(p => p.category === productData.category && p.id !== id).slice(0, 4));
                }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );

    if (!product) return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Info className="h-12 w-12 text-gray-300" />
        <h2 className="text-xl font-black text-slate-900">Product not found</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 font-black uppercase text-sm">Return Home</button>
      </div>
    );

    const discount = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            <SEO title={product.name} description={product.description} />

            {/* Sticky Top Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-base font-black text-gray-900 truncate max-w-[200px]">Product Info</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600"><Share2 className="h-5 w-5" /></button>
                    <button onClick={() => toggleWishlist(product)} className={`p-2 transition-all ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}>
                        <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                    <Link to="/cart" className="p-2 text-gray-400"><ShoppingCart className="h-5 w-5" /></Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Image Section */}
                <div className="bg-white border-b border-gray-100 relative group">
                    <div className="aspect-square md:aspect-[4/3] overflow-hidden bg-gray-50">
                        <img
                            src={resolveImageUrl(product.images?.[activeImage]) || product.images?.[activeImage]}
                            alt={product.name}
                            className="w-full h-full object-contain md:object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    {/* Thumbnails */}
                    {product.images?.length > 1 && (
                      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                          {product.images.map((img, idx) => (
                              <button
                                  key={idx}
                                  onClick={() => setActiveImage(idx)}
                                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activeImage === idx ? 'border-blue-600 scale-105' : 'border-slate-100'}`}
                              >
                                  <img src={resolveImageUrl(img) || img} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-4 space-y-6">
                    {/* Price & Title Card */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{product.brand || 'One Step Exclusive'}</span>
                            <div className="flex items-center bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">
                                <Star className="h-3 w-3 mr-1 fill-blue-500" />
                                {product.rating || 4.5}
                            </div>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{product.name}</h2>
                        <div className="flex items-baseline space-x-3">
                            <span className="text-3xl font-black text-gray-900">₹{product.discountPrice || product.price}</span>
                            {product.discountPrice && (
                                <span className="text-sm text-gray-400 line-through font-bold">₹{product.price}</span>
                            )}
                            {discount > 0 && <span className="text-red-500 text-xs font-black">{discount}% OFF</span>}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                           <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                           <span>Available in stock</span>
                        </div>
                    </div>

                    {/* Highlights Section */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Product Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { icon: Info, label: 'Material', value: 'Premium Fabric' },
                                { icon: Package, label: 'Sleeve', value: 'Full Sleeve' },
                                { icon: Truck, label: 'Delivery', value: '3-5 Business Days' },
                                { icon: RotateCcw, label: 'Return', value: '7-Day Easy Return' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                                    <item.icon className="h-4 w-4 text-gray-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-[10px] font-bold text-gray-800">{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selection Section */}
                    {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
                            {product.sizes?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Sizes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setSelectedSize(s)}
                                                className={`w-12 h-12 rounded-xl border-2 font-black text-xs transition-all ${selectedSize === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.colors?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Colors</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setSelectedColor(c)}
                                                className={`px-4 py-2.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-wider transition-all ${selectedColor === c ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-100 text-gray-400'}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description Section */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Full Description</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            {product.description || 'No detailed description available for this premium piece.'}
                        </p>
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Customer Reviews</h3>
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => navigate(`/orders`)} // Directing to orders as reviews usually require verified purchase
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                >
                                    Write a Review
                                </button>
                                <div className="flex items-center space-x-2 border-l border-gray-100 pl-4">
                                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                                    <span className="text-sm font-black text-gray-900">{reviewStats.rating}</span>
                                    <span className="text-[10px] font-bold text-gray-400 capitalize">({reviewStats.count})</span>
                                </div>
                            </div>
                        </div>

                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="space-y-3 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-gray-400">
                                                    {review.User?.displayName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-900">{review.User?.displayName || 'Anonymous User'}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("h-2.5 w-2.5", i < review.rating ? "text-amber-400 fill-current" : "text-gray-100")} />
                                                ))}
                                            </div>
                                        </div>
                                        {review.title && <h4 className="text-xs font-black text-gray-900">{review.title}</h4>}
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{review.comment}</p>
                                        {review.isVerified && (
                                            <div className="flex items-center space-x-1 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                                <span>Verified Purchase</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No reviews yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Section */}
                {relatedProducts.length > 0 && (
                    <div className="p-4 pt-10 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-base font-black text-gray-900 uppercase tracking-wider">Related Items</h2>
                            <Link to="/search" className="text-amber-600 text-[10px] font-black uppercase tracking-widest">View All</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Footer Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:static sm:bg-transparent sm:border-none sm:shadow-none">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <button
                        onClick={() => addToCart(product, 1, selectedSize, selectedColor)}
                        className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 border border-slate-900 hover:bg-black transition-all shadow-xl shadow-slate-200"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        onClick={() => {
                            addToCart(product, 1, selectedSize, selectedColor);
                            navigate('/checkout');
                        }}
                        className="flex-1 bg-amber-400 text-amber-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-amber-200 hover:bg-amber-500 transition-all"
                    >
                        <Zap className="h-4 w-4 fill-amber-900" />
                        <span>Buy Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
