
import React, { useState } from 'react';
// Added BrainCircuit to the list of imports from lucide-react
import { LogIn, ShieldCheck, Sparkles, Loader2, HeartPulse, Activity, Users, Shield, Zap, BrainCircuit, XCircle } from 'lucide-react';
import * as api from '../api';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Login with real credentials
      const response = await api.doctorLogin('dr.sujal', 'Admin123');

      // Success - pass user data to parent
      onLogin(response);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0a0f1d] text-white overflow-hidden">
      {/* Left side: Immersive Hero Section */}
      <div className="hidden md:flex md:w-3/5 relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0a0f1d] to-[#064e3b]/20 items-center justify-center p-12">
        {/* Animated Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-xl space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <HeartPulse size={36} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight">VaidyaSetu</h1>
              <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs">Precision AI Healthcare</p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight text-white/90">
              Empowering clinicians with <span className="text-emerald-500">real-time AI insights</span> and remote patient monitoring.
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Activity, title: "Live Vitals", desc: "Real-time biometric streams" },
                { icon: BrainCircuit, title: "AI Analytics", desc: "Predictive risk assessments" },
                { icon: Shield, title: "Secure Data", desc: "HIPAA-grade encryption" },
                { icon: Users, title: "Patient Care", desc: "Unified clinical workflow" }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <feature.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex items-center gap-8 opacity-50">
            <span className="text-[10px] font-black uppercase tracking-widest">Authorized by</span>
            <div className="flex gap-6 grayscale contrast-150">
              <div className="text-xs font-black">ST. JUDE MEDICAL</div>
              <div className="text-xs font-black">MAYO CLINIC</div>
              <div className="text-xs font-black">MEDTECH INT.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0f1d] relative">
        {/* Mobile Logo Visibility */}
        <div className="md:hidden absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <HeartPulse size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black">VaidyaSetu</h1>
        </div>

        <div className="w-full max-sm space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-3xl font-bold">Doctor Login</h3>
            <p className="text-gray-400 text-sm">Welcome back. Enter your secure credentials.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Professional Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    disabled
                    placeholder="doctor@vaidyasetu.ai"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-emerald-500/50 transition-all opacity-50 cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">LOCKED</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Password</label>
                <input
                  type="password"
                  disabled
                  placeholder="••••••••••••"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm outline-none focus:border-emerald-500/50 transition-all opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500">
                <XCircle size={20} className="flex-shrink-0" />
                <p className="text-[11px] font-medium leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4 text-emerald-500">
              <ShieldCheck size={20} className="flex-shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed">
                Click "Demo Login" to authenticate with Dr. Sujal's credentials.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-2xl shadow-emerald-500/20 group/btn overflow-hidden relative"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <LogIn size={24} />
                    <span>Demo Login</span>
                    <Sparkles size={18} className="absolute right-6 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                <button className="hover:text-emerald-500 transition-colors uppercase tracking-wider">Trouble Logging In?</button>
                <button className="hover:text-emerald-500 transition-colors uppercase tracking-wider">IT Helpdesk</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info for right side */}
        <div className="absolute bottom-8 w-full text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            VaidyaSetu Systems &copy; 2024 • Enterprise Version 4.2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
