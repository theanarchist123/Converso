import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUserFeedback extends Document {
  userId: string;
  feedbackType: 'bug_report' | 'feature_request' | 'general' | 'session_review';
  title: string;
  description: string;
  rating?: number; // 1-5 stars
  tags: string[];
  status: 'pending' | 'reviewed' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const UserFeedbackSchema = new Schema<IUserFeedback>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  feedbackType: {
    type: String,
    enum: ['bug_report', 'feature_request', 'general', 'session_review'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function() {
      return this.feedbackType === 'session_review';
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'closed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserFeedbackSchema.index({ userId: 1, createdAt: -1 });
UserFeedbackSchema.index({ feedbackType: 1, status: 1 });
UserFeedbackSchema.index({ rating: 1 });

export const UserFeedback = models.UserFeedback || model<IUserFeedback>('UserFeedback', UserFeedbackSchema);