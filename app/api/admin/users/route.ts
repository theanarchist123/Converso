import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminJWT } from '@/lib/jwt/auth';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = verifyAdminJWT(request);

    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminData.permissions?.includes('view_users')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Fetch users from Clerk
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({
      limit: limit,
      offset: offset,
      orderBy: '-created_at'
    });

    // Transform user data for admin panel
    const userList = users.data.map((user: any) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || 'No email',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      banned: user.banned,
      imageUrl: user.imageUrl,
      hasImage: user.hasImage,
      publicMetadata: user.publicMetadata
    }));

    return NextResponse.json({
      success: true,
      users: userList,
      totalCount: users.totalCount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(users.totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = verifyAdminJWT(request);

    if (!adminData || !adminData.permissions?.includes('edit_users')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clerk = await clerkClient();
    let result;

    switch (action) {
      case 'ban':
        result = await clerk.users.banUser(userId);
        break;
      case 'unban':
        result = await clerk.users.unbanUser(userId);
        break;
      case 'delete':
        result = await clerk.users.deleteUser(userId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      userId,
      result
    });

  } catch (error) {
    console.error('Error performing user action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}