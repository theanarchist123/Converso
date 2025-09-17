import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb/connection';
import { UserFeedback } from '@/lib/mongodb/models/UserFeedback';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { feedbackType, title, description, rating, tags } = body;

    if (!feedbackType || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: feedbackType, title, description' },
        { status: 400 }
      );
    }

    const feedback = new UserFeedback({
      userId,
      feedbackType,
      title,
      description,
      rating,
      tags: tags || []
    });

    await feedback.save();

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback._id,
        feedbackType: feedback.feedbackType,
        title: feedback.title,
        description: feedback.description,
        rating: feedback.rating,
        tags: feedback.tags,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const feedbackType = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const query: any = { userId };
    
    if (feedbackType) {
      query.feedbackType = feedbackType;
    }
    
    if (status) {
      query.status = status;
    }

    const feedback = await UserFeedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await UserFeedback.countDocuments(query);

    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}