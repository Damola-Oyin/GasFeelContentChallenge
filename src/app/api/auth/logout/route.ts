import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    // The client will remove the token from localStorage
    
    return NextResponse.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
