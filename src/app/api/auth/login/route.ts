import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Simple password-based authentication using environment variables
// Admin credentials - passwords stored securely in .env.local
const ADMIN_CREDENTIALS = [
  { 
    email: process.env.ADMIN_EMAIL_1 || 'admin1@example.com', 
    password: process.env.ADMIN_PASSWORD_1 || 'admin123', 
    role: 'admin' 
  },
  { 
    email: process.env.ADMIN_EMAIL_2 || 'admin2@example.com', 
    password: process.env.ADMIN_PASSWORD_2 || 'admin456', 
    role: 'admin' 
  },
  { 
    email: process.env.ADMIN_EMAIL_3 || 'admin2@example.com', 
    password: process.env.ADMIN_PASSWORD_3 || 'admin456', 
    role: 'admin' 
  },
];

// CSR credentials - passwords stored securely in .env.local
const CSR_CREDENTIALS = [
  { 
    email: process.env.CSR_EMAIL_1 || 'csr1@example.com', 
    password: process.env.CSR_PASSWORD_1 || 'csr123', 
    role: 'csr' 
  },
  { 
    email: process.env.CSR_EMAIL_2 || 'csr2@example.com', 
    password: process.env.CSR_PASSWORD_2 || 'csr456', 
    role: 'csr' 
  },
];

const ALL_CREDENTIALS = [...ADMIN_CREDENTIALS, ...CSR_CREDENTIALS];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check credentials
    const user = ALL_CREDENTIALS.find(
      cred => cred.email === email.toLowerCase().trim() && cred.password === password
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        email: user.email, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // User credentials are valid - proceed with login

    return NextResponse.json({
      token,
      email: user.email,
      role: user.role,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
