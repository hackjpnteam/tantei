import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  title: string;
  description: string;
  priceJPY: number;
  durationDays: number;
  mode: 'online' | 'hybrid';
  syllabus: string[];
  tags: string[];
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priceJPY: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    enum: ['online', 'hybrid'],
    required: true
  },
  syllabus: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  visible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

CourseSchema.index({ code: 1 });
CourseSchema.index({ visible: 1 });
CourseSchema.index({ tags: 1 });

let Course: Model<ICourse>;

try {
  Course = mongoose.models?.Course || mongoose.model<ICourse>('Course', CourseSchema);
} catch {
  Course = mongoose.model<ICourse>('Course', CourseSchema);
}

export default Course;