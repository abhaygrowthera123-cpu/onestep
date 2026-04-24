import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { resolveImageUrl } from '../../lib/imageUrl';
import { Plus, Search, Filter, Edit2, Trash2, Image as ImageIcon, X, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
export const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockFilter, setStockFilter] = useState('all'); // all, low, out
    const [sortBy, setSortBy] = useState('newest'); // newest, price-high, price-low, stock-low
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            
            const matchesStock = 
                stockFilter === 'all' ? true :
                stockFilter === 'low' ? product.stock > 0 && product.stock <= 10 :
                stockFilter === 'out' ? product.stock === 0 : true;

            return matchesSearch && matchesCategory && matchesStock;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'price-high') return (b.discountPrice || b.price) - (a.discountPrice || a.price);
            if (sortBy === 'price-low') return (a.discountPrice || a.price) - (b.discountPrice || b.price);
            if (sortBy === 'stock-low') return a.stock - b.stock;
            return 0;
        });

    const fetchData = async () => {
        setLoading(true);
        try {
            const productsData = await api.getProducts({ limit: 100 });
            setProducts(productsData.data || []);
            const categoriesData = await api.getCategories();
            setCategories(categoriesData);
        }
        catch (error) {
            console.error('Error fetching products:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: Number(formData.price) || 0,
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
                stock: Number(formData.stock) || 0,
                createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
                rating: editingProduct ? editingProduct.rating : 4.5,
                reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
            };
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, data);
            }
            else {
                await api.createProduct(data);
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                name: '', description: '', price: '', discountPrice: '', category: '', images: [], stock: '',
                sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Blue'], isTrending: false, isRecommended: false
            });
            fetchData();
        }
        catch (error) {
            console.error('Error saving product:', error);
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.deleteProduct(id);
                fetchData();
            }
            catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };
    const seedData = async () => {
        const dummyCategories = [
            { name: 'Apparel', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&q=80&w=2071', description: 'Clothing & Apparel for men, women, and kids.' },
            { name: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2070', description: 'Casual, formal, and sports footwear.' },
            { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1999', description: 'Watches, sunglasses, and jewellery.' },
            { name: 'Bags & Luggage', image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=2070', description: 'Premium bags and travel luggage.' },
            { name: 'Lifestyle', image: 'https://images.unsplash.com/photo-1511499767390-903390e6fbc4?auto=format&fit=crop&q=80&w=2080', description: 'Lifestyle and utility products.' }
        ];
        const dummyProducts = [
            {
                name: 'Premium Cotton Polo T-Shirt',
                description: 'High-quality cotton polo t-shirt for men. Comfortable and stylish for casual wear.',
                price: 1299,
                discountPrice: 899,
                category: 'Men',
                images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=2071'],
                stock: 50,
                rating: 4.8,
                reviewsCount: 124,
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Navy', 'White', 'Black'],
                isTrending: true,
                isRecommended: true,
                createdAt: new Date().toISOString()
            },
            {
                name: 'Floral Summer Maxi Dress',
                description: 'Beautiful floral print maxi dress for women. Perfect for summer outings and beach days.',
                price: 2499,
                discountPrice: 1899,
                category: 'Women',
                images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=1946'],
                stock: 30,
                rating: 4.6,
                reviewsCount: 85,
                sizes: ['XS', 'S', 'M', 'L'],
                colors: ['Blue', 'Pink'],
                isTrending: true,
                isRecommended: false,
                createdAt: new Date().toISOString()
            },
            {
                name: 'Classic Denim Jacket',
                description: 'Timeless denim jacket with a modern fit. Durable and versatile for any season.',
                price: 3499,
                discountPrice: 2999,
                category: 'Men',
                images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=1974'],
                stock: 20,
                rating: 4.9,
                reviewsCount: 210,
                sizes: ['M', 'L', 'XL'],
                colors: ['Denim Blue'],
                isTrending: false,
                isRecommended: true,
                createdAt: new Date().toISOString()
            },
            {
                name: 'Kids Graphic Print Set',
                description: 'Comfortable cotton t-shirt and shorts set for kids. Fun graphic prints that children love.',
                price: 999,
                discountPrice: 699,
                category: 'Kids',
                images: ['https://images.unsplash.com/photo-1519233073526-69057b3026bb?auto=format&fit=crop&q=80&w=2070'],
                stock: 100,
                rating: 4.7,
                reviewsCount: 56,
                sizes: ['2Y', '4Y', '6Y', '8Y'],
                colors: ['Multi'],
                isTrending: true,
                isRecommended: true,
                createdAt: new Date().toISOString()
            }
        ];
        try {
            setLoading(true);
            for (const cat of dummyCategories) {
                await api.createCategory(cat);
            }
            for (const prod of dummyProducts) {
                await api.createProduct(prod);
            }
            alert('Seed data added successfully!');
            fetchData();
        }
        catch (error) {
            console.error('Error seeding data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Management</h1>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-brand-500"/>
            Catalog control and inventory oversight.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={seedData} className="bg-white text-slate-900 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm border border-slate-100">
            <Database className="h-3.5 w-3.5 text-brand-500"/>
            <span>Seed Assets</span>
          </button>
          <button onClick={() => {
            setEditingProduct(null);
            setFormData({
                name: '', description: '', price: '', discountPrice: '', category: '', images: [], stock: '',
                sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Blue'], isTrending: false, isRecommended: false
            });
            setShowModal(true);
        }} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-brand-600 transition-all shadow-xl shadow-slate-200">
            <Plus className="h-4 w-4"/>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative group">
            <input 
              type="text" 
              placeholder="Search catalog..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-brand-500 transition-colors"/>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center justify-center space-x-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
              showFilters ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            )}
          >
            <Filter className="h-4 w-4"/>
            <span>{showFilters ? 'Hide' : 'Filters'}</span>
          </button>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Stock Status</label>
                  <select 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="low">Low Stock (≤ 10)</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sort By</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="stock-low">Inventory: Low to High</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setStockFilter('all');
                      setSortBy('newest');
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Display */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Price / Stats</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Inventory</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-24 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">Synchronizing Catalog...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-24 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">No matching assets identified.</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-all group cursor-pointer">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 group-hover:scale-105 transition-transform">
                        <img 
                          src={resolveImageUrl(product.images[0])} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm group-hover:text-brand-600 transition-colors">{product.name}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mt-0.5">Ref: {product.id?.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="bg-slate-50 text-slate-900 border border-slate-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-base tracking-tight">₹{product.discountPrice || product.price}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-black text-amber-500 uppercase">★ {product.rating || 0}</span>
                        <span className="text-[9px] font-bold text-slate-300">({product.reviewsCount || 0})</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.1em]", product.stock < 10 ? "text-rose-500" : "text-slate-500")}>
                          {product.stock} Units
                        </span>
                        {product.stock === 0 ? (
                          <span className="text-[7px] font-black text-rose-500 px-1 py-0.5 bg-rose-50 rounded">OUT</span>
                        ) : product.stock < 10 && (
                          <span className="text-[7px] font-black text-rose-500 animate-pulse">LOW</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tight">
                        {new Date(product.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[8px] text-slate-300 font-bold">{new Date(product.createdAt).getFullYear()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setFormData(product); setShowModal(true); }} className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-brand-600 hover:border-brand-200 rounded-xl transition-all shadow-sm">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-100 rounded-xl transition-all shadow-sm">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden p-6 space-y-6">
          {loading ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-6 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-100/20">
                  <div className="flex items-start justify-between">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden shadow-sm border border-white">
                      <img 
                        src={resolveImageUrl(product.images[0])} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true); }} className="p-3 bg-white text-gray-400 hover:text-blue-600 rounded-2xl shadow-sm transition-all">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl shadow-sm transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {product.category}
                    </span>
                    <h3 className="font-black text-gray-900 text-lg line-clamp-1">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</p>
                      <p className="font-black text-xl text-gray-900">₹{product.discountPrice || product.price}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory</p>
                      <p className={cn("font-black text-sm uppercase", product.stock < 10 ? "text-red-500" : "text-gray-900")}>
                        {product.stock} units
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Name</label>
                      <input required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                      <textarea required rows={4} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Base Price (₹)</label>
                        <input required type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Discount Price (₹)</label>
                        <input type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
                      </div>
                    </div>
                  </div>
 
                  {/* Inventory & Media */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                      <select required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Stock Quantity</label>
                      <input required type="number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Images</label>
                      <div className="grid grid-cols-4 gap-4">
                        {formData.images?.map((img, idx) => (
                          <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden group border border-gray-100">
                            <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                          <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600 mb-2" />
                          <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-blue-600">Upload</span>
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
                                  alert('Failed to upload images');
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-6 pt-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" className="w-6 h-6 rounded-lg text-blue-600 border-gray-200 focus:ring-blue-500 shadow-sm transition-all" checked={formData.isTrending} onChange={e => setFormData({ ...formData, isTrending: e.target.checked })} />
                        <span className="text-sm font-bold text-gray-700">Trending</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" className="w-6 h-6 rounded-lg text-blue-600 border-gray-200 focus:ring-blue-500 shadow-sm transition-all" checked={formData.isRecommended} onChange={e => setFormData({ ...formData, isRecommended: e.target.checked })} />
                        <span className="text-sm font-bold text-gray-700">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 uppercase tracking-widest text-xs disabled:opacity-50">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>);
};
