const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

app.post(
  "/dodajSvinju",
  [
    body("serijski_broj").isInt().withMessage("Serijski broj mora biti broj."),
    body("rasa").isString().withMessage("Rasa mora biti tekstualni string."),
    body("tekst_podsjetnika")
      .optional()
      .isString()
      .withMessage("Tekst podsjetnika mora biti tekstualni string."),
    body("datumPodsjetnika")
      .optional()
      .isDate()
      .withMessage("Datum podsjetnika mora biti ispravan datum."),
    body("vakcine")
      .optional()
      .isBoolean()
      .withMessage("Vakcine moraju biti boolean vrednost."),
    body("nazivVakcine")
      .optional()
      .isString()
      .withMessage("Naziv vakcine mora biti tekstualni string."),
    body("datumVakcine")
      .optional()
      .isDate()
      .withMessage("Datum vakcine mora biti ispravan datum."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
          return res
            .status(500)
            .json({ error: "Greška pri kreiranju svinje." });
        }

        const newlyCreatedId = results.rows[0].id;

        if (vakcine) {
          pool.query(
            "INSERT INTO istorijaVakcinacije (pig_id, naziv_vakcine, datum_primene) VALUES ($1, $2, $3);",
            [newlyCreatedId, nazivVakcine, datumVakcine],
            (err) => {
              if (err) {
                console.error(
                  "Greška prilikom dodavanja vakcine:",
                  err.message
                );
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
  }
);

module.exports = app;
