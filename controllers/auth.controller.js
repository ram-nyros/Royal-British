const User = require("../models/User");
const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body.email, req.body.password);

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};
