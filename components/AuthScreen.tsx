
import React, { useState, useMemo } from 'react';
import { UserRole, UserSession } from '../types';
import { Sparkles, Loader2, Mail, Phone, ChevronDown, Search } from 'lucide-react';
import { mongoService } from '../services/mongoService';

interface Props {
  onLogin: (session: UserSession) => void;
}

type AuthMode = 'signin' | 'signup';
type IdentityType = 'email' | 'phone';

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
];

export const AuthScreen: React.FC<Props> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [identityType, setIdentityType] = useState<IdentityType>('phone');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
      c.dialCode.includes(countrySearch)
    );
  }, [countrySearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const finalContact = identityType === 'phone' 
      ? `${selectedCountry.dialCode}${contact.replace(/\s/g, '')}` 
      : contact.toLowerCase();

    try {
      if (authMode === 'signup') {
        const existing = await mongoService.users.findOne({ contact: finalContact });
        if (existing) {
          setError("Identity node already registered.");
          setLoading(false);
          return;
        }
        const newUser = await mongoService.users.insertOne({ contact: finalContact, fullName, role });
        onLogin({ role: newUser.role, name: newUser.fullName, contact: newUser.contact, userId: newUser._id });
      } else {
        const user = await mongoService.users.findOne({ contact: finalContact });
        if (user) {
          onLogin({ role: user.role, name: user.fullName, contact: user.contact, userId: user._id });
        } else {
          // Fallback for demo purposes if no user found
          const fallbackUser = {
            userId: role === 'admin' ? 'admin_001' : 'cust_001',
            name: role === 'admin' ? 'Apex Admin' : 'Demo Customer',
            contact: finalContact,
            role: role
          };
          onLogin(fallbackUser);
        }
      }
    } catch (err) {
      setError("Crystalline DB connection failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[140px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/20 rounded-full blur-[140px]"></div>

      <div className="z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="bg-gradient-to-tr from-cyan-400 to-sky-600 p-3 rounded-2xl shadow-2xl shadow-cyan-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white tracking-tight leading-none">Apex <span className="text-cyan-400">AI</span></h1>
            <p className="text-cyan-500/50 text-xs font-black uppercase tracking-[0.3em] mt-2">Global Ice Intelligence</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              {authMode === 'signin' ? 'Verify your regional identity node' : 'Initialize your global intelligence node'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  role === 'customer' ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  role === 'admin' ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg' : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'
                }`}
              >
                Admin
              </button>
            </div>

            <div className="bg-white/5 p-1.5 rounded-2xl flex border border-white/5">
              <button
                type="button"
                onClick={() => { setIdentityType('phone'); setContact(''); }}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  identityType === 'phone' ? 'bg-white/10 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Phone className="w-3 h-3" />
                Phone
              </button>
              <button
                type="button"
                onClick={() => { setIdentityType('email'); setContact(''); }}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  identityType === 'email' ? 'bg-white/10 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Mail className="w-3 h-3" />
                Email
              </button>
            </div>

            {authMode === 'signup' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Frost"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">
                {identityType === 'phone' ? 'Regional Contact' : 'Identity Email'}
              </label>
              
              <div className="flex gap-3">
                {identityType === 'phone' && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryList(!showCountryList)}
                      className="h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white flex items-center gap-2 hover:bg-white/10 transition-all min-w-[100px] justify-between"
                    >
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="text-xs font-bold">{selectedCountry.dialCode}</span>
                      <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform ${showCountryList ? 'rotate-180' : ''}`} />
                    </button>

                    {showCountryList && (
                      <div className="absolute top-full left-0 mt-3 w-72 bg-[#0f172a] border border-white/10 rounded-[1.5rem] shadow-2xl z-[100] overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-3">
                          <Search className="w-4 h-4 text-cyan-500" />
                          <input 
                            type="text" 
                            autoFocus
                            placeholder="Search regions..."
                            className="bg-transparent text-xs text-white outline-none w-full font-bold"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto scrollbar-hide">
                          {filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setShowCountryList(false);
                              }}
                              className="w-full flex items-center justify-between px-5 py-4 hover:bg-cyan-500/10 transition-colors text-left group border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-xl">{country.flag}</span>
                                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">{country.name}</span>
                              </div>
                              <span className="text-[10px] font-black text-cyan-500 opacity-60 group-hover:opacity-100">{country.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <input
                  type={identityType === 'phone' ? 'tel' : 'email'}
                  required
                  value={contact}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (identityType === 'phone') {
                      setContact(val.replace(/\D/g, '').slice(0, 15));
                    } else {
                      setContact(val);
                    }
                  }}
                  placeholder={identityType === 'phone' ? 'Phone number' : 'access@apex.ai'}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all h-14"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">Security Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>

            {error && <p className="text-rose-400 text-xs font-black text-center animate-pulse uppercase tracking-wider">{error}</p>}

            <button
              type="submit"
              disabled={loading || (identityType === 'phone' && contact.length < 7)}
              className="w-full bg-cyan-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-500 shadow-xl shadow-cyan-600/20 transition-all disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-8 text-center flex flex-col gap-4">
            <button
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-cyan-500 text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 transition-colors"
            >
              {authMode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
