import mongoose, { Schema, type Document, type Model } from "mongoose";

export type JobStatus = "buka" | "tutup";

export interface IJob extends Document {
  title: string;
  division: string;
  type: string;
  location: string;
  description: string;
  requirements: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    division: { type: String, trim: true, maxlength: 100, default: "" },
    type: { type: String, trim: true, maxlength: 50, default: "Full-time" },
    location: { type: String, trim: true, maxlength: 100, default: "" },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    requirements: { type: String, trim: true, maxlength: 3000, default: "" },
    status: { type: String, enum: ["buka", "tutup"], default: "buka" },
  },
  { timestamps: true }
);

export const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
