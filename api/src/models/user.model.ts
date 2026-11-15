import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/enums';

export interface INotificationSettings {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  reminderLeadHours: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  notificationSettings: INotificationSettings;
  refreshTokenHashes: string[]; 
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const notificationSettingsSchema = new Schema<INotificationSettings>(
  {
    emailEnabled: { type: Boolean, default: true },
    inAppEnabled: { type: Boolean, default: true },
    reminderLeadHours: { type: Number, default: 24, min: 0, max: 168 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, 
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    notificationSettings: {
      type: notificationSettingsSchema,
      default: () => ({}),
    },
    refreshTokenHashes: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};


userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const out = ret as Record<string, unknown>;
    delete out.password;
    delete out.refreshTokenHashes;
    delete out.__v;
    return out;
  },
});

export const User: Model<IUser> = model<IUser>('User', userSchema);
