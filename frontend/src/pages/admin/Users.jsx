import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Shield, Mail, Calendar, MoreVertical, UserX, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.getUsers();
            setUsers(res.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (uid, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await api.updateUserRole(uid, newRole);
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };
    const filteredUsers = users.filter(u => {
        const matchesSearch = 
            (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.uid.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    return (
        <div className="space-y-6 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-brand-500" />
                        Manage user roles and security permissions.
                    </p>
                </div>
                <div className="px-4 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xs">
                        {users.length}
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Total Users</p>
                        <p className="text-[10px] font-bold text-slate-900 italic opacity-50">Active Catalog</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-grow relative group">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-brand-500 transition-colors"/>
                </div>
                <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="seller">Sellers</option>
                    <option value="user">Customers</option>
                </select>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">User Identity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-32 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-50 m-8 rounded-[2rem]">No user records found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr
                                        key={u.uid}
                                        onClick={() => navigate(`/admin/users/${u.uid}`)}
                                        className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <img src={u.photoURL || 'https://via.placeholder.com/60'} alt="" className="w-10 h-10 rounded-xl border border-slate-100 object-cover shadow-sm group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                                                        u.role === 'admin' ? "bg-purple-500" : "bg-brand-500"
                                                    )} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm tracking-tight group-hover:text-brand-600 transition-colors">{u.displayName || 'Guest User'}</p>
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">ID: {u.uid?.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center space-x-2 text-slate-600 font-bold text-xs">
                                                <Mail className="h-3.5 w-3.5 text-slate-300" />
                                                <span>{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                                u.role === 'admin' ? "bg-white text-purple-600 border-purple-100" :
                                                    u.role === 'seller' ? "bg-white text-amber-600 border-amber-100" :
                                                        "bg-white text-brand-600 border-brand-100"
                                            )}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            {u.sellerShopName ? (
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-black text-slate-700">{u.sellerShopName}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 inline-block px-1.5 py-0.5 rounded">GST: {u.sellerGstin || 'N/A'}</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest opacity-50 italic">Personal</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center space-x-2 text-slate-400 font-bold text-[10px]">
                                                <Calendar className="h-3 w-3 opacity-50" />
                                                <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="relative group/menu">
                                                <button
                                                    className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all -translate-y-2 group-hover/menu:translate-y-0 duration-300">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleRole(u.uid, u.role);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-all flex items-center space-x-3 uppercase tracking-widest"
                                                    >
                                                        <div className={cn("p-1.5 rounded-lg", u.role === 'admin' ? "bg-rose-50 text-rose-500" : "bg-purple-50 text-purple-600")}>
                                                            {u.role === 'admin' ? <UserX className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                                                        </div>
                                                        <span>{u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
