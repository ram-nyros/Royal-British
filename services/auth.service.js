const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

exports.registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });

  if (existing) throw new Error("User already exists");

  const user = new User({ name, email, password });
  await user.save();

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) throw new Error("Invalid credentials");

  const ok = await user.comparePassword(password);

  if (!ok) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      certificates: user.certificates,
    },
    accessToken,
    refreshToken,
  };
};
