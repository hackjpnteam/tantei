import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  roles: ('student' | 'instructor' | 'admin' | 'superadmin' | 'police_ob')[];
  policeObVerified?: boolean;
  obOnboarding?: {
    trainingDone?: boolean;
    pledgeAccepted?: boolean;
  };
  subscribedPlan?: string; // Course code
  planStartDate?: Date;
  planEndDate?: Date;
  createdAt: Date;
  lastAccess?: Date;
  profile?: {
    company?: string;
    position?: string;
    companyUrl?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  roles: [{
    type: String,
    enum: ['student', 'instructor', 'admin', 'superadmin', 'police_ob'],
    default: 'student'
  }],
  policeObVerified: {
    type: Boolean,
    default: false
  },
  obOnboarding: {
    trainingDone: { type: Boolean, default: false },
    pledgeAccepted: { type: Boolean, default: false }
  },
  subscribedPlan: {
    type: String,
    trim: true,
    default: null
  },
  planStartDate: {
    type: Date,
    default: null
  },
  planEndDate: {
    type: Date,
    default: null
  },
  lastAccess: {
    type: Date,
    default: Date.now
  },
  profile: {
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    companyUrl: { type: String, trim: true },
    bio: { type: String, trim: true },
    avatarUrl: { type: String, trim: true }
  }
}, {
  timestamps: true
});

// Index for queries (email index is automatic due to unique: true)
UserSchema.index({ 'profile.company': 1 });
UserSchema.index({ createdAt: -1 });

let User: Model<IUser>;

try {
  User = mongoose.models?.User || mongoose.model<IUser>('User', UserSchema);
} catch {
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;