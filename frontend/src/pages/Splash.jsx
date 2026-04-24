import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Splash = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 1000); // Wait for exit animation
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center overflow-hidden"
                >
                    {/* Animated background patterns */}
                    <motion.div 
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center"
                    />
                    
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8"
                        >
                            <img src="/images/logo.png" alt="Onestep-Hub" className="w-16 h-16 object-contain" />
                        </motion.div>

                        <div className="overflow-hidden">
                            <motion.h1 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                                className="text-3xl md:text-5xl font-black text-white tracking-tighter text-center uppercase"
                            >
                                One Step <span className="text-blue-500">Fashion</span> Mart
                            </motion.h1>
                        </div>
                        
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                            className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-4 w-64 opacity-50"
                        />
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-6"
                        >
                            Excellence in every step
                        </motion.p>
                    </div>

                    {/* Bottom loading indicator */}
                    <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                        <div className="flex space-x-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{ 
                                        duration: 1, 
                                        repeat: Infinity, 
                                        delay: i * 0.2 
                                    }}
                                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
