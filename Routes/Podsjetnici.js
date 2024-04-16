const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

app.get("/podsjetnici_za_svinje", (req, res) => {
  pool
    .query(
      `
      SELECT 
      s.id AS svinja_id,
      s.serijski_broj_svinje,
      s.rasa_svinje,
      CASE 
          WHEN p.pig_id IS NOT NULL THEN true 
          ELSE false 
      END AS has_podsjetnik,
      p.datumpodsjetnika,
      p.tekst_podsjetnika,
      P.id
    FROM piginfo s
    LEFT JOIN podsjetnici p ON s.id = p.pig_id
    WHERE p.pig_id IS NOT NULL;`
    )
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
      console.log(error);
    });
});

app.delete("/podsjetnici/:id", (req, res) => {
  pool
    .query("DELETE FROM podsjetnici WHERE id = $1", [req.params.id])
    .then(() => {
      res.json({ message: "Podsjetnik obrisan." });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error.message });
    });
});

app.put("/podsjetnici/:id", (req, res) => {
  const { tekst_podsjetnika, datumpodsjetnika } = req.body;
  pool
    .query(
      "UPDATE podsjetnici SET tekst_podsjetnika = $1, datumpodsjetnika = $2 WHERE id = $3",
      [tekst_podsjetnika, datumpodsjetnika, req.params.id]
    )
    .then(() => res.json({ message: "Podsjetnik ažuriran." }))
    .catch((error) => res.status(500).json({ error: error.message }));
});

app.post("/dodajPodsjetnik/:id", (req, res) => {
  const { tekst_podsjetnika, datumpodsjetnika } = req.body;
  pool
    .query(
      "INSERT INTO podsjetnici (pig_id,datumpodsjetnika,tekst_podsjetnika) VALUES ($1, $2, $3)",
      [req.params.id, tekst_podsjetnika, datumpodsjetnika]
    )
    .then(() => res.json({ message: "Podsjetnik stvoren." }))
    .catch((error) => res.status(500).json({ error: error.message }));
});

module.exports = app;
