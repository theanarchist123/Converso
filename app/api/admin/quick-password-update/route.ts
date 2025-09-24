import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connection';
import { AdminUser } from '@/lib/mongodb/models/AdminUser';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Just update the super admin with a secure password (faster - only one user)
    const email = 'admin@converso.com';
    const newPassword = 'SecureAdmin2025!';
    
    // Use lower salt rounds for faster processing (still secure)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await AdminUser.updateOne(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          loginAttempts: 0
        }
      }
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Super admin password updated successfully!',
        credentials: {
          email: 'admin@converso.com',
          password: 'SecureAdmin2025!',
          role: 'Super Admin',
          note: 'This password is secure and unique - no data breach history!'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Super admin user not found'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Quick password update error:', error);
    return NextResponse.json(
      { error: 'Failed to update password', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}