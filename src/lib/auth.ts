import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface JWTPayload {
  email: string;
  role: 'admin' | 'csr' | 'public';
  iat: number;
  exp: number;
}

interface AuthResult {
  user?: {
    email: string;
    role: 'admin' | 'csr' | 'public';
  };
  error?: string;
  status?: number;
}

export function verifyAuthToken(request: NextRequest): AuthResult {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No valid authorization header', status: 401 };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as JWTPayload;

    // Check if token is expired (additional check)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return { error: 'Token expired', status: 401 };
    }

    return {
      user: {
        email: decoded.email,
        role: decoded.role
      }
    };

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: 'Invalid token', status: 401 };
    }
    return { error: 'Authentication failed', status: 500 };
  }
}

// Helper function to check if user has required role
export function checkRole(userRole: string, requiredRole: 'admin' | 'csr'): boolean {
  if (requiredRole === 'admin') {
    return userRole === 'admin';
  }
  if (requiredRole === 'csr') {
    return ['admin', 'csr'].includes(userRole);
  }
  return false;
}
