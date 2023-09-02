const express = require("express");
const app = express.Router();
const pool = require("../pool");
// Ovde pisem istoriju bolesti svinja, koju bolest je prelezala i nacin lijecenja

app.post("/istorijabolesti", (req, res) => {
  const { pig_id, bolest_id, konzumirani_lijek, datum_primene, tok_bolesti } =
    req.body;

  pool.query(
    "INSERT INTO istorija_prelezanih_bolesti (pig_id, bolest_id, konzumirani_lijek, datum_primene, tok_bolesti) VALUES ($1, $2, $3, $4, $5) RETURNING id;",
    [pig_id, bolest_id, konzumirani_lijek, datum_primene, tok_bolesti],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
        return;
      }
      res.json({ success: true, id: results.rows[0].id });
    }
  );
});

app.get("/istorijabolesti/:pig_id", (req, res) => {
  const pig_id = req.params.pig_id;

  pool.query(
    "SELECT * FROM istorija_prelezanih_bolesti WHERE pig_id = $1;",
    [pig_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
        return;
      }
      res.json(results.rows);
    }
  );
});

app.put("/istorijabolesti/:id", (req, res) => {
  const id = req.params.id;
  const { konzumirani_lijek, datum_primene, tok_bolesti } = req.body;

  pool.query(
    "UPDATE istorija_prelezanih_bolesti SET konzumirani_lijek = $1, datum_primene = $2, tok_bolesti = $3 WHERE id = $4;",
    [konzumirani_lijek, datum_primene, tok_bolesti, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
        return;
      }
      res.json({ success: true });
    }
  );
});

app.delete("/istorijabolesti/:id", (req, res) => {
  const id = req.params.id;

  pool.query(
    "DELETE FROM istorija_prelezanih_bolesti WHERE id = $1;",
    [id],
    (err) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
        return;
      }
      res.json({ success: true });
    }
  );
});

module.exports = app;
