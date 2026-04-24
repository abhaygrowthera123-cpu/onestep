import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithPopup, GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  RecaptchaVerifier, signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../firebase';
import { SEO } from '../components/SEO';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft,
  Phone, Hash, CheckCircle2, Smartphone, AtSign, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Register = () => {
    const [method, setMethod] = useState(null); // null | 'phone' | 'email'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Common
    const [name, setName] = useState('');

    // Email fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Phone OTP fields
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [otpStep, setOtpStep] = useState('info'); // 'info' | 'verify'
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);

    const otpInputRefs = useRef([]);
    const navigate = useNavigate();

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const resetForm = () => {
        setName(''); setEmail(''); setPassword('');
        setConfirmPassword(''); setPhone('');
        setOtpCode(['', '', '', '', '', '']);
        setOtpStep('info'); setError(''); setSuccess(false);
        setConfirmationResult(null);
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear(); } catch {}
            window.recaptchaVerifier = null;
        }
    };

    // ─── Google Register ────────────────────────────────
    const handleGoogleRegister = async () => {
        setLoading(true); setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            setSuccess(true);
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error('Google sign-up error:', err.code, err.message);
            const msgs = {
                'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
                'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups.',
                'auth/operation-not-allowed': 'Google sign-in is disabled in Firebase. Open Firebase Console → Authentication → Sign-in method → enable Google.',
                'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
            };
            setError(msgs[err.code] || `Google sign-up failed (${err.code || 'unknown'}). Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // ─── Email Register ─────────────────────────────────
    const handleEmailRegister = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setError('Please enter your full name.'); return; }
        if (!email) { setError('Please enter your email address.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await firebaseUpdateProfile(cred.user, { displayName: name.trim() });
            setSuccess(true);
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error('Registration error:', err.code, err.message);
            const msgs = {
                'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
                'auth/operation-not-allowed': 'Enable Email/Password in Firebase: Firebase Console → Authentication → Sign-in method → Email/Password → turn it on, then try again.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
            };
            setError(msgs[err.code] || `Registration failed (${err.code || 'unknown'}). Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // ─── Phone OTP ──────────────────────────────────────
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {}
            });
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setError('Please enter your full name.'); return; }
        if (!phone || phone.replace(/\D/g, '').length < 10) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        setLoading(true); setError('');
        try {
            setupRecaptcha();
            const cleanPhone = phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
            const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            setConfirmationResult(result);
            setOtpStep('verify');
            setResendTimer(30);
        } catch (err) {
            console.error(err);
            setError('Failed to send OTP. Check phone number or try again.');
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch {}
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length > 0) {
            const newOtp = [...otpCode];
            paste.split('').forEach((char, i) => { newOtp[i] = char; });
            setOtpCode(newOtp);
            otpInputRefs.current[Math.min(paste.length, 5)]?.focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const code = otpCode.join('');
        if (code.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
        setLoading(true); setError('');
        try {
            const result = await confirmationResult.confirm(code);
            // Update display name after phone auth
            if (name.trim() && result.user) {
                await firebaseUpdateProfile(result.user, { displayName: name.trim() });
            }
            setSuccess(true);
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setError('Invalid OTP. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        setLoading(true); setError('');
        setOtpCode(['', '', '', '', '', '']);
        try {
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch {}
                window.recaptchaVerifier = null;
            }
            setupRecaptcha();
            const cleanPhone = phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
            const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            setConfirmationResult(result);
            setResendTimer(30);
        } catch (err) {
            setError('Failed to resend OTP. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Success Screen ─────────────────────────────────
    if (success) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 bg-slate-50/50">
                <SEO title="Welcome" description="Registration successful — welcome to Onestep-Hub." />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[400px] w-full text-center p-8 bg-white rounded-[2rem] shadow-xl border border-slate-100">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Welcome!</h2>
                    <p className="text-slate-400 text-sm font-bold">Your account is ready. Redirecting you to the storefront...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 bg-slate-50/50">
            <SEO title="Create Account" description="Register on Onestep-Hub — your premium fashion marketplace." />
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
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-black text-slate-900">Create Account</h1>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Join the community</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 text-red-600 p-3 rounded-xl text-[12px] mb-4 font-bold border border-red-100/50">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {method === null && (
                            <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <button onClick={handleGoogleRegister} disabled={loading}
                                    className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                                    <span>Register with Google</span>
                                </button>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-300">
                                        <span className="bg-white px-3">or choose method</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setMethod('phone')} className="flex flex-col items-center p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all group">
                                        <Smartphone className="h-5 w-5 text-slate-400 group-hover:text-blue-600 mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Phone</span>
                                    </button>
                                    <button onClick={() => setMethod('email')} className="flex flex-col items-center p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all group">
                                        <AtSign className="h-5 w-5 text-slate-400 group-hover:text-blue-600 mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {method === 'phone' && (
                            <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <button onClick={() => setMethod(null)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center">
                                    <ArrowLeft size={12} className="mr-1" /> Back
                                </button>
                                {otpStep === 'info' ? (
                                    <form onSubmit={handleSendOTP} className="space-y-3">
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 text-sm font-medium focus:outline-none" />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <input type="tel" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 text-sm font-medium focus:outline-none" />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 transition-all">
                                            Send Code
                                        </button>
                                        <div id="recaptcha-container"></div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                                        <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                            {otpCode.map((digit, idx) => (
                                                <input key={idx} ref={el => otpInputRefs.current[idx] = el} type="text" maxLength={1} value={digit}
                                                    onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                    className="w-10 h-12 text-center text-lg font-black bg-slate-50 border border-slate-100 rounded-lg focus:border-blue-500 focus:outline-none" />
                                            ))}
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all">
                                            Verify & Create
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        )}

                        {method === 'email' && (
                            <motion.form key="email" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleEmailRegister} className="space-y-3">
                                <button type="button" onClick={() => setMethod(null)} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center mb-1">
                                    <ArrowLeft size={12} className="mr-1" /> Back
                                </button>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 text-sm font-medium focus:outline-none" />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 text-sm font-medium focus:outline-none" />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-11 text-sm font-medium focus:outline-none" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-11 text-sm font-medium focus:outline-none" />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 transition-all">
                                    Create Account
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <p className="text-[12px] text-slate-500 font-bold">
                            Already a member?{' '}
                            <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-slate-400 font-bold leading-relaxed px-6">
                    By joining, you agree to our <Link to="/terms" className="text-slate-600 underline">Terms</Link> and 
                    <Link to="/privacy" className="text-slate-600 underline ml-1">Privacy Policy</Link>.
                </p>
            </motion.div>
        </div>
    );
};
