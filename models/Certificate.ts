import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICertificate extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  issuedAt: Date;
  badge: '★3' | '★5';
  renewalYear?: number;
}

const CertificateSchema = new Schema<ICertificate>({
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
  issuedAt: {
    type: Date,
    default: Date.now
  },
  badge: {
    type: String,
    enum: ['★3', '★5'],
    required: true
  },
  renewalYear: {
    type: Number
  }
}, {
  timestamps: true
});

CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
CertificateSchema.index({ issuedAt: -1 });

let Certificate: Model<ICertificate>;

try {
  Certificate = mongoose.models?.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);
} catch {
  Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
}

export default Certificate;