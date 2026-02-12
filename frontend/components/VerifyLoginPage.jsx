import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const VerifyLoginPage = ({ onSuccess }) => {
  const [message, setMessage] = useState('Verifying your login link...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (!token) {
        setError('Missing token in link.');
        return;
      }

      try {
        const res = await authAPI.verifyMagicLink(token);
        const { session_token, expires_at, email } = res.data;
        onSuccess({ token: session_token, expiresAt: expires_at, identifier: email });
      } catch (err) {
        setError(err?.response?.data?.detail || 'This login link is invalid or expired.');
      }
    };

    verify();
  }, [onSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-secondary/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-secondary rounded-2xl shadow-xl p-8 text-center">
        {!error ? (
          <>
            <div className="mx-auto w-10 h-10 border-4 border-secondary border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-textmain/80">{message}</p>
          </>
        ) : (
          <>
            <p className="text-red-600 font-semibold">{error}</p>
            <a href="/" className="mt-4 inline-block text-sm text-textmain underline">Go back to login</a>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyLoginPage;
