import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  stripePaymentIntentId?: string;
  amountJPY: number;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
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
  stripePaymentIntentId: {
    type: String,
    trim: true
  },
  amountJPY: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ courseId: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

let Payment: Model<IPayment>;

try {
  Payment = mongoose.models?.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
} catch {
  Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
}

export default Payment;