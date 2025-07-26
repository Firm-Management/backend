import mongoose, { Schema, Document } from "mongoose";

export interface IFirm extends Document {
  id: number;
  userId: string;
  name: string;
  contact: string;
  address: string;
  website?: string;
  industry?: string;
  establishedYear?: number;
  gstNumber?: string;
  status?: string;
  owner?: string;
  openingBalance?: number; // ✅ New field added
  createdAt?: Date;
  updatedAt?: Date;
}

const FirmSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String, default: "" },
    industry: { type: String, default: "" },
    establishedYear: { type: Number, default: null },
    gstNumber: { type: String, default: "" },
    status: { type: String, default: "active" },
    owner: { type: String, default: "" },
    openingBalance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFirm>("Firm", FirmSchema);
