import bcrypt from "bcrypt";
import UserModel from "../Models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID');

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ message: "User already exists, Login", success: false });
    }
    const userModel = new UserModel({ name, email });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    return res.status(201).json({
      message: "Signup Successful",
      success: true,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err?.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = "Auth failed email or password is wrong";
    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({ message: errorMsg, success: false });
    }
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err?.message,
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    
    let user = await UserModel.findOne({ email });
    if (!user) {
        user = new UserModel({ name, email, googleId });
        await user.save();
    } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
    }
    
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    return res.status(200).json({
      message: "Google Login Successful",
      success: true,
      jwtToken,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("Google Auth error:", err);
    return res.status(500).json({ message: "Google Auth Failed", success: false, error: err?.message });
  }
};