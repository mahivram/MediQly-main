import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

// Define Doctor Schema
const DoctorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    // Profile Details
    specialization: { type: String, required: true }, // Example: Cardiologist, Neurologist, etc.
    experience: { type: Number, required: true }, // Years of experience
    qualifications: [{ type: String, required: true }], // List of degrees/certifications

    // Availability & Appointments
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: String, // e.g., "09:00 AM"
        endTime: String, // e.g., "05:00 PM"
      },
    ],
    appointments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        dateTime: Date,
        status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"] },
        notes: String,
      },
    ],

    // Telemedicine Features
    videoCallLink: { type: String }, // Unique link for video call (e.g., Zoom, WebRTC)
    chatSessions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession" },
    ], // Chat with patients

    // Reviews & Ratings
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isOnline: { type: Boolean, default: false }, // Tracks if doctor is online
    lastActive: { type: Date, default: Date.now },

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Middleware to update 'updatedAt' field
DoctorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate Auth Token for Doctor
DoctorSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, role: "doctor" }, process.env.SECRET_TOKEN, {
    expiresIn: "24h",
  });
};

// Compare Password for Login
DoctorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
DoctorSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// DoctorSchema.index({ location: "2dsphere" });

export default mongoose.model("Doctor", DoctorSchema);

// Middleware to hash password before saving
// DoctorSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });
