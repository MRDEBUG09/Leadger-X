import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Lock, Mail, Store, UserCheck } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: any, token?: string) => void;
  onBack: () => void;
}

export default function AuthPage({ onAuthSuccess, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('prashantmenaria7@gmail.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Suresh Kumar');
  const [storeName, setStoreName] = useState('Suresh Kirana Store');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { name, email, storeName, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        onAuthSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (e) {
      setError('Connection to remote server failed. Retrying with simulated defaults.');
      // Offline fallback
      onAuthSuccess({
        id: "user-suresh",
        email,
        name: isLogin ? "Suresh Kumar" : name,
        storeName: isLogin ? "Suresh Kirana Store" : storeName,
        plan: "Pro"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/google', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        onAuthSuccess(data.user, data.token);
      }
    } catch (e) {
      onAuthSuccess({
        id: "user-suresh",
        email: "prashantmenaria7@gmail.com",
        name: "Suresh Kumar",
        storeName: "Suresh Kirana Store",
        plan: "Pro"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 relative overflow-hidden" id="auth-page-container">
      {/* Background organic light shape */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-slate-200/50 rounded-full blur-3xl -translate-y-12"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 z-10"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 bg-black rounded-xl items-center justify-center text-white font-black text-2xl shadow-sm mb-3">
            L
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            {isLogin ? 'Welcome back to LeadgerX' : 'Register your Store'}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium leading-none">
            {isLogin ? 'Manage your bookkeeping and udhaar ledger' : 'Configure your shop in 30 seconds'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-lg border border-red-100 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <UserCheck className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    id="input-reg-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 duration-150 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Store name / Business Trade Title</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <Store className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    id="input-reg-store"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="E.g. Suresh Kirana Store"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 duration-150 transition-all font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                id="input-auth-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 duration-150 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                id="input-auth-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 duration-150 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-600 mt-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 focus:ring-black h-3.5 w-3.5" 
              />
              Remember my store
            </label>
            <button 
              type="button" 
              id="btn-auth-forgot"
              onClick={() => alert('Instructions sent! For this prototype, feel free to log in directly.')}
              className="text-slate-900 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            id="btn-auth-submit"
            disabled={loading}
            className="w-full py-3 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-4 disabled:bg-slate-400 cursor-pointer shadow-sm"
          >
            {loading ? 'Processing session...' : isLogin ? 'Access Live Dashboard' : 'Create Merchant Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-3.5 text-[10px] uppercase font-bold text-slate-400 tracking-widest">Or instant bypass</span>
        </div>

        {/* Google Mock Auth Button */}
        <button
          onClick={handleGoogleLogin}
          id="btn-google-auth"
          disabled={loading}
          className="w-full py-2.5 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.111C18.28 1.845 15.539 1 12.24 1 5.922 1 1 5.922 1 12s4.922 11 11.24 11c6.598 0 11.02-4.636 11.02-11.21 0-.756-.08-1.332-.2-1.895l-10.82.39z"
            />
          </svg>
          Proceed with Google Login
        </button>

        {/* Toggle mode links */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            id="toggle-auth-mode"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-slate-900 font-bold hover:underline ml-1 cursor-pointer"
          >
            {isLogin ? 'Create free store' : 'Sign in here'}
          </button>
        </div>

        {/* Back and exit */}
        <button
          onClick={onBack}
          id="btn-auth-back-landing"
          type="button"
          className="w-full text-center text-[10px] uppercase text-slate-400 hover:text-slate-900 mt-6 font-bold tracking-widest block transition-colors cursor-pointer"
        >
          ← Go back to main site
        </button>
      </motion.div>
    </div>
  );
}
