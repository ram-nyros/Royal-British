const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    return res.status(201).json(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body.email, req.body.password);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};

exports.logout = (_req, res) => {
  return res.json({ message: "Logged out" });
};
