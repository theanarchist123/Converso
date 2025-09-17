import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connection';
import { AdminUser } from '@/lib/mongodb/models/AdminUser';
import { getAdminFromRequest, extractTokenFromCookies } from '@/lib/jwt/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get admin from token
    const adminPayload = getAdminFromRequest(request);
    
    if (adminPayload) {
      // Find admin and remove refresh token
      const refreshToken = extractTokenFromCookies(request, 'admin_refresh_token');
      
      if (refreshToken) {
        const admin = await AdminUser.findById(adminPayload.adminId);
        
        if (admin) {
          // Remove the specific refresh token
          admin.refreshTokens = admin.refreshTokens.filter(
            (tokenData: any) => tokenData.token !== refreshToken
          );
          await admin.save();
        }
      }
    }

    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear cookies
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('admin_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}