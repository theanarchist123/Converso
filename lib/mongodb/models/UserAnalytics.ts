import mongoose from 'mongoose';

export interface IUserAnalytics {
  _id?: string;
  userId: string;
  eventType: string;
  eventData: {
    companionId?: string;
    sessionId?: string;
    duration?: number;
    page?: string;
    action?: string;
    metadata?: any;
  };
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const userAnalyticsSchema = new mongoose.Schema<IUserAnalytics>({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  eventType: { 
    type: String, 
    required: true,
    enum: ['page_view', 'companion_created', 'session_started', 'session_ended', 'bookmark_added', 'learning_log_created']
  },
  eventData: {
    companionId: String,
    sessionId: String,
    duration: Number,
    page: String,
    action: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  userAgent: String,
  ipAddress: String
}, {
  timestamps: true
});

// Indexes for analytics queries
userAnalyticsSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
userAnalyticsSchema.index({ eventType: 1, createdAt: -1 });
userAnalyticsSchema.index({ createdAt: -1 });

export default mongoose.models.UserAnalytics || mongoose.model<IUserAnalytics>('UserAnalytics', userAnalyticsSchema);