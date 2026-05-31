import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, ArrowLeft, Zap, User, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginForm({ branchName, accentColor }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, branch: branchName })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid username or password');
      }

      await setSession(data.data.session, data.data.user, data.data.profile);

      const name = data.data.profile?.full_name || username;
      toast.success(`Welcome back, ${name}!`, {
        description: `Signed in to ${branchName} branch.`,
        duration: 4000,
      });

      navigate(`/${branchName.toLowerCase()}/dashboard`);

    } catch (err) {
      setError(err.message);
      toast.error('Login failed', {
        description: err.message || 'Invalid username or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="group flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        <span>Back to branches</span>
      </button>

      {/* Login Card */}
      <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 sm:p-10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
        {/* Subtle top gradient line */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              boxShadow: `0 8px 24px -6px ${accentColor}66`,
            }}
          >
            <Zap size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{branchName} Branch</h2>
          <p className="text-sm text-muted-foreground mt-1.5">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 text-sm rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-medium">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
            <div className="relative group">
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors"
              />
              <input
                type="text"
                required
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/60 border border-border/80 text-foreground text-sm placeholder:text-muted-foreground/60 outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 focus:bg-muted"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
            <div className="relative group">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-muted/60 border border-border/80 text-foreground text-sm placeholder:text-muted-foreground/60 outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 focus:bg-muted"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3 mt-2 rounded-xl font-semibold text-white text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={loading ? {} : {
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              boxShadow: `0 8px 24px -6px ${accentColor}66`,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
