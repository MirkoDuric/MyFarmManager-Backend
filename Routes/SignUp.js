// Routes/Register.js
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../pool"); // Povezivanje sa bazom
const app = express.Router();

// Rutu za registraciju korisnika
app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Provera da li korisnik već postoji u bazi
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hashovanje lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Ubacivanje novog korisnika u bazu
    const insertQuery =
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)";
    await pool.query(insertQuery, [username, hashedPassword, email]);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;
