import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  id: number;
  userId: string;
  firmId: number;
  amount: number;
  type: string;
  date: Date;
  description: string;
}

const TransactionSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: String, required: true }, // Add userId as a required field
    firmId: { type: Number, required: true }, // Change to ObjectId for firm reference
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  {
    collection: "transactions", // Store in transactions collection
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
