const express = require("express");
const app = express.Router();
const pool = require("../pool");

// Get paginated list of pigs, with optional filtering by serial number or breed
app.get("/piginfo/piglist", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20; // Default limit of 20 pigs per page
  const offset = (page - 1) * limit;
  const { serijski_broj, rasa } = req.query; // Optional query parameters for filtering

  let query = "SELECT * FROM PigInfo";
  const queryParams = [];

  // Add filtering conditions if query parameters are provided
  if (serijski_broj) {
    queryParams.push(serijski_broj);
    query += ` WHERE serijski_broj_svinje = $${queryParams.length}`;
  }

  if (rasa) {
    queryParams.push(rasa);
    query += queryParams.length === 1 ? ` WHERE rasa_svinje = $${queryParams.length}` : ` AND rasa_svinje = $${queryParams.length}`;
  }

  // Add sorting and pagination
  query += ` ORDER BY id LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
  queryParams.push(limit, offset);

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching pig list:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({
      page,
      limit,
      total: results.rowCount,
      pigs: results.rows,
    });
  });
});

module.exports = app;

