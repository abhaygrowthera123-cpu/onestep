import React, { useState, useEffect } from 'react';
import { SEO } from '../../components/SEO';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../lib/imageUrl';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Search, Filter, MoreVertical, Edit, Trash2, X, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SellerProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        images: [],
        stock: '',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Blue'],
        isTrending: false,
        isRecommended: false
    });

    useEffect(() => {
        if (user?.uid) {
            fetchData();
        }
    }, [user?.uid]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const productsData = await api.getProducts({ sellerId: user.uid, limit: 100 });
            setProducts(productsData.data || []);
            const categoriesData = await api.getCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching seller products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'price-high') return (b.discountPrice || b.price) - (a.discountPrice || a.price);
            if (sortBy === 'price-low') return (a.discountPrice || a.price) - (b.discountPrice || b.price);
            return 0;
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: Number(formData.price) || 0,
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
                stock: Number(formData.stock) || 0,
                sellerId: user.uid,
            };
            
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, data);
            } else {
                await api.createProduct(data);
            }
            
            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                name: '', description: '', price: '', discountPrice: '', category: '', images: [], stock: '',
                sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Blue'], isTrending: false, isRecommended: false
            });
            fetchData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this product permanently?')) {
            try {
                await api.deleteProduct(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <div className="space-y-6 pb-6">
            <SEO title="Manage Products | Seller Hub" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
                    <p className="text-[11px] text-slate-500 font-medium italic">Manage your store inventory and pricing.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                            name: '', description: '', price: '', discountPrice: '', category: '', images: [], stock: '',
                            sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Blue'], isTrending: false, isRecommended: false
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-sm"
                >
                    <Plus size={16} />
                    <span>New Item</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-50 bg-slate-50/30 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="relative flex-grow max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-[13px] font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                    showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <Filter size={16} />
                                <span>{showFilters ? 'Hide' : 'Filters'}</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Category</label>
                                        <select 
                                            value={selectedCategory} 
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Sort Order</label>
                                        <select 
                                            value={sortBy} 
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button 
                                            onClick={() => { setSelectedCategory('all'); setSortBy('newest'); setSearchTerm(''); }}
                                            className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                                <th className="px-6 py-4">Product Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing catalog...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold text-sm">No products found.</td></tr>
                            ) : filteredProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={resolveImageUrl(p.images[0])} 
                                                alt={p.name} 
                                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform" 
                                            />
                                            <div>
                                                <p className="font-black text-slate-900 text-sm tracking-tight group-hover:text-brand-600 transition-colors">{p.name}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID: {p.id?.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="text-[8px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-slate-200">{p.category}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-[13px] tracking-tight">₹{p.discountPrice || p.price}</span>
                                            {p.discountPrice && <span className="text-[8px] text-slate-300 line-through">₹{p.price}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", p.stock < 10 ? "text-rose-500" : "text-slate-500")}>
                                                {p.stock} Units
                                            </span>
                                            {p.stock < 10 && <span className="text-[7px] font-black bg-rose-50 text-rose-500 px-1 py-0.5 rounded animate-pulse">LOW</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => { setEditingProduct(p); setFormData(p); setShowModal(true); }}
                                                className="p-2 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all border border-transparent hover:border-brand-100"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-brand-600 text-white rounded-xl">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingProduct ? 'Edit Catalog Item' : 'New Listing'}</h2>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Store inventory configuration</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                                            <input required placeholder="e.g. Classic Kurta" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                            <textarea required rows={4} placeholder="Material, fit, and care details..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                                <input required type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Offer (₹)</label>
                                                <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                            <select required className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-black text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none cursor-pointer text-sm uppercase tracking-widest" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="">Select Category</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
                                            <input required type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Assets</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {formData.images?.map((img, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100">
                                                        <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                                                            className="absolute top-0.5 right-0.5 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <X className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="aspect-square rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all group">
                                                    <Plus className="h-4 w-4 text-slate-300 group-hover:text-brand-500 mb-0.5" />
                                                    <span className="text-[7px] font-black uppercase text-slate-300 group-hover:text-brand-500">Upload</span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const files = Array.from(e.target.files);
                                                            if (files.length > 0) {
                                                                try {
                                                                    const uploadData = new FormData();
                                                                    files.forEach(file => uploadData.append('images', file));
                                                                    const response = await api.uploadImages(uploadData);
                                                                    setFormData({ ...formData, images: [...(formData.images || []), ...response.urls] });
                                                                } catch (error) {
                                                                    console.error('Upload failed:', error);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-[10px]">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-black hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] disabled:opacity-50">
                                        {editingProduct ? 'Update Product' : 'Publish Listing'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
