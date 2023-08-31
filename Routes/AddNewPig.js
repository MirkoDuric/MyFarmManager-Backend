const express = require("express");
const app = express.Router();
const pool = require("../pool");

app.post("/dodajSvinju", (req, res) => {
  const {
    serijski_broj,
    rasa,
    tekst_podsjetnika,
    datumPodsjetnika,
    vakcine,
    nazivVakcine,
    datumVakcine,
  } = req.body;

  pool.query(
    "INSERT INTO PigInfo (serijski_broj_svinje, rasa_svinje) VALUES ($1, $2) RETURNING id;",
    [serijski_broj, rasa],
    (err, results) => {
      if (err) {
        console.error("Greška prilikom kreiranja svinje:", err.message);
        return res.status(500).json({ error: "Greška pri kreiranju svinje." });
      }

      const newlyCreatedId = results.rows[0].id;

      if (vakcine) {
        pool.query(
          "INSERT INTO vakcine (pig_id, naziv_vakcine, datum_primene) VALUES ($1, $2, $3);",
          [newlyCreatedId, nazivVakcine, datumVakcine],
          (err) => {
            if (err) {
              console.error("Greška prilikom dodavanja vakcine:", err.message);
              return res
                .status(500)
                .json({ error: "Greška pri dodavanju vakcine." });
            }
          }
        );
      }

      if (tekst_podsjetnika && datumPodsjetnika) {
        pool.query(
          "INSERT INTO podsjetnici (pig_id, tekst_podsjetnika, datumPodsjetnika) VALUES ($1, $2, $3);",
          [newlyCreatedId, tekst_podsjetnika, datumPodsjetnika],
          (err) => {
            if (err) {
              console.error(
                "Greška prilikom dodavanja podsjetnika:",
                err.message
              );
              return res
                .status(500)
                .json({ error: "Greška pri dodavanju podsjetnika." });
            }
          }
        );
      }

      res.json({ success: true, pigId: newlyCreatedId });
    }
  );
});

module.exports = app;
