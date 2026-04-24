import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', image: '', description: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await api.getCategories();
            setCategories(data);
        }
        catch (error) {
            console.error('Error fetching categories:', error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, formData);
            }
            else {
                await api.createCategory(formData);
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', image: '', description: '' });
            fetchCategories();
        }
        catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?'))
            return;
        try {
            await api.deleteCategory(id);
            fetchCategories();
        }
        catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-brand-500" />
                        Organize products into premium collections.
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', image: '', description: '' });
                        setShowModal(true);
                    }} 
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 flex items-center space-x-2"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Category</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[4/3] bg-white rounded-2xl animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <motion.div 
                            key={category.id} 
                            layout 
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group"
                        >
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img 
                                    src={category.image} 
                                    alt={category.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    referrerPolicy="no-referrer" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                    <h3 className="text-sm font-black text-white tracking-tight">{category.name}</h3>
                                    <div className="flex space-x-1.5">
                                        <button 
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setFormData({ name: category.name, image: category.image, description: category.description || '' });
                                                setShowModal(true);
                                            }} 
                                            className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-slate-900 transition-all"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(category.id)} 
                                            className="p-1.5 bg-rose-500/20 backdrop-blur-md rounded-lg text-rose-200 hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                                    {category.description || 'Premium collection.'}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setShowModal(false)} 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 sm:p-8 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                                            <input 
                                                required 
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm" 
                                                placeholder="e.g. Men's Couture" 
                                                value={formData.name} 
                                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image URL</label>
                                            <div className="relative">
                                                <input 
                                                    required 
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm" 
                                                    placeholder="https://images.unsplash.com/..." 
                                                    value={formData.image} 
                                                    onChange={e => setFormData({ ...formData, image: e.target.value })} 
                                                />
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                            <textarea 
                                                rows={3} 
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-sm" 
                                                placeholder="Describe this collection..." 
                                                value={formData.description} 
                                                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowModal(false)} 
                                            className="flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200"
                                        >
                                            {editingCategory ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
