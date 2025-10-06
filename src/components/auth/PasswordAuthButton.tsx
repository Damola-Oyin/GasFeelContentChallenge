'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: 'admin' | 'csr' | 'public';
}

export default function PasswordAuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    const email = localStorage.getItem('user_email');

    if (token && role && email) {
      // Basic token validation
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenData.exp > currentTime) {
          setUser({ email, role: role as 'admin' | 'csr' | 'public' });
        } else {
          // Token expired, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_email');
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
      
      // Redirect to home page
      router.push('/');
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-charcoal">
          <div className="font-medium">{user.email}</div>
          <div className="text-xs text-gray-600 capitalize">{user.role}</div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 text-charcoal rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/auth/login')}
      className="px-4 py-2 bg-cobalt text-white rounded-lg hover:bg-cobalt/90 transition-colors text-sm"
    >
      Sign In
    </button>
  );
}
