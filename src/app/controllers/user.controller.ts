import express, { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "../middleware/verifytoken";

dotenv.config();

export const userRoutes = express.Router();

userRoutes.post("/create-user", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const user = await User.create(body);

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error creating user:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message || "Internal Server Error",
    });
  }
});

userRoutes.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
    console.log(email, password)
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ⚠️ Insecure: Just for example, normally use bcrypt.compare()
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // ✅ Ensure JWT_SECRET is defined
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.log("Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to login!",
      error: error.message || "Internal Server Error",
    });
  }
});


userRoutes.get("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // 🛠 cast to any
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
