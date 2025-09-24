import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminJWT } from '@/lib/jwt/auth';
import connectToDatabase from '@/lib/mongodb/connection';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = verifyAdminJWT(request);

    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminData.permissions?.includes('view_companions')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    // Mock companion data for now (replace with actual database query)
    const mockCompanions = Array.from({ length: 50 }, (_, i) => ({
      id: `companion_${i + 1}`,
      name: `AI Companion ${i + 1}`,
      description: `A helpful AI companion for learning topic ${i + 1}`,
      category: ['Education', 'Science', 'Language', 'Math'][i % 4],
      userId: `user_${Math.floor(i / 5) + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['active', 'under_review', 'suspended'][Math.floor(Math.random() * 3)],
      reportCount: Math.floor(Math.random() * 10),
      isPublic: Math.random() > 0.3,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    // Filter by status if provided
    let filteredCompanions = mockCompanions;
    if (status) {
      filteredCompanions = mockCompanions.filter(comp => comp.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCompanions = filteredCompanions.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      companions: paginatedCompanions,
      pagination: {
        page,
        limit,
        total: filteredCompanions.length,
        totalPages: Math.ceil(filteredCompanions.length / limit)
      },
      stats: {
        total: mockCompanions.length,
        active: mockCompanions.filter(c => c.status === 'active').length,
        under_review: mockCompanions.filter(c => c.status === 'under_review').length,
        suspended: mockCompanions.filter(c => c.status === 'suspended').length
      }
    });

  } catch (error) {
    console.error('Error fetching companions:', error);
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

    if (!adminData || !adminData.permissions?.includes('moderate_companions')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companionId, action } = body;

    if (!companionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Mock companion moderation logic (replace with actual database operations)
    const validActions = ['approve', 'suspend', 'delete'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Simulate database update
    console.log(`Performing action ${action} on companion ${companionId}`);

    return NextResponse.json({
      success: true,
      message: `Companion ${action}d successfully`,
      companionId,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error performing companion action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}