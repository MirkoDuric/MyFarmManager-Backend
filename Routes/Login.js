// Routes/Login.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../pool"); // povezivanje sa bazom
const app = express.Router();

// Rutu za login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Proveri da li korisnik postoji
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      console.log(result);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    console.log(user);

    // Provera lozinke
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Kreiraj JWT token
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;
