import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connection';
import { AdminUser } from '@/lib/mongodb/models/AdminUser';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Delete all existing admin users
    const deleteResult = await AdminUser.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: 'All admin data has been reset successfully!',
      deletedCount: deleteResult.deletedCount,
      instructions: {
        nextStep: 'Now call POST /api/admin/setup to create fresh admin users',
        setupUrl: '/api/admin/setup'
      }
    });

  } catch (error) {
    console.error('Admin reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset admin data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}