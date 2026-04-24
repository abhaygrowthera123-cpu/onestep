import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithPopup, GoogleAuthProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  RecaptchaVerifier, signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Shield, Eye, EyeOff, ArrowRight, Phone, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { apiClient } from '../services/api';
import { cn } from '../lib/utils';

export const Login = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'otp' | 'reset'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Client form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // OTP fields
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify'
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Admin login fields (hidden by default)
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showAdminForm, setShowAdminForm] = useState(false);
    const navigate = useNavigate();
    const { user, loading: authLoading, adminLogin, devLogin, resetPassword } = useAuth();
    const [successMsg, setSuccessMsg] = useState('');

    const resetForm = () => {
        setName(''); setEmail(''); setPassword('');
        setConfirmPassword(''); setPhone(''); setOtpCode('');
        setOtpStep('request'); setError('');
    };

    const handleDevLogin = () => {
        setLoading(true);
        setTimeout(() => {
            devLogin();
            setLoading(false);
            navigate('/');
        }, 500);
    };

    const handleGoogleLogin = async () => {
        setLoading(true); setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (err) {
            console.error('Google sign-in error:', err.code, err.message);
            const msgs = {
                'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
                'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups.',
                'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
                'auth/operation-not-allowed': 'Google sign-in is disabled in Firebase.',
                'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
            };
            setError(msgs[err.code] || `Google sign-in failed (${err.code || 'unknown'}).`);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError('Please enter your email and password.'); return; }
        setLoading(true); setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err.code, err.message);
            const msgs = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-credential': 'Incorrect email or password.',
                'auth/too-many-requests': 'Too many failed attempts. Try again later.',
                'auth/network-request-failed': 'Network error.',
            };
            setError(msgs[err.code] || `Login failed (${err.code || 'unknown'}).`);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setError('Please enter your full name.'); return; }
        if (!email) { setError('Please enter your email address.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await firebaseUpdateProfile(cred.user, { displayName: name.trim() });
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err.code, err.message);
            const msgs = {
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/weak-password': 'Password is too weak.',
                'auth/network-request-failed': 'Network error.',
            };
            setError(msgs[err.code] || `Registration failed (${err.code || 'unknown'}).`);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) { setError('Please enter your email address.'); return; }
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            await resetPassword(email);
            setSuccessMsg('Password reset email sent! Please check your inbox.');
        } catch (err) {
            console.error('Reset error:', err.code, err.message);
            setError('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        if (!adminEmail || !adminPassword) { setError('Please enter admin credentials.'); return; }
        setLoading(true); setError('');
        try {
            const response = await apiClient.post('/auth/admin-login', { email: adminEmail, password: adminPassword });
            adminLogin(response.data.token, response.data.user);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Admin login failed.');
        } finally {
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => { /* reCAPTCHA solved */ }
            });
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) { setError('Please enter a valid phone number.'); return; }
        setLoading(true); setError('');
        try {
            setupRecaptcha();
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            setConfirmationResult(result);
            setOtpStep('verify');
        } catch (err) {
            console.error(err);
            setError('Failed to send OTP. Please try again.');
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        if (e) e.preventDefault();
        if (otpCode.length !== 6) return;
        setLoading(true); setError('');
        try {
            await confirmationResult.confirm(otpCode);
            navigate('/');
        } catch (err) {
            setError('Invalid OTP. Please try again.');
            setOtpCode('');
        } finally {
            setLoading(false);
        }
    };

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    // Auto-submit OTP when 6 digits are entered
    useEffect(() => {
        if (otpCode.length === 6 && !loading) {
            handleVerifyOTP();
        }
    }, [otpCode, loading]);

    // Web OTP API Support
    useEffect(() => {
        if ('OTPCredential' in window && otpStep === 'verify') {
            const ac = new AbortController();
            navigator.credentials.get({
                otp: { transport: ['sms'] },
                signal: ac.signal
            }).then(otp => {
                if (otp) {
                    setOtpCode(otp.code);
                    ac.abort();
                }
            }).catch(err => {
                console.log('Web OTP Error:', err);
            });
            return () => ac.abort();
        }
    }, [otpStep]);

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 bg-slate-50/50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[400px] w-full"
            >
                {/* Brand Logo */}
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center space-x-2 group">
                        <img src="/images/logo.png" alt="Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-lg font-black tracking-tight text-slate-900">
                            Onestep<span className="text-blue-600">-Hub</span>
                        </span>
                    </Link>
                </div>

                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    {/* Compact Tabs */}
                    <div className="flex bg-slate-50 p-1 rounded-2xl mb-6">
                        {['login', 'otp', 'register'].map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); resetForm(); }}
                                className={cn(
                                    "flex-1 py-2 text-[11px] font-black uppercase tracking-wider transition-all rounded-xl",
                                    mode === m ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 text-red-600 p-3 rounded-xl text-[12px] mb-4 font-bold border border-red-100/50">
                                {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-[12px] mb-4 font-bold border border-emerald-100/50">
                                {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Social Login */}
                    {mode !== 'reset' && (
                        <>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-200 transition-all disabled:opacity-50"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                                <span>Continue with Google</span>
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-300">
                                    <span className="bg-white px-3">or email</span>
                                </div>
                            </div>
                        </>
                    )}

                    <AnimatePresence mode="wait">
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleEmailLogin} className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => setMode('reset')} className="text-[11px] font-black text-blue-600 hover:underline uppercase tracking-wider">Forgot Password?</button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 transition-all">
                                    {loading ? 'Verifying...' : 'Sign In'}
                                </button>
                            </motion.form>
                        )}

                        {mode === 'register' && (
                            <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                onSubmit={handleRegister} className="space-y-3">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-11 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </motion.form>
                        )}

                        {mode === 'otp' && (
                            <motion.div key="otp" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {otpStep === 'request' ? (
                                    <form onSubmit={handleSendOTP} className="space-y-3">
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <input type="tel" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-100">
                                            Send Code
                                        </button>
                                        <div id="recaptcha-container"></div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOTP} className="space-y-3">
                                        <div className="relative">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <input type="text" maxLength={6} placeholder="6-Digit OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-center text-lg font-bold tracking-[0.5em] focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-100">
                                            Verify Code
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        )}

                        {mode === 'reset' && (
                            <motion.form key="reset" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                onSubmit={handleResetPassword} className="space-y-4">
                                <p className="text-[11px] text-slate-500 text-center font-bold px-2">Enter your email to receive a password reset link.</p>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-100">
                                    Send Link
                                </button>
                                <button type="button" onClick={() => setMode('login')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Back to Login</button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Development Notice - Clean & Compact */}
                    {(import.meta.env.DEV || process.env.NODE_ENV !== 'production') && (
                        <div className="mt-6 p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl text-center">
                            <button onClick={handleDevLogin} disabled={loading} className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700">
                                <Shield className="h-3 w-3 inline mr-1 mb-0.5" /> Skip to Test Account
                            </button>
                        </div>
                    )}

                    {/* Admin Entry - Subtle Link */}
                    <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center space-y-4">
                        <button onClick={() => setShowAdminForm(!showAdminForm)} className="text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-[0.2em] transition-colors">
                            Admin Access
                        </button>
                        
                        <AnimatePresence>
                            {showAdminForm && (
                                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    onSubmit={handleAdminLogin} className="w-full space-y-2 overflow-hidden">
                                    <input type="email" placeholder="Admin Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-[12px] font-medium focus:outline-none" />
                                    <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-[12px] font-medium focus:outline-none" />
                                    <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-slate-800">
                                        Unlock Panel
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <p className="mt-8 text-center text-[11px] text-slate-400 font-bold leading-relaxed px-4">
                    Secure authentication for your premium shopping experience. 
                    By continuing, you agree to our <Link to="/terms" className="text-slate-600 underline">Terms</Link>.
                </p>
            </motion.div>
        </div>
    );
};
