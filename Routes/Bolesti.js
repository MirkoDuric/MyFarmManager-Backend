const express = require("express");
const app = express.Router();
const pool = require("../pool");
// Ovde pisem generalno o bolestima koje su ceste kod svinja sa opisom tretmana
app.get("/bolesti_svinja", (req, res) => {
  pool.query("SELECT * FROM bolesti_svinja;", (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results.rows);
  });
});
module.exports = app;
