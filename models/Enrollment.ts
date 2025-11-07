import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: 'enrolled' | 'completed' | 'dropped';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped'],
    default: 'enrolled'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1 });

let Enrollment: Model<IEnrollment>;

try {
  Enrollment = mongoose.models?.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
} catch {
  Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
}

export default Enrollment;