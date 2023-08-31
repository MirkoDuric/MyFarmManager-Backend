const express = require("express");
const app = express.Router();
const pool = require("../pool");
app.post("/dodajSvinju", (req, res) => {
  const serijski_broj = req.body.serijski_broj;
  const rasa = req.body.rasa;
  const podsjetnik = req.body.podsjetnik;
  const vakcine = req.body.vakcine;
  const nazivVakcine = req.body.nazivVakcine;
  const datumVakcine = req.body.datumVakcine;

  pool.query(
    "INSERT INTO PigInfo (serijski_broj_svinje, rasa_svinje, podsjetnik) VALUES ($1, $2, $3) RETURNING id;",
    [serijski_broj, rasa, podsjetnik],
    (err, results) => {
      if (err) {
        // handle error
        res.status(500).json({ error: "Greška pri kreiranju svinje." });
      } else {
        //u varijabli ispod cuvam id koji sam proslijedio sa RETURNING id
        const newlyCreatedId = results.rows[0].id;

        if (vakcine) {
          pool.query(
            "INSERT INTO vakcine (pig_id, vakcina, datum) VALUES ($1, $2, $3);",
            [newlyCreatedId, nazivVakcine, datumVakcine],
            (err, vakcineRezultati) => {
              if (err) {
                // handle error
                res
                  .status(500)
                  .json({ error: "Greška pri dodavanju vakcine." });
              } else {
                res.json({ success: true, pigId: newlyCreatedId });
              }
            }
          );
        } else {
          res.json({ success: true, pigId: newlyCreatedId });
        }
      }
    }
  );
});

module.exports = app;
