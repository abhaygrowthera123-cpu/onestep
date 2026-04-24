import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { MapPin, Navigation, Plus, Trash2, Check, X, Map as MapIcon, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '1.5rem'
};

const center = { lat: 20.5937, lng: 78.9629 }; // Center of India

export const AddressManager = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: 'Home',
        fullName: '',
        addressLine1: '',
        city: '',
        state: '',
        zipCode: '',
        phoneNumber: '',
        latitude: null,
        longitude: null,
        isDefault: false
    });

    const [map, setMap] = useState(null);
    const [searchBox, setSearchBox] = useState(null);
    const [markerPos, setMarkerPos] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || ""
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const data = await api.getAddresses();
            setAddresses(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");
        
        setSubmitting(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setMarkerPos({ lat: latitude, lng: longitude });
                setFormData(prev => ({ ...prev, latitude, longitude }));
                
                // Attempt reverse geocoding if API key exists
                if (window.google) {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === "OK" && results[0]) {
                            const addr = results[0];
                            const city = addr.address_components.find(c => c.types.includes('locality'))?.long_name || '';
                            const state = addr.address_components.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
                            const zip = addr.address_components.find(c => c.types.includes('postal_code'))?.long_name || '';
                            
                            setFormData(prev => ({
                                ...prev,
                                addressLine1: addr.formatted_address,
                                city,
                                state,
                                zipCode: zip
                            }));
                        }
                    });
                }
                setSubmitting(false);
            },
            () => { alert("Location access denied"); setSubmitting(false); }
        );
    };

    const onLoad = ref => setSearchBox(ref);
    
    const onPlacesChanged = () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;
        const place = places[0];
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setMarkerPos({ lat, lng });
        setFormData(prev => ({ 
            ...prev, 
            latitude: lat, 
            longitude: lng,
            addressLine1: place.formatted_address,
            city: place.address_components.find(c => c.types.includes('locality'))?.long_name || '',
            state: place.address_components.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '',
            zipCode: place.address_components.find(c => c.types.includes('postal_code'))?.long_name || ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.addAddress(formData);
            setShowAddForm(false);
            fetchAddresses();
            setFormData({ name: 'Home', fullName: '', addressLine1: '', city: '', state: '', zipCode: '', phoneNumber: '', latitude: null, longitude: null, isDefault: false });
        } catch (err) { 
            const msg = err?.response?.data?.details?.join(', ') || err?.response?.data?.error || "Failed to save address";
            alert(msg); 
        }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        await api.deleteAddress(id);
        fetchAddresses();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Saved Addresses</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage your shipping locations</p>
                    </div>
                </div>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 hover:scale-110 transition-all"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                            <MapIcon className="h-8 w-8" />
                        </div>
                        <p className="font-bold text-slate-400">No addresses saved yet</p>
                    </div>
                ) : (
                    addresses.map(addr => (
                        <motion.div 
                          layout
                          key={addr.id}
                          className={cn(
                            "bg-white p-5 rounded-[2rem] border-2 transition-all relative group",
                            addr.isDefault ? "border-blue-100 shadow-blue-50" : "border-slate-50 hover:border-slate-200"
                          )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                            {addr.name}
                                        </span>
                                        {addr.isDefault && (
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                                <Check className="h-3 w-3 mr-1 text-green-500" /> Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 mt-2">{addr.addressLine1}</p>
                                    <p className="text-xs font-medium text-slate-500">
                                        {addr.city}, {addr.state} - {addr.zipCode}
                                    </p>
                                </div>
                                <button 
                                  onClick={() => handleDelete(addr.id)}
                                  className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Address Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => !submitting && setShowAddForm(false)}
                          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
                        />
                        <motion.div 
                          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                          className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900">Add New Address</h3>
                                <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Map Preview / Geolocation */}
                                    {/* Map / Search Overlay - only if key exists */}
                                    {isLoaded && window.google && import.meta.env.VITE_GOOGLE_MAPS_KEY ? (
                                        <div className="space-y-4">
                                            <button 
                                              type="button" 
                                              onClick={handleUseCurrentLocation}
                                              disabled={submitting}
                                              className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                                            >
                                                <Navigation className={cn("h-5 w-5", submitting && "animate-pulse")} />
                                                <span>Use My Current Location</span>
                                            </button>
                                            <div className="relative">
                                                <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
                                                    <input 
                                                      type="text" 
                                                      placeholder="Search for an area, building..." 
                                                      className="absolute top-4 left-4 right-4 z-10 bg-white border border-slate-200 rounded-xl py-3 px-4 shadow-lg focus:outline-none font-medium text-sm"
                                                    />
                                                </StandaloneSearchBox>
                                                <GoogleMap
                                                    mapContainerStyle={mapContainerStyle}
                                                    center={markerPos || center}
                                                    zoom={13}
                                                    onLoad={m => setMap(m)}
                                                    onClick={e => {
                                                        const lat = e.latLng.lat();
                                                        const lng = e.latLng.lng();
                                                        setMarkerPos({ lat, lng });
                                                        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                                                    }}
                                                >
                                                    {markerPos && <Marker position={markerPos} />}
                                                </GoogleMap>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center space-y-3">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                                <MapIcon className="h-6 w-6 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Manual Address Entry</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">Please fill in your delivery details below</p>
                                            </div>
                                        </div>
                                    )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Home', 'Office', 'Other'].map(type => (
                                            <button 
                                              key={type} type="button" 
                                              onClick={() => setFormData({...formData, name: type})}
                                              className={cn(
                                                "py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                                formData.name === type ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 border border-slate-100"
                                              )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <input 
                                            placeholder="Recipient Full Name" 
                                            value={formData.fullName}
                                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                                            required
                                        />
                                        <input 
                                            placeholder="Address Line 1" 
                                            value={formData.addressLine1}
                                            onChange={e => setFormData({...formData, addressLine1: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                placeholder="City" value={formData.city}
                                                onChange={e => setFormData({...formData, city: e.target.value})}
                                                className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                                                required
                                            />
                                            <input 
                                                placeholder="State" value={formData.state}
                                                onChange={e => setFormData({...formData, state: e.target.value})}
                                                className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                                                required
                                            />
                                        </div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                placeholder="Zip Code" value={formData.zipCode}
                                                onChange={e => setFormData({...formData, zipCode: e.target.value})}
                                                className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                                                required
                                            />
                                            <input 
                                                placeholder="Phone Number" value={formData.phoneNumber}
                                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                                className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                                                required
                                            />
                                        </div>
                                        <label className="flex items-center justify-center space-x-3 bg-slate-50 rounded-2xl py-4 cursor-pointer group border border-slate-100">
                                            <input 
                                              type="checkbox" checked={formData.isDefault}
                                              onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Default Address</span>
                                        </label>
                                    </div>

                                    <button 
                                      type="submit" 
                                      disabled={submitting}
                                      className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Saving Address...' : 'Securely Save Address'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
