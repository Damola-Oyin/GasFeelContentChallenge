'use client'

import { useState, useEffect } from 'react';
import PasswordProtectedRoute from '@/components/auth/PasswordProtectedRoute';

interface Credential {
  email: string;
  password: string;
  role: 'admin' | 'csr';
}

export default function ManageCredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [newCredential, setNewCredential] = useState({ email: '', password: '', role: 'admin' as 'admin' | 'csr' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCredential(prev => ({ ...prev, password }));
  };

  const addCredential = () => {
    if (!newCredential.email || !newCredential.password) {
      setError('Email and password are required');
      return;
    }

    if (!newCredential.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (newCredential.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Add to local state (in a real app, this would save to the server)
    setCredentials(prev => [...prev, newCredential]);
    setNewCredential({ email: '', password: '', role: 'admin' });
    setSuccess(`New ${newCredential.role} credential added: ${newCredential.email}`);
    setError(null);
  };

  const removeCredential = (index: number) => {
    const credential = credentials[index];
    if (window.confirm(`Are you sure you want to remove ${credential.email}?`)) {
      setCredentials(prev => prev.filter((_, i) => i !== index));
      setSuccess(`Credential removed: ${credential.email}`);
    }
  };

  const exportCredentials = () => {
    const adminCredentials = credentials.filter(c => c.role === 'admin');
    const csrCredentials = credentials.filter(c => c.role === 'csr');
    
    const code = `// Replace the credentials in /src/app/api/auth/login/route.ts
const ADMIN_CREDENTIALS = [
${adminCredentials.map(c => `  { email: '${c.email}', password: '${c.password}', role: 'admin' },`).join('\n')}
];

const CSR_CREDENTIALS = [
${csrCredentials.map(c => `  { email: '${c.email}', password: '${c.password}', role: 'csr' },`).join('\n')}
];`;
    
    navigator.clipboard.writeText(code);
    setSuccess('Code copied to clipboard! Paste it into the login route file.');
  };

  return (
    <PasswordProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-snow to-lavender/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card backdrop-blur-md bg-white/70 border border-white/90 shadow-lg p-6">
            <h1 className="text-2xl font-bold text-charcoal mb-6">Manage Login Credentials</h1>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{success}</span>
                <button onClick={() => setSuccess(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Add New Credential Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Add New Credential</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newCredential.email}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="password"
                      value={newCredential.password}
                      onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
                      placeholder="Secure password"
                    />
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                      title="Generate secure password"
                    >
                      🎲
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={newCredential.role}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, role: e.target.value as 'admin' | 'csr' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="csr">CSR</option>
                  </select>
                </div>
                <button
                  onClick={addCredential}
                  className="px-4 py-2 bg-cobalt text-white rounded-md hover:bg-cobalt/90 transition-colors"
                >
                  Add Credential
                </button>
              </div>
            </div>

            {/* Current Credentials */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-charcoal">Current Credentials</h2>
                {credentials.length > 0 && (
                  <button
                    onClick={exportCredentials}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Export Code
                  </button>
                )}
              </div>
              
              {credentials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No credentials added yet.</p>
              ) : (
                <div className="space-y-3">
                  {credentials.map((credential, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-cobalt/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-cobalt">
                            {credential.role === 'admin' ? 'A' : 'C'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-charcoal">{credential.email}</div>
                          <div className="text-sm text-gray-600">
                            Role: <span className="font-medium capitalize">{credential.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          {credential.password}
                        </span>
                        <button
                          onClick={() => removeCredential(index)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Add your admin and CSR credentials using the form above</li>
                <li>Click "Export Code" to get the code you need to copy</li>
                <li>Open <code className="bg-blue-100 px-1 rounded">/src/app/api/auth/login/route.ts</code></li>
                <li>Replace the existing <code className="bg-blue-100 px-1 rounded">ADMIN_CREDENTIALS</code> and <code className="bg-blue-100 px-1 rounded">CSR_CREDENTIALS</code> arrays with the exported code</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </PasswordProtectedRoute>
  );
}
