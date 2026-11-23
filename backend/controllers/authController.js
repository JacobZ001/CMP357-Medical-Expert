const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

async function registerPatient(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await userModel.createUser(
      firstName,
      lastName,
      email,
      passwordHash,
      "patient",
    );

    return res.status(201).json({
      message: "Patient registered successfully!",
      userId: userId,
    });
  } catch (error) {
    console.error("Patient registration error:", error.message);

    return res.status(500).json({
      message: "An error occurred during registration.",
    });
  }
}

async function registerExpert(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      specialty,
      qualifications,
      bio,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !specialty ||
      !qualifications
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await userModel.createExpert(
      firstName,
      lastName,
      email,
      passwordHash,
      specialty,
      qualifications,
      bio,
    );

    return res.status(201).json({
      message: "Expert registered successfully!",
      userId: userId,
    });
  } catch (error) {
    console.error("Expert registration error:", error.message);

    return res.status(500).json({
      message: "An error occurred during expert registration.",
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    req.session.user = {
      userId: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      message: "Login successful!",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "An error occurred during login.",
    });
  }
}

async function getCurrentUser(req, res) {
  if (!req.session.user) {
    return res.status(401).json({
      message: "You are not logged in.",
    });
  }

  return res.status(200).json({
    user: req.session.user,
  });
}

module.exports = {
  registerPatient,
  registerExpert,
  loginUser,
  getCurrentUser,
};
