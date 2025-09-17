import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connection';
import { AdminUser } from '@/lib/mongodb/models/AdminUser';
import { generateTokenPair } from '@/lib/jwt/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin user
    const admin = await AdminUser.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to multiple failed login attempts' },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incrementLoginAttempts();
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Generate tokens
    const tokens = generateTokenPair({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    });

    // Save refresh token to database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    admin.refreshTokens.push({
      token: tokens.refreshToken,
      expiresAt: refreshTokenExpiry,
      createdAt: new Date()
    });

    // Clean up expired refresh tokens
    admin.refreshTokens = admin.refreshTokens.filter(
      (tokenData: any) => tokenData.expiresAt > new Date()
    );

    await admin.save();

    // Create response with admin info
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      },
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    });

    // Set HTTP-only cookies for security
    response.cookies.set('admin_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });

    response.cookies.set('admin_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}