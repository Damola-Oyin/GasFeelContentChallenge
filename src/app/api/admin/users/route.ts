import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper function to check if user is admin
async function checkAdminAuth(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Not authenticated', status: 401 };
    }

    // Check user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('email', user.email! as any)
      .single();

    if (profileError || !profile) {
      return { error: 'User profile not found', status: 403 };
    }

    if (!(profile as any).is_active) {
      return { error: 'Account is inactive', status: 403 };
    }

    if ((profile as any).role !== 'admin') {
      return { error: 'Admin access required', status: 403 };
    }

    return { user, profile };
  } catch (error) {
    return { error: 'Authentication failed', status: 500 };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const supabase = createClient();
    
    // Get all user profiles (only admins can do this)
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    if (!['admin', 'csr', 'public'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create new user profile (only admins can do this)
    const { data: newUser, error } = await supabase
      .from('user_profiles')
      .insert({
        email: email.toLowerCase().trim(),
        role: role,
        is_active: true
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Log the action (for audit trail)
    console.log(`Admin ${authResult.user?.email} created user ${email} with role ${role}`);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    if (!['admin', 'csr', 'public'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Prevent users from demoting themselves (security measure)
    const { data: targetUser } = await supabase
      .from('user_profiles')
      .select('email, role')
      .eq('id', userId)
      .single();

    if (targetUser && (targetUser as any).email === authResult.user?.email && role !== 'admin') {
      return NextResponse.json({ 
        error: 'You cannot demote yourself from admin role' 
      }, { status: 400 });
    }

    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    // Log the action (for audit trail)
    console.log(`Admin ${authResult.user?.email} updated user ${(targetUser as any)?.email} role to ${role}`);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}