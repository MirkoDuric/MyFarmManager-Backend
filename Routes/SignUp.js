// Routes/Register.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const pool = require("../pool");
const app = express.Router();

// User registration
app.post("/signup", [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("email").isEmail().withMessage("Must be a valid email")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, password, email } = req.body;
  try {
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(userQuery, [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const insertQuery = "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)";
    await pool.query(insertQuery, [username, hashedPassword, email]);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;