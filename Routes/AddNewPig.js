const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

// Add a new pig with optional reminder and vaccination
app.post("/dodajSvinju", [
  body("serijski_broj").isInt().withMessage("Serial number must be a number"),
  body("rasa").isString().withMessage("Breed must be a string"),
  body("tekst_podsjetnika").optional().isString().withMessage("Reminder text must be a string"),
  body("datumPodsjetnika").optional().isISO8601().withMessage("Reminder date must be in ISO format"),
  body("vakcine").optional().isBoolean().withMessage("Vaccine flag must be a boolean"),
  body("nazivVakcine").optional().isString().withMessage("Vaccine name must be a string"),
  body("datumVakcine").optional().isISO8601().withMessage("Vaccine date must be in ISO format"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { serijski_broj, rasa, tekst_podsjetnika, datumPodsjetnika, vakcine, nazivVakcine, datumVakcine } = req.body;

  try {
    // Insert new pig into PigInfo table
    const pigResult = await pool.query(
      "INSERT INTO PigInfo (serijski_broj_svinje, rasa_svinje) VALUES ($1, $2) RETURNING id",
      [serijski_broj, rasa]
    );
    const newPigId = pigResult.rows[0].id;

    // Insert optional reminder if provided
    if (tekst_podsjetnika && datumPodsjetnika) {
      await pool.query(
        "INSERT INTO podsjetnici (pig_id, tekst_podsjetnika, datumPodsjetnika) VALUES ($1, $2, $3)",
        [newPigId, tekst_podsjetnika, datumPodsjetnika]
      );
    }

    // Insert optional vaccination record if provided
    if (vakcine && nazivVakcine && datumVakcine) {
      await pool.query(
        "INSERT INTO istorijaVakcinacije (pig_id, naziv_vakcine, datum_primene) VALUES ($1, $2, $3)",
        [newPigId, nazivVakcine, datumVakcine]
      );
    }

    res.status(201).json({ message: "Pig added successfully", pigId: newPigId });
  } catch (error) {
    console.error("Error adding new pig:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
