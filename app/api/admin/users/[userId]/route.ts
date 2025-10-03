import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminJWT } from '@/lib/jwt/auth';
import { clerkClient } from '@clerk/nextjs/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin authentication
    const adminData = verifyAdminJWT(request);

    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow all admins to edit users (default permission)
    const hasPermission = !adminData.permissions || adminData.permissions.length === 0 || adminData.permissions.includes('edit_users');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;
    const { userId } = await params;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clerk = await clerkClient();
    let result;

    console.log(`🔧 Admin action: ${action} on user ${userId}`);

    switch (action) {
      case 'approve':
        // Unban user if they were banned (approve = active)
        result = await clerk.users.unbanUser(userId);
        // Update metadata to mark as approved
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            status: 'active',
            approvedAt: new Date().toISOString()
          }
        });
        break;

      case 'ban':
        // Ban the user - they won't be able to sign in
        result = await clerk.users.banUser(userId);
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            status: 'banned',
            bannedAt: new Date().toISOString(),
            bannedReason: 'Permanently banned by administrator'
          }
        });
        break;

      case 'delete':
        // Permanently delete the user
        result = await clerk.users.deleteUser(userId);
        return NextResponse.json({
          success: true,
          message: 'User deleted permanently',
          userId
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get updated user data
    const updatedUser = await clerk.users.getUser(userId);

    return NextResponse.json({
      success: true,
      message: `User ${action}ed successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.emailAddresses[0]?.emailAddress || 'No email',
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        banned: updatedUser.banned,
        publicMetadata: updatedUser.publicMetadata
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for permanent user deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin authentication
    const adminData = verifyAdminJWT(request);

    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow all admins to delete users (default permission)
    const hasPermission = !adminData.permissions || adminData.permissions.length === 0 || adminData.permissions.includes('delete_users');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const clerk = await clerkClient();
    
    console.log(`🗑️ Deleting user ${userId}`);
    
    await clerk.users.deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted permanently',
      userId
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
