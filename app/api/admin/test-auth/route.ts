import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Step 1: Check Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Step 1 - Auth header check:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return NextResponse.json({
        step1_header: { success: false, message: 'No authorization header' },
        step2_format: { success: false, message: 'Skipped - no header' },
        step3_decode: { success: false, message: 'Skipped - no header' },
        step4_final: { success: false, message: 'Authentication failed' }
      }, { status: 401 });
    }

    // Step 2: Check Bearer format
    const tokenParts = authHeader.split(' ');
    const hasBearerFormat = tokenParts.length === 2 && tokenParts[0] === 'Bearer';
    console.log('🔍 Step 2 - Bearer format check:', hasBearerFormat ? 'Valid' : 'Invalid');
    
    if (!hasBearerFormat) {
      return NextResponse.json({
        step1_header: { success: true, message: 'Authorization header present' },
        step2_format: { success: false, message: 'Invalid bearer token format' },
        step3_decode: { success: false, message: 'Skipped - invalid format' },
        step4_final: { success: false, message: 'Authentication failed' }
      }, { status: 401 });
    }

    const token = tokenParts[1];

    // Step 3: Decode and verify JWT
    console.log('🔍 Step 3 - Token verification...');
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      console.log('✅ Token decoded successfully:', {
        adminId: decoded.adminId,
        email: decoded.email,
        role: decoded.role,
        type: decoded.type,
        exp: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', (jwtError as Error).message);
      return NextResponse.json({
        step1_header: { success: true, message: 'Authorization header present' },
        step2_format: { success: true, message: 'Bearer format valid' },
        step3_decode: { success: false, message: `JWT verification failed: ${(jwtError as Error).message}` },
        step4_final: { success: false, message: 'Authentication failed' }
      }, { status: 401 });
    }

    // Step 4: Final validation
    const isValidAccessToken = decoded.type === 'access';
    const isNotExpired = decoded.exp > Math.floor(Date.now() / 1000);
    
    console.log('🔍 Step 4 - Final validation:', {
      isValidAccessToken,
      isNotExpired,
      currentTime: new Date().toISOString(),
      tokenExpiry: new Date(decoded.exp * 1000).toISOString()
    });

    if (!isValidAccessToken || !isNotExpired) {
      return NextResponse.json({
        step1_header: { success: true, message: 'Authorization header present' },
        step2_format: { success: true, message: 'Bearer format valid' },
        step3_decode: { success: true, message: 'JWT decoded successfully' },
        step4_final: { 
          success: false, 
          message: `Token validation failed: ${!isValidAccessToken ? 'Not access token' : 'Token expired'}` 
        }
      }, { status: 401 });
    }

    // Success!
    return NextResponse.json({
      step1_header: { success: true, message: 'Authorization header present' },
      step2_format: { success: true, message: 'Bearer format valid' },
      step3_decode: { success: true, message: 'JWT decoded successfully' },
      step4_final: { success: true, message: 'Authentication successful' },
      admin: {
        id: decoded.adminId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions
      }
    });

  } catch (error) {
    console.error('❌ Test auth error:', error);
    return NextResponse.json({
      step1_header: { success: false, message: 'Server error' },
      step2_format: { success: false, message: 'Server error' },
      step3_decode: { success: false, message: 'Server error' },
      step4_final: { success: false, message: 'Internal server error' },
      error: (error as Error).message
    }, { status: 500 });
  }
}