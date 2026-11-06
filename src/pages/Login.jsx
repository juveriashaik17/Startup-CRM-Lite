import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Target, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Login Page Component
 * 
 * Provides user authentication with loading indicators, field validation,
 * and comprehensive error messages from API responses.
 */
export default function Login() {
  const { login, token } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      console.error('[Login] Submission failed:', err);
      // Unpack error message: supports both direct message and express-validator error arrays
      let serverError = 'Invalid email or password';
      if (err.response?.data?.message) {
        serverError = err.response.data.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        serverError = err.response.data.errors.map((e) => e.message || e.msg).join(', ');
      } else if (err.message) {
        serverError = err.message;
      }
      setError(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-3">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
            Access your Startup CRM Lite workspace
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@startup.io"
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-all"
            />
          </div>

          {/* Password input field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition-all"
            />
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Navigation Link to Register */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
