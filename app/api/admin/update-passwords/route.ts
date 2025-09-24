import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connection';
import { AdminUser } from '@/lib/mongodb/models/AdminUser';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // New secure passwords
    const securePasswords = {
      'admin@converso.com': 'ConV3rso@2025!Admin',
      'moderator@converso.com': 'ConV3rso@2025!Mod',
      'viewer@converso.com': 'ConV3rso@2025!View'
    };

    const results = [];

    for (const [email, password] of Object.entries(securePasswords)) {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await AdminUser.updateOne(
        { email: email },
        { 
          $set: { 
            password: hashedPassword,
            loginAttempts: 0 // Reset login attempts
          }
        }
      );

      results.push({
        email,
        updated: result.modifiedCount > 0,
        found: result.matchedCount > 0
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin passwords updated successfully!',
      results,
      newCredentials: [
        {
          email: 'admin@converso.com',
          password: 'ConV3rso@2025!Admin',
          role: 'Super Admin',
          description: 'Full administrative access'
        },
        {
          email: 'moderator@converso.com',
          password: 'ConV3rso@2025!Mod',
          role: 'Moderator',
          description: 'User and companion moderation access'
        },
        {
          email: 'viewer@converso.com',
          password: 'ConV3rso@2025!View',
          role: 'Viewer',
          description: 'Read-only access to analytics and reports'
        }
      ],
      securityNote: 'These passwords are secure and unique. Please store them safely!'
    });

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Failed to update passwords', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}