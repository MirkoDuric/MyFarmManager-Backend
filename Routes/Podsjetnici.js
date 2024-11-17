const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

app.post(
  "/podsjetnici_za_svinje",
  [
    body("pig_id").isInt().withMessage("Pig ID must be a number"),
    body("tekst_podsjetnika")
      .notEmpty()
      .withMessage("Reminder text cannot be empty"),
    body("datumpodsjetnika")
      .isISO8601()
      .withMessage("Reminder date must be in ISO format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pig_id, tekst_podsjetnika, datumpodsjetnika } = req.body;

    try {
      // Insert new reminder into the database
      await pool.query(
        "INSERT INTO podsjetnici (pig_id, tekst_podsjetnika, datumpodsjetnika) VALUES ($1, $2, $3)",
        [pig_id, tekst_podsjetnika, datumpodsjetnika]
      );

      res.status(201).json({ message: "Reminder added successfully" });
    } catch (error) {
      console.error("Error adding new reminder:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Fetch all reminders
app.get("/podsjetnici_za_svinje", (req, res) => {
  pool
    .query(
      `SELECT 
      s.id AS svinja_id,
      s.serijski_broj_svinje,
      s.rasa_svinje,
      CASE WHEN p.pig_id IS NOT NULL THEN true ELSE false END AS has_podsjetnik,
      p.datumpodsjetnika,
      p.tekst_podsjetnika,
      p.id
    FROM piginfo s
    LEFT JOIN podsjetnici p ON s.id = p.pig_id
    WHERE p.pig_id IS NOT NULL;`
    )
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error("Error fetching reminders:", error.message);
      res.status(500).json({ error: error.message });
    });
});

// Delete a reminder
app.delete("/podsjetnici/:id", (req, res) => {
  pool
    .query("DELETE FROM podsjetnici WHERE id = $1", [req.params.id])
    .then(() => res.json({ message: "Reminder deleted." }))
    .catch((error) => {
      console.error("Error deleting reminder:", error.message);
      res.status(500).json({ error: error.message });
    });
});

// Update a reminder
app.put(
  "/podsjetnici/:id",
  [
    body("tekst_podsjetnika")
      .notEmpty()
      .withMessage("Reminder text cannot be empty"),
    body("datumpodsjetnika").isISO8601().withMessage("Invalid date format"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tekst_podsjetnika, datumpodsjetnika } = req.body;
    pool
      .query(
        "UPDATE podsjetnici SET tekst_podsjetnika = $1, datumpodsjetnika = $2 WHERE id = $3",
        [tekst_podsjetnika, datumpodsjetnika, req.params.id]
      )
      .then(() => res.json({ message: "Reminder updated." }))
      .catch((error) => {
        console.error("Error updating reminder:", error.message);
        res.status(500).json({ error: error.message });
      });
  }
);

module.exports = app;
