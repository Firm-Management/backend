import mongoose, { Schema, Document } from "mongoose";

export interface IFirm extends Document {
  id: number;
  userId: string; // Add userId to associate the firm with a user
  name: string;
  contact: string;
  address: string;
  website?: string;
  industry?: string;
  establishedYear?: number;
  gstNumber?: string;
  status?: string; // Optional field for firm status (e.g., 'active', 'inactive')
  owner?: string; // Optional field for the name of the owner or manager
  createdAt?: Date; // Optional field for the creation date
  updatedAt?: Date; // Optional field for the last update date
}

const FirmSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: String, required: true }, // Add userId reference to the User model
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String, default: "" }, // Optional field
    industry: { type: String, default: "" }, // Optional field
    establishedYear: { type: Number, default: null }, // Optional field
    gstNumber: { type: String, default: "" }, // Optional field
    status: { type: String, default: "active" }, // Optional field, default is 'active'
    owner: { type: String, default: "" }, // Optional field
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model<IFirm>("Firm", FirmSchema);
