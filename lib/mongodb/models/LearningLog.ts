import mongoose from 'mongoose';

export interface ILearningLog {
  _id?: string;
  userId: string;
  companionId?: string;
  sessionId?: string;
  title: string;
  content: string;
  tags: string[];
  mood: 'excited' | 'confident' | 'confused' | 'frustrated' | 'satisfied';
  rating: number; // 1-5 scale
  createdAt: Date;
  updatedAt: Date;
}

const learningLogSchema = new mongoose.Schema<ILearningLog>({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  companionId: { 
    type: String, 
    required: false 
  },
  sessionId: { 
    type: String, 
    required: false 
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  tags: [{ 
    type: String,
    maxlength: 50
  }],
  mood: { 
    type: String, 
    enum: ['excited', 'confident', 'confused', 'frustrated', 'satisfied'],
    default: 'satisfied'
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes for better performance
learningLogSchema.index({ userId: 1, createdAt: -1 });
learningLogSchema.index({ companionId: 1, createdAt: -1 });
learningLogSchema.index({ tags: 1 });

export default mongoose.models.LearningLog || mongoose.model<ILearningLog>('LearningLog', learningLogSchema);