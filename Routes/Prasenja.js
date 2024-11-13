const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

// Get all breeding records with pagination and optional filtering by pig_id
app.get("/prasenja", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const filterPigId = req.query.pig_id || null;
  const sortOrder = req.query.sortOrder || "ASC";

  let query = "SELECT * FROM prasenja";
  const queryParams = [];

  if (filterPigId) {
    queryParams.push(filterPigId);
    query += " WHERE pig_id = $" + queryParams.length;
  }

  query += ` ORDER BY datum_prasenja ${sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"}`;
  query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
  queryParams.push(limit, offset);

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching breeding records:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results.rows);
  });
});

// Add a new breeding record with validation
app.post(
  "/prasenja",
  [
    body("pig_id").isInt().withMessage("Pig ID must be a number"),
    body("datum_prasenja").isISO8601().withMessage("Date must be in a valid format"),
    body("broj_prasica").isInt().withMessage("Number of piglets must be a number"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pig_id, datum_prasenja, broj_prasica } = req.body;

    pool.query(
      "INSERT INTO prasenja (pig_id, datum_prasenja, broj_prasica) VALUES ($1, $2, $3) RETURNING *",
      [pig_id, datum_prasenja, broj_prasica],
      (err, results) => {
        if (err) {
          console.error("Error adding breeding record:", err.message);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(201).json(results.rows[0]);
      }
    );
  }
);

// Update a breeding record with validation
app.put(
  "/prasenja/:id",
  [
    body("pig_id").optional().isInt().withMessage("Pig ID must be a number"),
    body("datum_prasenja").optional().isISO8601().withMessage("Date must be in a valid format"),
    body("broj_prasica").optional().isInt().withMessage("Number of piglets must be a number"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { pig_id, datum_prasenja, broj_prasica } = req.body;
    const fields = [];
    const values = [];

    if (pig_id !== undefined) {
      fields.push("pig_id");
      values.push(pig_id);
    }
    if (datum_prasenja !== undefined) {
      fields.push("datum_prasenja");
      values.push(datum_prasenja);
    }
    if (broj_prasica !== undefined) {
      fields.push("broj_prasica");
      values.push(broj_prasica);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const query = `UPDATE prasenja SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

    pool.query(query, [...values, id], (err, results) => {
      if (err) {
        console.error("Error updating breeding record:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (results.rowCount === 0) {
        return res.status(404).json({ error: "Breeding record not found" });
      }
      res.json(results.rows[0]);
    });
  }
);

// Delete a breeding record
app.delete("/prasenja/:id", (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM prasenja WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error deleting breeding record:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ error: "Breeding record not found" });
    }
    res.json({ message: "Breeding record deleted successfully" });
  });
});

module.exports = app;
