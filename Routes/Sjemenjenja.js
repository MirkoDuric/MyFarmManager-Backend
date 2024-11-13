const express = require("express");
const app = express.Router();
const pool = require("../pool");

// Add insemination record
app.post("/insemination", (req, res) => {
  const { pig_id, date, notes } = req.body;
  pool.query(
    "INSERT INTO sjemenjenja (pig_id, date, notes) VALUES ($1, $2, $3) RETURNING *",
    [pig_id, date, notes],
    (err, results) => {
      if (err) {
        console.error("Error adding insemination record:", err.message);
        return res.status(500).json({ error: "Failed to add insemination record" });
      }
      res.json(results.rows[0]);
    }
  );
});

module.exports = app;
