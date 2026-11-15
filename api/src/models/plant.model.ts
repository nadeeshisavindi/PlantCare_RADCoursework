import { Schema, model, Document, Model, Types } from 'mongoose';
import { LightRequirement } from '../types/enums';

export interface ICareInfo {
  light: LightRequirement;
  wateringTips?: string;
  fertilizerTips?: string;
  pruningTips?: string;
  notes?: string;
}

export interface IPlant extends Document {
  owner: Types.ObjectId;
  name: string;
  species: string;
  imageUrl?: string;
  description?: string;
  plantingDate: Date;
  location?: string;
  careInfo: ICareInfo;
  createdAt: Date;
  updatedAt: Date;
}

const careInfoSchema = new Schema<ICareInfo>(
  {
    light: { type: String, enum: Object.values(LightRequirement), default: LightRequirement.MEDIUM },
    wateringTips: { type: String, trim: true, maxlength: 500 },
    fertilizerTips: { type: String, trim: true, maxlength: 500 },
    pruningTips: { type: String, trim: true, maxlength: 500 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const plantSchema = new Schema<IPlant>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: {
      type: String,
      required: [true, 'Plant name is required'],
      trim: true,
      minlength: [2, 'Plant name must be at least 2 characters'],
      maxlength: [80, 'Plant name cannot exceed 80 characters'],
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
      maxlength: [100, 'Species cannot exceed 100 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Image must be a valid http(s) URL'],
    },
    description: { type: String, trim: true, maxlength: [1000, 'Description cannot exceed 1000 characters'] },
    plantingDate: {
      type: Date,
      required: [true, 'Planting date is required'],
      validate: {
        validator: (v: Date) => v.getTime() <= Date.now() + 24 * 60 * 60 * 1000,
        message: 'Planting date cannot be in the future',
      },
    },
    location: { type: String, trim: true, maxlength: 100 },
    careInfo: { type: careInfoSchema, default: () => ({}) },
  },
  { timestamps: true }
);


plantSchema.index({ owner: 1, createdAt: -1 });
plantSchema.index({ name: 'text', species: 'text' });

export const Plant: Model<IPlant> = model<IPlant>('Plant', plantSchema);
