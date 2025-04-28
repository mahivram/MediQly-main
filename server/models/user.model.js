import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

// Define User Schema
const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phoneNumber: { type: String, required: true },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Medical History
    medicalHistory: [
      {
        condition: String,
        diagnosisDate: Date,
        treatment: String,
      },
    ],

    // Emergency Contact
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },

    // Health Tracker: BMI & Symptoms
    healthTracker: {
      height: Number, // in cm
      weight: Number, // in kg
      bmi: Number, // calculated field
      symptoms: [
        {
          symptom: String,
          severity: { type: String, enum: ["Mild", "Moderate", "Severe"] },
          reportedAt: { type: Date, default: Date.now },
        },
      ],
      preventiveHealth: [
        {
          checkupType: String,
          lastChecked: Date,
          nextCheckup: Date,
        },
      ],
    },

    // Appointments
    appointments: [
      {
        doctorName: String,
        doctorId: mongoose.Schema.Types.ObjectId,
        specialty: String,
        dateTime: Date,
        status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"] },
      },
    ],

    // Insurance Details
    insurance: {
      policyNumber: String,
      provider: String,
      validTill: Date,
    },

    // Medications & Reminders
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        prescribedBy: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    medicineReminders: [
      {
        medicineName: String,
        time: String, // e.g., "08:00 AM"
        taken: { type: Boolean, default: false },
      },
    ],

    isOnline: { type: Boolean, default: false }, // Tracks if doctor is online
    lastActive: { type: Date, default: Date.now },

    // Chatbot Conversations (Stored in a Separate Collection but Referenced)
    chatbotSessions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ChatbotSession" },
    ],

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Middleware to update 'updatedAt' before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET_TOKEN, {
    expiresIn: "24h",
  });

  return token;
};
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};


export default mongoose.model("User", UserSchema);

// UserSchema.index({ location: "2dsphere" });