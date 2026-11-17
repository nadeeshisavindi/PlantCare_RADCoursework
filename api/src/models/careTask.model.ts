import { Schema, model, Document, Model, Types } from 'mongoose';
import { CareType, RecurrenceUnit, TaskStatus } from '../types/enums';

export interface IRecurrence {
  unit: RecurrenceUnit;
  interval: number; // every N days/weeks/months
}

export interface ICareTask extends Document {
  owner: Types.ObjectId;
  plant: Types.ObjectId;
  type: CareType;
  title: string;
  notes?: string;
  dueDate: Date;
  status: TaskStatus;
  completedAt?: Date;
  recurrence: IRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

const recurrenceSchema = new Schema<IRecurrence>(
  {
    unit: { type: String, enum: Object.values(RecurrenceUnit), default: RecurrenceUnit.NONE },
    interval: { type: Number, default: 1, min: [1, 'Interval must be at least 1'], max: 365 },
  },
  { _id: false }
);

const careTaskSchema = new Schema<ICareTask>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plant: { type: Schema.Types.ObjectId, ref: 'Plant', required: true, index: true },
    type: { type: String, enum: Object.values(CareType), required: [true, 'Care type is required'] },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    notes: { type: String, trim: true, maxlength: 500 },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING },
    completedAt: { type: Date },
    recurrence: { type: recurrenceSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Used by dashboard queries and the reminder scheduler
careTaskSchema.index({ owner: 1, status: 1, dueDate: 1 });
careTaskSchema.index({ status: 1, dueDate: 1 });

export const CareTask: Model<ICareTask> = model<ICareTask>('CareTask', careTaskSchema);
