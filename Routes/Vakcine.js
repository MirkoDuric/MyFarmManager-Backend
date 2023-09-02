const express = require("express");
const app = express.Router();
const pool = require("../pool");
// Ovde su sacuvane sve vakcine koje svinje mogu primiti sa osnovnim podacima o njima

app.get("/listavakcina", (req, res) => {
  pool.query("SELECT * FROM listavakcina;", (err, results) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log(err);
      return;
    }
    res.json(results.rows);
  });
});

module.exports = app;
