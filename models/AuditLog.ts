import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId;
  metadata?: any;
  at: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  targetType: {
    type: String,
    required: true,
    trim: true
  },
  targetId: {
    type: Schema.Types.ObjectId
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ at: -1 });

let AuditLog: Model<IAuditLog>;

try {
  AuditLog = mongoose.models?.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
} catch {
  AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
}

export default AuditLog;