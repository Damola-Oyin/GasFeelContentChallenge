'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: 'admin' | 'csr' | 'public';
}

interface PasswordProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'csr';
  redirectTo?: string;
}

export default function PasswordProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo 
}: PasswordProtectedRouteProps) {
  // Set default redirect based on role
  const defaultRedirect = requiredRole === 'admin' ? '/admin/login' : '/csr/login';
  const finalRedirectTo = redirectTo || defaultRedirect;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has auth token in localStorage
        const token = localStorage.getItem('auth_token');
        const role = localStorage.getItem('user_role');
        const email = localStorage.getItem('user_email');

        if (!token || !role || !email) {
          throw new Error('Not authenticated');
        }

        // Verify token is still valid (basic check)
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (tokenData.exp < currentTime) {
            throw new Error('Token expired');
          }
        } catch (tokenError) {
          throw new Error('Invalid token');
        }

        const userData = {
          email,
          role: role as 'admin' | 'csr' | 'public'
        };

        // Check role permissions
        if (requiredRole) {
          if (requiredRole === 'admin' && userData.role !== 'admin') {
            throw new Error('Admin access required');
          }
          if (requiredRole === 'csr' && !['admin', 'csr'].includes(userData.role)) {
            throw new Error('CSR or Admin access required');
          }
        }

        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Clear invalid tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        setTimeout(() => {
          router.push(finalRedirectTo);
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, finalRedirectTo, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cobalt mx-auto mb-4"></div>
            <p className="text-charcoal">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-tangerine/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-tangerine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              {requiredRole === 'admin' ? 'Admin Access Required' : 'Access Restricted'}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push(finalRedirectTo)}
              className="pill-button-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
