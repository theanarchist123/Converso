import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connection';
import { AdminUser, ADMIN_ROLES, ROLE_PERMISSIONS } from '@/lib/mongodb/models/AdminUser';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Allow reset by deleting existing admins first (for development)
    await AdminUser.deleteMany({});
    console.log('Cleared existing admin users for fresh setup');

    // Hash the default password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin users
    const adminUsers = [
      {
        email: 'admin@converso.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: ADMIN_ROLES.SUPER_ADMIN,
        permissions: ROLE_PERMISSIONS[ADMIN_ROLES.SUPER_ADMIN],
        isActive: true,
        loginAttempts: 0,
        refreshTokens: []
      },
      {
        email: 'moderator@converso.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Moderator',
        role: ADMIN_ROLES.MODERATOR,
        permissions: ROLE_PERMISSIONS[ADMIN_ROLES.MODERATOR],
        isActive: true,
        loginAttempts: 0,
        refreshTokens: [],
        createdBy: 'admin@converso.com'
      },
      {
        email: 'viewer@converso.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Viewer',
        role: ADMIN_ROLES.VIEWER,
        permissions: ROLE_PERMISSIONS[ADMIN_ROLES.VIEWER],
        isActive: true,
        loginAttempts: 0,
        refreshTokens: [],
        createdBy: 'admin@converso.com'
      }
    ];

    // Insert admin users
    const createdAdmins = await AdminUser.insertMany(adminUsers);

    return NextResponse.json({
      success: true,
      message: 'Admin users created successfully!',
      adminUsers: createdAdmins.map(admin => ({
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions
      })),
      credentials: [
        { email: 'admin@converso.com', password: 'admin123', role: 'Super Admin' },
        { email: 'moderator@converso.com', password: 'admin123', role: 'Moderator' },
        { email: 'viewer@converso.com', password: 'admin123', role: 'Viewer' }
      ],
      instructions: {
        loginUrl: '/admin/login',
        dashboardUrl: '/admin/dashboard'
      }
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}