import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideoStats {
  likes: number;
}

export interface IInstructorRef {
  _id: string;
  name: string;
  avatarUrl: string;
}

export interface IVideo extends Document {
  title: string;
  description: string;
  category: string;
  course?: mongoose.Types.ObjectId;
  durationSec: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl?: string;
  videoUrl: string;
  sourceUrl: string;  // alias for videoUrl
  instructor: IInstructorRef;
  stats: IVideoStats;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const VideoSchema = new Schema<IVideo>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  durationSec: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    default: '/default-thumbnail.png'
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  sourceUrl: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatarUrl: {
      type: String,
      required: true
    }
  },
  stats: {
    likes: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

VideoSchema.index({ 'instructor._id': 1 });
VideoSchema.index({ 'instructor.name': 1 });
VideoSchema.index({ category: 1 });
VideoSchema.index({ course: 1 });
VideoSchema.index({ difficulty: 1 });
VideoSchema.index({ createdAt: -1 });
VideoSchema.index({ 'stats.views': -1 });
VideoSchema.index({ title: 'text', description: 'text' });

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;