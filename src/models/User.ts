import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Add userId field
  firmName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  established: { type: Date, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);
export default User;
