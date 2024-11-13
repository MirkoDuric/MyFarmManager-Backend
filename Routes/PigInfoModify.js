const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

// Delete a pig record
app.delete("/obrisiSvinju/:id", (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM PigInfo WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error deleting pig:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ error: "Pig not found" });
    }
    res.json({ message: "Pig deleted successfully" });
  });
});

// Update pig information
app.put("/azurirajSvinju/:id", [
  body("serijski_broj").optional().isInt().withMessage("Serial number must be an integer"),
  body("rasa").optional().isString().withMessage("Breed must be a string"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { serijski_broj, rasa } = req.body;
  const fields = [];
  const values = [];

  if (serijski_broj !== undefined) {
    fields.push("serijski_broj_svinje");
    values.push(serijski_broj);
  }
  if (rasa !== undefined) {
    fields.push("rasa_svinje");
    values.push(rasa);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const query = `UPDATE PigInfo SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

  pool.query(query, [...values, id], (err, results) => {
    if (err) {
      console.error("Error updating pig:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ error: "Pig not found" });
    }
    res.json(results.rows[0]);
  });
});

module.exports = app;

