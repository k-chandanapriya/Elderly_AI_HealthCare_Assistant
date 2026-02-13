import { useCallback, useEffect, useMemo, useState } from 'react';
import Landing from '../components/Landing';
import LoginPage from '../components/LoginPage';
import VerifyLoginPage from '../components/VerifyLoginPage';
import { authAPI } from '../services/api';
import './index.css';

const AUTH_TOKEN_KEY = 'auth_session_token';
const AUTH_EXPIRES_KEY = 'auth_session_expires_at';
const AUTH_USER_KEY = 'auth_session_user';

function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState(null);

  const path = useMemo(() => window.location.pathname, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRES_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('chatSessionId');
    setUserIdentifier(null);
  }, []);

  const completeLogin = useCallback(({ token, expiresAt, identifier }) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_EXPIRES_KEY, String(expiresAt));
    localStorage.setItem(AUTH_USER_KEY, identifier);
    setUserIdentifier(identifier);
    window.history.replaceState({}, '', '/');
    window.location.reload();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const exp = Number(localStorage.getItem(AUTH_EXPIRES_KEY) || '0');
      const now = Math.floor(Date.now() / 1000);

      if (!token || !exp || now >= exp) {
        clearAuth();
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await authAPI.me();
        setUserIdentifier(
          res.data.phone_number || res.data.email || localStorage.getItem(AUTH_USER_KEY)
        );
      } catch {
        clearAuth();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [clearAuth]);

  if (path === '/auth/verify') {
    return <VerifyLoginPage onSuccess={completeLogin} />;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!userIdentifier) {
    return <LoginPage onLoginSuccess={completeLogin} />;
  }

  return <Landing />;
}

export default App;
