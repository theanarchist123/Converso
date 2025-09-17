import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectMongoDB from '@/lib/mongodb/connection';
import LearningLog from '@/lib/mongodb/models/LearningLog';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();
    
    const body = await request.json();
    const { title, content, tags = [], mood = 'satisfied', rating = 3, companionId, sessionId } = body;
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    // Create new learning log
    const learningLog = new LearningLog({
      userId,
      companionId,
      sessionId,
      title: title.trim(),
      content: content.trim(),
      tags: tags.map((tag: string) => tag.trim().toLowerCase()),
      mood,
      rating: Number(rating)
    });
    
    const savedLog = await learningLog.save();
    
    return NextResponse.json({
      success: true,
      data: savedLog
    });
  } catch (error) {
    console.error('Learning log creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create learning log' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const companionId = searchParams.get('companionId');
    const tag = searchParams.get('tag');
    
    // Build query
    const query: any = { userId };
    if (companionId) query.companionId = companionId;
    if (tag) query.tags = { $in: [tag] };
    
    // Get total count for pagination
    const total = await LearningLog.countDocuments(query);
    
    // Get logs with pagination
    const logs = await LearningLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Learning logs fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch learning logs' 
    }, { status: 500 });
  }
}