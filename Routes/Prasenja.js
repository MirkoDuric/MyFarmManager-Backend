const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");
//Informacije o prethodnim prasenjima i broju prasadi

// GET - Dohvatiti sve prasenja uz paginaciju, filtriranje i sortiranje
app.get("/prasenja", (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;
  const filterPigId = req.query.pig_id || null;
  const sortOrder = req.query.sortOrder || "ASC";

  let query = "SELECT * FROM prasenja";
  const queryParams = [];

  if (filterPigId) {
    queryParams.push(filterPigId);
    query += " WHERE pig_id = $" + queryParams.length;
  }

  query +=
    " ORDER BY datum_prasenja " +
    (sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC");
  query +=
    " LIMIT $" +
    (queryParams.length + 1) +
    " OFFSET $" +
    (queryParams.length + 2);
  queryParams.push(limit, offset);

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results.rows);
  });
});

// POST - Dodati novo praseće uz validaciju
app.post(
  "/prasenja",
  [
    body("pig_id").isInt().withMessage("Pig ID mora biti broj."),
    body("datum_prasenja")
      .isDate()
      .withMessage("Datum mora biti ispravan datum."),
    body("broj_prasica").isInt().withMessage("Broj prasica mora biti broj."),
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
          console.error(err.message);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        res.json(results.rows[0]);
      }
    );
  }
);

// UPDATE - Ažurirati praseće
app.put("/prasenja/:id", (req, res) => {
  const { id } = req.params;
  const { pig_id, datum_prasenja, broj_prasica } = req.body;

  pool.query(
    "UPDATE prasenja SET pig_id = $1, datum_prasenja = $2, broj_prasica = $3 WHERE id = $4 RETURNING *",
    [pig_id, datum_prasenja, broj_prasica, id],
    (err, results) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(results.rows[0]);
    }
  );
});

// DELETE - Obrisati praseće
app.delete("/prasenja/:id", (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM prasenja WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json({ message: "Praseće je obrisano!" });
  });
});

module.exports = app;
