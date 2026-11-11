import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { Role } from "@/lib/auth";
import type { ApplicantStatus } from "@/lib/score";

export type { Role };
export type { ApplicantStatus };

export interface IExperience {
  _id?: mongoose.Types.ObjectId;
  company: string;
  position: string;
  /** Bulan mulai, format "YYYY-MM". */
  startDate: string;
  /** Bulan selesai, format "YYYY-MM". Kosong bila masih bekerja. */
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    company: { type: String, trim: true, maxlength: 150, default: "" },
    position: { type: String, trim: true, maxlength: 150, default: "" },
    startDate: { type: String, trim: true, maxlength: 7, default: "" },
    endDate: { type: String, trim: true, maxlength: 7, default: "" },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { _id: true }
);

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone?: string;
  education?: string;
  experience?: string;
  address?: string;
  cvUrl?: string;
  cvPublicId?: string;
  photoUrl?: string;
  photoPublicId?: string;
  ijazahUrl?: string;
  ijazahPublicId?: string;
  transcriptUrl?: string;
  transcriptPublicId?: string;
  experiences: IExperience[];
  appliedJobId?: mongoose.Types.ObjectId | null;
  appliedAt?: Date | null;
  status: ApplicantStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["pelamar", "hr"], required: true, default: "pelamar" },
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    education: { type: String, trim: true, maxlength: 200, default: "" },
    experience: { type: String, trim: true, maxlength: 2000, default: "" },
    address: { type: String, trim: true, maxlength: 300, default: "" },
    cvUrl: { type: String, default: "" },
    cvPublicId: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
    ijazahUrl: { type: String, default: "" },
    ijazahPublicId: { type: String, default: "" },
    transcriptUrl: { type: String, default: "" },
    transcriptPublicId: { type: String, default: "" },
    experiences: { type: [ExperienceSchema], default: [] },
    appliedJobId: { type: Schema.Types.ObjectId, ref: "Job", default: null },
    appliedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["baru", "proses", "lulus", "tidak lolos"],
      default: "baru",
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
