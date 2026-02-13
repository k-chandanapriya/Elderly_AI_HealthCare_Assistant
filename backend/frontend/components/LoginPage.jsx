import { useMemo, useState } from 'react';
import { Phone, ShieldCheck } from 'lucide-react';
import { authAPI } from '../services/api';

const COUNTRY_OPTIONS = [
  { flag: '🇺🇸', name: 'United States', code: '+1' },
  { flag: '🇨🇦', name: 'Canada', code: '+1' },
  { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
  { flag: '🇮🇳', name: 'India', code: '+91' },
  { flag: '🇦🇺', name: 'Australia', code: '+61' },
  { flag: '🇳🇿', name: 'New Zealand', code: '+64' },
  { flag: '🇸🇬', name: 'Singapore', code: '+65' },
  { flag: '🇲🇾', name: 'Malaysia', code: '+60' },
  { flag: '🇦🇪', name: 'UAE', code: '+971' },
  { flag: '🇸🇦', name: 'Saudi Arabia', code: '+966' },
  { flag: '🇶🇦', name: 'Qatar', code: '+974' },
  { flag: '🇿🇦', name: 'South Africa', code: '+27' },
  { flag: '🇳🇬', name: 'Nigeria', code: '+234' },
  { flag: '🇪🇬', name: 'Egypt', code: '+20' },
  { flag: '🇰🇪', name: 'Kenya', code: '+254' },
  { flag: '🇩🇪', name: 'Germany', code: '+49' },
  { flag: '🇫🇷', name: 'France', code: '+33' },
  { flag: '🇪🇸', name: 'Spain', code: '+34' },
  { flag: '🇮🇹', name: 'Italy', code: '+39' },
  { flag: '🇳🇱', name: 'Netherlands', code: '+31' },
  { flag: '🇸🇪', name: 'Sweden', code: '+46' },
  { flag: '🇳🇴', name: 'Norway', code: '+47' },
  { flag: '🇩🇰', name: 'Denmark', code: '+45' },
  { flag: '🇫🇮', name: 'Finland', code: '+358' },
  { flag: '🇨🇭', name: 'Switzerland', code: '+41' },
  { flag: '🇦🇹', name: 'Austria', code: '+43' },
  { flag: '🇵🇹', name: 'Portugal', code: '+351' },
  { flag: '🇧🇪', name: 'Belgium', code: '+32' },
  { flag: '🇵🇱', name: 'Poland', code: '+48' },
  { flag: '🇮🇪', name: 'Ireland', code: '+353' },
  { flag: '🇨🇳', name: 'China', code: '+86' },
  { flag: '🇭🇰', name: 'Hong Kong', code: '+852' },
  { flag: '🇯🇵', name: 'Japan', code: '+81' },
  { flag: '🇰🇷', name: 'South Korea', code: '+82' },
  { flag: '🇹🇭', name: 'Thailand', code: '+66' },
  { flag: '🇻🇳', name: 'Vietnam', code: '+84' },
  { flag: '🇮🇩', name: 'Indonesia', code: '+62' },
  { flag: '🇵🇭', name: 'Philippines', code: '+63' },
  { flag: '🇧🇷', name: 'Brazil', code: '+55' },
  { flag: '🇦🇷', name: 'Argentina', code: '+54' },
  { flag: '🇨🇱', name: 'Chile', code: '+56' },
  { flag: '🇨🇴', name: 'Colombia', code: '+57' },
  { flag: '🇲🇽', name: 'Mexico', code: '+52' },
  { flag: '🌐', name: 'Other (manual code)', code: 'custom' },
];

const LoginPage = ({ onLoginSuccess }) => {
  const [countryCode, setCountryCode] = useState('+1');
  const [customCountryCode, setCustomCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const normalizedPhone = useMemo(() => {
    const selectedCode = countryCode === 'custom' ? customCountryCode : countryCode;
    const cleanCode = (selectedCode || '').replace(/[^\d+]/g, '');
    const code = cleanCode.startsWith('+') ? cleanCode : `+${cleanCode}`;
    const local = (phoneNumber || '').replace(/\D/g, '');
    return `${code}${local}`;
  }, [countryCode, customCountryCode, phoneNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      setError('Enter a valid international phone number (example: +14155552671).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.requestLogin(
        { phone_number: normalizedPhone },
        window.location.origin
      );
      if (res.data.session_token) {
        onLoginSuccess({
          token: res.data.session_token,
          expiresAt: res.data.expires_at,
          identifier: res.data.phone_number || normalizedPhone,
        });
        return;
      }
      setStatus(res.data.message || 'Login request accepted.');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not login with phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-secondary/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-secondary rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-textmain">Welcome back</h1>
            <p className="text-sm text-textmain/70">Login with phone number (OTP-ready flow)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-textmain">Phone number</label>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-2 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
              aria-label="Country code"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={`${c.name}-${c.code}`} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <div className="relative">
              <Phone className="w-4 h-4 text-textmain/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="4155552671"
                className="w-full pl-10 pr-4 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="tel"
              />
            </div>
          </div>

          {countryCode === 'custom' && (
            <input
              type="text"
              value={customCountryCode}
              onChange={(e) => setCustomCountryCode(e.target.value)}
              placeholder="+999"
              className="px-3 py-3 border-2 border-secondary rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Custom country code"
            />
          )}
          <p className="text-xs text-textmain/60">Supports worldwide formats. Example: +91 9876543210</p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-surface py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-60"
          >
            {isLoading ? 'Logging in...' : 'Continue with phone'}
          </button>
        </form>

        {status && <p className="mt-4 text-sm text-primary">{status}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <p className="mt-6 text-xs text-textmain/60">
          You’ll stay logged in on this device for 30 days.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
