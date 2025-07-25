import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { v4 as uuidv4 } from "uuid"; // Import uuid

const router = express.Router();
const JWT_SECRET = "your_jwt_secret"; // Replace with an environment variable in production

// Register
router.post("/register", async (req, res): Promise<any> => {
  const {
    firmName,
    gstNumber,
    mobileNumber,
    address,
    established,
    ownerName,
    email,
    password,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4(); // Generate a unique user ID

    const user = new User({
      userId, // Store the unique user ID
      firmName,
      gstNumber,
      mobileNumber,
      address,
      established,
      ownerName,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login
router.post("/login", async (req, res): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.userId }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res): Promise<any> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token (you can use a library like `crypto` for this)
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    // In production, send the reset link via email (e.g., using nodemailer)
    const resetLink = `https://yourdomain.com/reset-password/${resetToken}`;

    res.json({ message: "Password reset link sent", resetLink });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing forgot password", error });
  }
});

export default router;
