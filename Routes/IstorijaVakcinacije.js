const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

// Add a new vaccination record
app.post("/istorijaVakcinacije", [
  body("pig_id").isInt().withMessage("Pig ID must be a number"),
  body("naziv_vakcine").isString().withMessage("Vaccine name must be a string"),
  body("datum_primene").isISO8601().withMessage("Date must be in a valid ISO format"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pig_id, naziv_vakcine, datum_primene } = req.body;

  pool.query(
    "INSERT INTO istorijaVakcinacije (pig_id, naziv_vakcine, datum_primene) VALUES ($1, $2, $3) RETURNING *",
    [pig_id, naziv_vakcine, datum_primene],
    (err, results) => {
      if (err) {
        console.error("Error adding vaccination record:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json(results.rows[0]);
    }
  );
});

// Get all vaccination records for all pigs
app.get("/istorijaVakcinacije", (req, res) => {
  pool.query(
    "SELECT istorijaVakcinacije.*, PigInfo.serijski_broj_svinje FROM istorijaVakcinacije JOIN PigInfo ON istorijaVakcinacije.pig_id = PigInfo.id;",
    (err, results) => {
      if (err) {
        console.error("Error fetching vaccination records:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(results.rows);
    }
  );
});

// Get vaccination history for a specific pig by pig_id
app.get("/istorijaVakcinacije/:pig_id", (req, res) => {
  const { pig_id } = req.params;

  pool.query(
    "SELECT * FROM istorijaVakcinacije WHERE pig_id = $1",
    [pig_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching vaccination history for pig:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (results.rowCount === 0) {
        return res.status(404).json({ message: "No vaccination records found for this pig" });
      }
      res.json(results.rows);
    }
  );
});

// Update a vaccination record by ID
app.put("/istorijaVakcinacije/:id", [
  body("naziv_vakcine").optional().isString().withMessage("Vaccine name must be a string"),
  body("datum_primene").optional().isISO8601().withMessage("Date must be in a valid ISO format"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { naziv_vakcine, datum_primene } = req.body;
  const fields = [];
  const values = [];

  if (naziv_vakcine) {
    fields.push("naziv_vakcine");
    values.push(naziv_vakcine);
  }
  if (datum_primene) {
    fields.push("datum_primene");
    values.push(datum_primene);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const query = `UPDATE istorijaVakcinacije SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

  pool.query(query, [...values, id], (err, results) => {
    if (err) {
      console.error("Error updating vaccination record:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Vaccination record not found" });
    }
    res.json(results.rows[0]);
  });
});

// Delete a vaccination record by ID
app.delete("/istorijaVakcinacije/:id", (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM istorijaVakcinacije WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error deleting vaccination record:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Vaccination record not found" });
    }
    res.json({ message: "Vaccination record deleted successfully" });
  });
});

module.exports = app;
