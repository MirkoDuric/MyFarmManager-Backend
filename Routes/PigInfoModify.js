const express = require("express");
const app = express.Router();
const { body, validationResult } = require("express-validator");
const pool = require("../pool");
//U ovom fajlu pisem U D radnje prepravljam i brisem svinje i informacije.

//Brisanje svinje
app.delete("/obrisiSvinju/:id", (req, res) => {
  pool.query(
    "DELETE FROM PigInfo WHERE id = $1;",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error("Greška prilikom brisanja svinje:", err.message);
        console.log(err);
        return res.status(500).json({ error: "Greška pri brisanju svinje." });
      }
      if (results.rowCount === 0) {
        console.log(err);
        return res.status(404).json({ error: "Svinja nije pronađena." });
      }
      res.json({ success: true });
    }
  );
});

// update svinje
app.put(
  "/azurirajSvinju/:id",
  [
    body("serijski_broj").isInt().withMessage("Serijski broj mora biti broj."),
    body("rasa").isString().withMessage("Rasa mora biti tekstualni string."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serijski_broj, rasa } = req.body;

    pool.query(
      "UPDATE PigInfo SET serijski_broj_svinje = $1, rasa_svinje = $2 WHERE id = $3;",
      [serijski_broj, rasa, req.params.id],
      (err, results) => {
        if (err) {
          console.error("Greška prilikom ažuriranja svinje:", err.message);
          return res
            .status(500)
            .json({ error: "Greška pri ažuriranju svinje." });
        }
        if (results.rowCount === 0) {
          return res.status(404).json({ error: "Svinja nije pronađena." });
        }
        res.json({ success: true });
      }
    );
  }
);

module.exports = app;
