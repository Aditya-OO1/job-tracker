import mongoose, { Document, Schema } from 'mongoose';
import { KanbanStatus } from '../types';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: KanbanStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  resumeSuggestions: Array<{ id: string; text: string }>;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    jdLink: { type: String, trim: true },
    notes: { type: String, trim: true },
    dateApplied: { type: Date, default: Date.now },
    salaryRange: { type: String, trim: true },
    requiredSkills: [{ type: String }],
    niceToHaveSkills: [{ type: String }],
    seniority: { type: String, trim: true },
    location: { type: String, trim: true },
    resumeSuggestions: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
