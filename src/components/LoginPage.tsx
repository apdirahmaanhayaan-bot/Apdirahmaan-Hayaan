import React, { useState } from 'react';
import { AppUser } from '../types';
import { 
  Store, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldAlert, 
  ShieldCheck, 
  ShoppingCart, 
  UserCheck 
} from 'lucide-react';

interface LoginPageProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
  supermarketName: string;
  isOnline: boolean;
}

export default function LoginPage({ users, onLogin, supermarketName, isOnline }: LoginPageProps) {
  const [username, setUsername] = useState('admin1');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMsg('Fadlan geli Username ama ID-gaaga.');
      return;
    }
    if (!cleanPass) {
      setErrorMsg('Fadlan geli Password-kaaga.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const matchedUser = users.find(u => {
        const uName = u.username.toLowerCase().replace(/\s+/g, '');
        return uName === cleanUser && u.password === cleanPass;
      });

      if (matchedUser) {
        onLogin(matchedUser);
      } else {
        // Fallback for default admin
        if (cleanUser === 'admin1' && cleanPass === '123') {
          onLogin({
            id: 'user_admin_1',
            username: 'admin1',
            password: '123',
            role: 'admin',
            fullName: 'Maamulaha Sare (Manager)',
            createdAt: new Date().toISOString()
          });
        } else {
          setErrorMsg('Username ama Password-ka aad gelisay ma saxna! (Tusaale: admin1 / 123)');
        }
      }
      setLoading(false);
    }, 200);
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#042954] via-[#031e3f] to-[#021327] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-[#042954] p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#ffae01]/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-blue-500/10 rounded-full blur-lg pointer-events-none"></div>

          <div className="inline-flex p-3.5 rounded-2xl bg-[#ffae01] text-slate-950 shadow-lg mb-3">
            <Store className="w-9 h-9 sm:w-10 sm:h-10" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-display">
            {supermarketName || 'Xaaji Salaad Supermarket'}
          </h1>
          <p className="text-slate-300 text-xs mt-1 font-medium">
            Nidaamka POS, Bakhaarka & Xisaabaadka Supermarket-ka
          </p>

          {/* Cloud Online Indicator */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isOnline ? 'Firebase Live Sync' : 'Offline Mode'}</span>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-5 text-center">
            <h2 className="text-base font-bold text-slate-800 font-display">Gal Akoonkaaga (Sign In)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Geli Username-ka iyo Password-kaaga</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Geli username"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#042954] focus:ring-2 focus:ring-[#042954]/10 transition-all outline-none min-h-[44px]"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Geli password"
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#042954] focus:ring-2 focus:ring-[#042954]/10 transition-all outline-none min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#042954] hover:bg-[#031d3d] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 min-h-[44px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#ffae01]" />
                  <span>Gal Nidaamka Supermarket-ka</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Tusaale ahaan (Quick Demo Logins):
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => fillQuickLogin('admin1', '123')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-[11px] font-bold cursor-pointer"
              >
                Maamule
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('cashier1', '123')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-[11px] font-bold cursor-pointer"
              >
                Qasnaji (POS)
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('customer1', '123')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-[11px] font-bold cursor-pointer"
              >
                Macmiil
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 text-center text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} {supermarketName || 'Xaaji Salaad Supermarket'} &bull; All Rights Reserved
        </div>
      </div>
    </div>
  );
}
