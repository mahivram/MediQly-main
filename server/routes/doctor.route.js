import express from "express";
import { body } from "express-validator";
import {
  registerDoctor,
  signInDoctor,
  getDoctorProfile,
  getAvailableDoctors,
  updateDoctorStatus,
} from "../controller/doctor.controller.js";
import { authDoctor } from "../middleware/auth.middleware.js";

const router = express.Router();

// Doctor Registration Route
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("firstName")
      .isLength({ min: 3, max: 20 })
      .withMessage("First name must be between 3 to 20 characters"),
    body("lastName")
      .isLength({ min: 3, max: 20 })
      .withMessage("Last name must be between 3 to 20 characters"),
    body("phoneNumber")
      .isMobilePhone()
      .withMessage("Must be a valid mobile phone number"),
    body("specialization").notEmpty().withMessage("Specialization is required"),
    body("experience")
      .isInt({ min: 0 })
      .withMessage("Experience must be at least 1 year"),
    body("qualifications")
      .isArray({ min: 1 })
      .withMessage("At least one qualification is required"),
  ],
  registerDoctor
);

// Doctor Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  signInDoctor
);

// Get Doctor Profile (Protected Route)
router.get("/profile", authDoctor, getDoctorProfile);

router.put("/status", updateDoctorStatus);

router.get("/available", getAvailableDoctors);

export default router;
