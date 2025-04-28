import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function registerUser(req, res) {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password, email } = req.body;
  console.log(email);

  // Check if user already exists
  const isUser = await userModel.findOne({ email });
  if (isUser) {
    console.log(isUser);

    return res.status(409).json({ message: "Email already exists" }); // 409 Conflict
  }

  // Hash password
  const hashedPassword = await userModel.hashPassword(password);

  // Create user
  const newUser = await userModel.create({
    ...req.body,
    password: hashedPassword,
  });

  console.log(newUser);

  // Generate JWT Token
  const token = newUser.generateAuthToken();

  // Send response with proper JSON format
  return res.status(201).json({
    message: "User registered successfully",
    token,
    user: newUser,
  });
}

export async function signInUser(req, res) {
  // Validate request input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // Unauthorized
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" }); // Unauthorized
    }

    // Generate authentication token
    const token = user.generateAuthToken();

    // Respond with user data & token
    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getUserProfile = async (req, res, next) => {
  console.log('profile called');
  
  return res.status(200).json(req.user);
};


export const updateUserStatus = async (req, res) => {
  try {
    console.log('hello from asy');
    
    // Extract token from headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token provided.",
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    const userId = decoded._id; // Ensure your JWT contains `id`

    // Extract status from request
    const { isOnline } = req.body;

    if (typeof isOnline !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be a boolean value.",
      });
    }

    // Update user status
    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          isOnline,
          lastActive: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${isOnline ? "online" : "offline"}.`,
      data: {
        isOnline: updatedUser.isOnline,
        lastActive: updatedUser.lastActive,
      },
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating status.",
      error: error.message,
    });
  }
};

export const getAvailableUsers = async (req, res) => {
  try {
    const { isOnline } = req.query;

    // Build the query object
    const query = {};

    // Add online status to query if provided
    if (isOnline !== undefined) {
      query.isOnline = isOnline === "true";
    }

    // Find users matching the criteria
    const users = await userModel
      .find(query)
      .select({
        firstName: 1,
        lastName: 1,
        phoneNumber: 1,
        isOnline: 1,
        lastActive: 1,
        medicalHistory: 1,
        appointments: 1,
      })
      .sort({ lastActive: -1 }); // Sort by last active (most recent first)

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error finding users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};
