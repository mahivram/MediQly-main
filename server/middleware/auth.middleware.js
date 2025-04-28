import userModel from "../models/user.model.js";
import doctorModel from "../models/doctor.model.js";
import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "unauthorized token" });
  }

  try {
    // const isBlackListed = await blacklistTokenModel.findOne({
    //   token,
    // });
    // console.log(token, isBlackListed, "2nd");

    // if (isBlackListed) {
    //   return res.status(401).json({ message: "unauthorized token" });
    // }
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    console.log(decoded, "decoded");

    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const authDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized token" });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    console.log(decoded, "hello");

    // Fetch Doctor
    const doctor = await doctorModel.findById(decoded._id);
    console.log(doctor, "hello");

    if (!doctor) {
      return res.status(401).json({ message: "Doctor not found" });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
