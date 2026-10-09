import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      // In demo mode, bypass directly to workspace
      navigate('/');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterDemo = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#166534] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#166534]">
            EcoTrack <span className="text-[#10B981]">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
          Welcome to EcoTrack AI
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Precision Carbon Footprint Monitoring & Reduction Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Instant Demo Pass Button */}
        <div className="mb-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-5 rounded-3xl border border-emerald-200 shadow-xs text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#166534] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Evaluation Access</span>
          </div>
          <p className="text-xs text-emerald-950 font-medium">
            Explore the complete interactive campus hackathon workspace with preloaded baseline data and zero sign-up required.
          </p>
          <button
            type="button"
            onClick={handleEnterDemo}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <span>Explore Demo Workspace Directly</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Regular Sign In Form */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">
              Or Sign In with Supabase
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#166534] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
