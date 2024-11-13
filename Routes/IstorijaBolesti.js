const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

// Add a new disease history record
app.post("/istorijabolesti", [
  body("pig_id").isInt().withMessage("Pig ID must be a number"),
  body("bolest_id").isInt().withMessage("Disease ID must be a number"),
  body("konzumirani_lijek").isString().withMessage("Medication must be a string"),
  body("datum_primene").isISO8601().withMessage("Date must be in ISO format"),
  body("tok_bolesti").isString().withMessage("Course of disease must be a string"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pig_id, bolest_id, konzumirani_lijek, datum_primene, tok_bolesti } = req.body;

  pool.query(
    "INSERT INTO istorija_prelezanih_bolesti (pig_id, bolest_id, konzumirani_lijek, datum_primene, tok_bolesti) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [pig_id, bolest_id, konzumirani_lijek, datum_primene, tok_bolesti],
    (err, results) => {
      if (err) {
        console.error("Error adding disease record:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json(results.rows[0]);
    }
  );
});

// Get all disease history records for all pigs
app.get("/istorijabolesti", (req, res) => {
  pool.query(
    "SELECT istorija_prelezanih_bolesti.*, PigInfo.serijski_broj_svinje FROM istorija_prelezanih_bolesti JOIN PigInfo ON istorija_prelezanih_bolesti.pig_id = PigInfo.id;",
    (err, results) => {
      if (err) {
        console.error("Error fetching disease records:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(results.rows);
    }
  );
});

// Get disease history for a specific pig by pig_id
app.get("/istorijabolesti/:pig_id", (req, res) => {
  const { pig_id } = req.params;

  pool.query(
    "SELECT * FROM istorija_prelezanih_bolesti WHERE pig_id = $1",
    [pig_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching disease history for pig:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (results.rowCount === 0) {
        return res.status(404).json({ message: "No disease records found for this pig" });
      }
      res.json(results.rows);
    }
  );
});

// Update a disease history record by ID
app.put("/istorijabolesti/:id", [
  body("konzumirani_lijek").optional().isString().withMessage("Medication must be a string"),
  body("datum_primene").optional().isISO8601().withMessage("Date must be in ISO format"),
  body("tok_bolesti").optional().isString().withMessage("Course of disease must be a string"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { konzumirani_lijek, datum_primene, tok_bolesti } = req.body;
  const fields = [];
  const values = [];

  if (konzumirani_lijek) {
    fields.push("konzumirani_lijek");
    values.push(konzumirani_lijek);
  }
  if (datum_primene) {
    fields.push("datum_primene");
    values.push(datum_primene);
  }
  if (tok_bolesti) {
    fields.push("tok_bolesti");
    values.push(tok_bolesti);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const query = `UPDATE istorija_prelezanih_bolesti SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

  pool.query(query, [...values, id], (err, results) => {
    if (err) {
      console.error("Error updating disease record:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Disease record not found" });
    }
    res.json(results.rows[0]);
  });
});

// Delete a disease history record by ID
app.delete("/istorijabolesti/:id", (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM istorija_prelezanih_bolesti WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error deleting disease record:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Disease record not found" });
    }
    res.json({ message: "Disease record deleted successfully" });
  });
});

module.exports = app;
