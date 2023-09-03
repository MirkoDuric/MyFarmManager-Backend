const express = require("express");
const app = express.Router();
const pool = require("../pool");
// Tabela ili lista vakcinacije koja pokazuje datum vakcinacije, ime vakcine i sledeci ciklus vakcinacije

app.post("/istorijaVakcinacije", (req, res) => {
  const { pig_id, naziv_vakcine, datum_primene } = req.body;
  pool.query(
    "INSERT INTO istorijaVakcinacije (pig_id, naziv_vakcine, datum_primene) VALUES ($1, $2, $3) RETURNING id;",
    [pig_id, naziv_vakcine, datum_primene],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Greška prilikom dodavanja vakcine." });
        return;
      }
      res.json({ success: true, id: results.rows[0].id });
    }
  );
});

//Prikaz svih vakcina
app.get("/istorijaVakcinacije", (req, res) => {
  pool.query(
    "SELECT istorijaVakcinacije.*, PigInfo.serijski_broj_svinje FROM istorijaVakcinacije JOIN PigInfo ON istorijaVakcinacije.pig_id = PigInfo.id;",
    [],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Greška prilikom dohvatanja podataka." });
        return;
      }
      res.json(results.rows);
    }
  );
});

// Prikaz svih vakcina za određenu svinju na osnovu pig_id
app.get("/istorijaVakcinacije/:pig_id", (req, res) => {
  const { pig_id } = req.params;
  pool.query(
    "SELECT * FROM istorijaVakcinacije WHERE pig_id = $1;",
    [pig_id],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Greška prilikom dohvatanja vakcina za svinju." });
        return;
      }
      res.json(results.rows);
    }
  );
});

// Ažuriranje vakcine na osnovu id
app.put("/istorijaVakcinacije/:id", (req, res) => {
  const { id } = req.params;
  const { pig_id, naziv_vakcine, datum_primene } = req.body;
  pool.query(
    "UPDATE istorijaVakcinacije SET pig_id = $1, naziv_vakcine = $2, datum_primene = $3 WHERE id = $4;",
    [pig_id, naziv_vakcine, datum_primene, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: "Greška prilikom ažuriranja vakcine." });
        return;
      }
      res.json({ success: true, message: "Vakcina je uspešno ažurirana." });
    }
  );
});

// Brisanje vakcine na osnovu id
app.delete("/istorijaVakcinacije/:id", (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM istorijaVakcinacije WHERE id = $1;", [id], (err) => {
    if (err) {
      res.status(500).json({ error: "Greška prilikom brisanja vakcine." });
      return;
    }
    res.json({ success: true, message: "Vakcina je uspešno obrisana." });
  });
});

module.exports = app;
