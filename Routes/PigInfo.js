const express = require("express");
const app = express.Router();
const pool = require("../pool");
// U ovom fajlu vracam informacije o svinjama

// ovde vracam listu svih svinja u listi po 20
app.get("/piginfo/piglist", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  pool.query(
    "SELECT * FROM PigInfo LIMIT $1 OFFSET $2;",
    [limit, offset],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(results.rows);
    }
  );
});

module.exports = app;
