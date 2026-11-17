import { Schema, model, Document, Model, Types } from 'mongoose';
import { EmailStatus, NotificationType } from '../types/enums';

export interface INotification extends Document {
  user: Types.ObjectId;
  task: Types.ObjectId;
  plant: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  dueDate: Date; // the task's due date this reminder refers to (part of the dedupe key)
  isRead: boolean;
  readAt?: Date;
  emailStatus: EmailStatus;
  emailSentAt?: Date;
  emailError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    task: { type: Schema.Types.ObjectId, ref: 'CareTask', required: true },
    plant: { type: Schema.Types.ObjectId, ref: 'Plant', required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    dueDate: { type: Date, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    emailStatus: { type: String, enum: Object.values(EmailStatus), default: EmailStatus.PENDING },
    emailSentAt: { type: Date },
    emailError: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// Duplicate prevention: one notification per (task, type, dueDate).
// A recurring task gets a new dueDate after completion, so it can notify again.
notificationSchema.index({ task: 1, type: 1, dueDate: 1 }, { unique: true });

// Fast inbox queries (unread first, newest first)
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> = model<INotification>('Notification', notificationSchema);
