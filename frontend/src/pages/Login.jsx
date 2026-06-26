import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Zap, User, Store, Truck, Shield, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  customer: { icon: User, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-600', label: 'Customer', path: '/' },
  vendor:   { icon: Store, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-400', text: 'text-violet-600', label: 'Vendor', path: '/vendor' },
  driver:   { icon: Truck, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-600', label: 'Driver', path: '/driver' },
  admin:    { icon: Shield, color: 'from-slate-600 to-slate-800', bg: 'bg-slate-100', border: 'border-slate-500', text: 'text-slate-700', label: 'Admin', path: '/admin' },
};
export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const routeByRole = (role) => ROLE_CONFIG[role]?.path || '/';

  /* ── real login ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate(routeByRole(result.user?.role || 'customer'));
    } else {
      setError(result.message);
    }
    setLoading(false);
  };


  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* bg blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-400/10 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap size={28} className="text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Welcome Back</h1>
            <p className="text-orange-100 font-medium mt-1 text-sm">Sign in to your Zaptaste account</p>
          </div>

          <div className="p-8">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="input-field pl-11"
                    placeholder="you@example.com" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    className="input-field pl-11 pr-12"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base mt-2 disabled:opacity-60 disabled:scale-100">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>Sign In</span><ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              New here?{' '}
              <Link to="/signup" className="text-orange-500 font-bold hover:text-orange-600 hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
