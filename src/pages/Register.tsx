import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, Building2, CalendarDays } from 'lucide-react';
import { supabase, isSupabaseConfigured, saveLocalProfile } from '../lib/supabase';
import { WorkspaceType } from '../types';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<WorkspaceType>('event');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      await saveLocalProfile({
        id: `local-${Date.now()}`,
        email,
        full_name: fullName,
        account_type: accountType,
        created_at: new Date().toISOString(),
      });
      navigate('/', { replace: true });
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: accountType,
          },
        },
      });
      if (error) throw error;
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
          Create Your Sustainability Account
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Track emissions, discover savings, and run verified climate simulations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.org"
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Primary Workspace Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('event')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    accountType === 'event'
                      ? 'border-[#166534] bg-emerald-50 text-[#166534]'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 mx-auto mb-1" />
                  <span>Event</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('institution')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    accountType === 'institution'
                      ? 'border-[#166534] bg-emerald-50 text-[#166534]'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1" />
                  <span>Institution</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    accountType === 'individual'
                      ? 'border-[#166534] bg-emerald-50 text-[#166534]'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <User className="w-4 h-4 mx-auto mb-1" />
                  <span>Personal</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs transition-colors"
            >
              {loading ? 'Creating Account...' : 'Get Started'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#166534] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
