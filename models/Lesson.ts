import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILesson extends Document {
  courseId: Types.ObjectId;
  title: string;
  videoUrl?: string;
  materials: {
    type: 'pdf' | 'link';
    url: string;
    label: string;
  }[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  materials: [{
    type: {
      type: String,
      enum: ['pdf', 'link'],
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    }
  }],
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

LessonSchema.index({ courseId: 1, order: 1 });

let Lesson: Model<ILesson>;

try {
  Lesson = mongoose.models?.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
} catch {
  Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
}

export default Lesson;