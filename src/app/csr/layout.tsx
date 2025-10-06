'use client'

import { usePathname } from 'next/navigation';
import PasswordProtectedRoute from '@/components/auth/PasswordProtectedRoute';

export default function CSRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't protect the login page itself
  if (pathname === '/csr/login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-snow to-lavender/30">
        {children}
      </div>
    );
  }

  // Protect all other CSR pages
  return (
    <div className="min-h-screen bg-gradient-to-br from-snow to-lavender/30">
      <PasswordProtectedRoute requiredRole="csr">
        {children}
      </PasswordProtectedRoute>
    </div>
  );
}
