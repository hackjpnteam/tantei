import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISubmission extends Document {
  examId: Types.ObjectId;
  userId: Types.ObjectId;
  answers: any;
  score?: number;
  gradedBy?: Types.ObjectId;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: {
    type: Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true
});

SubmissionSchema.index({ examId: 1, userId: 1 }, { unique: true });
SubmissionSchema.index({ userId: 1 });

let Submission: Model<ISubmission>;

try {
  Submission = mongoose.models?.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
} catch {
  Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
}

export default Submission;