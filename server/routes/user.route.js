import express from "express";
import { body } from "express-validator";
import {
  getAvailableUsers,
  getUserProfile,
  registerUser,
  signInUser,
  updateUserStatus,
} from "../controller/user.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password")
      .isLength({ min: 4 })
      .withMessage("Password must be at least 4 characters long"),
    body("firstName")
      .isLength({ min: 3, max: 20 })
      .withMessage("First name must be between 3 to 20 characters"),
    body("lastName")
      .isLength({ min: 3, max: 20 })
      .withMessage("Last name must be between 3 to 20 characters"),
    body("phoneNumber")
      .isMobilePhone()
      .withMessage("Must be a valid mobile phone number"),
    body("dateOfBirth")
      .isISO8601()
      .withMessage("Must be a valid date in YYYY-MM-DD format"),
    body("gender")
      .isIn(["Male", "Female", "Other"])
      .withMessage("Gender must be either Male, Female, or Other"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  signInUser
);

router.get("/profile", authUser, getUserProfile);

// Update user online status
router.put("/status", updateUserStatus);

router.get("/available", getAvailableUsers);

export default router;
