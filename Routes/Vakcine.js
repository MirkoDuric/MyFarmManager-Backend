const express = require("express");
const app = express.Router();
const pool = require("../pool");

// Fetch all vaccines
app.get("/listavakcina", (req, res) => {
  pool.query("SELECT * FROM listavakcina;", (err, results) => {
    if (err) {
      console.error("Error fetching vaccines:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results.rows);
  });
});

module.exports = app;
