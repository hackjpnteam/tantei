import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IExam extends Document {
  courseId: Types.ObjectId;
  title: string;
  type: 'quiz' | 'report' | 'practical';
  items: any[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>({
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
  type: {
    type: String,
    enum: ['quiz', 'report', 'practical'],
    required: true
  },
  items: [{
    type: Schema.Types.Mixed
  }],
  passingScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  }
}, {
  timestamps: true
});

ExamSchema.index({ courseId: 1 });
ExamSchema.index({ type: 1 });

let Exam: Model<IExam>;

try {
  Exam = mongoose.models?.Exam || mongoose.model<IExam>('Exam', ExamSchema);
} catch {
  Exam = mongoose.model<IExam>('Exam', ExamSchema);
}

export default Exam;