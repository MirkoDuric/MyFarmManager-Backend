const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

// Get all common diseases
app.get("/bolesti_svinja", (req, res) => {
  pool.query("SELECT * FROM bolesti_svinja;", (err, results) => {
    if (err) {
      console.error("Error fetching disease list:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results.rows);
  });
});

// Optional: Add a new disease (if the list needs to be modifiable)
app.post("/bolesti_svinja", [
  body("naziv").isString().withMessage("Disease name must be a string"),
  body("opis").isString().withMessage("Description must be a string"),
  body("tretman").optional().isString().withMessage("Treatment must be a string"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { naziv, opis, tretman } = req.body;

  pool.query(
    "INSERT INTO bolesti_svinja (naziv, opis, tretman) VALUES ($1, $2, $3) RETURNING *",
    [naziv, opis, tretman],
    (err, results) => {
      if (err) {
        console.error("Error adding disease:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json(results.rows[0]);
    }
  );
});

// Optional: Update a disease by ID
app.put("/bolesti_svinja/:id", [
  body("naziv").optional().isString().withMessage("Disease name must be a string"),
  body("opis").optional().isString().withMessage("Description must be a string"),
  body("tretman").optional().isString().withMessage("Treatment must be a string"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { naziv, opis, tretman } = req.body;
  const fields = [];
  const values = [];

  if (naziv) {
    fields.push("naziv");
    values.push(naziv);
  }
  if (opis) {
    fields.push("opis");
    values.push(opis);
  }
  if (tretman) {
    fields.push("tretman");
    values.push(tretman);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const query = `UPDATE bolesti_svinja SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

  pool.query(query, [...values, id], (err, results) => {
    if (err) {
      console.error("Error updating disease:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ error: "Disease not found" });
    }
    res.json(results.rows[0]);
  });
});

// Optional: Delete a disease by ID
app.delete("/bolesti_svinja/:id", (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM bolesti_svinja WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error deleting disease:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ error: "Disease not found" });
    }
    res.json({ message: "Disease deleted successfully" });
  });
});

module.exports = app;

