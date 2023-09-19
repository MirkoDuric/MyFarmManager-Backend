const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express.Router();
const pool = require("../pool");

app.get("/podsjetnici_za_svinje", (req, res) => {
  pool
    .query(
      `
      SELECT 
      s.id AS id,
      CASE 
          WHEN p.pig_id IS NOT NULL THEN true 
          ELSE false 
      END AS has_podsjetnik
  FROM piginfo s
  LEFT JOIN podsjetnici p ON s.id = p.pig_id
  WHERE 
      CASE 
          WHEN p.pig_id IS NOT NULL THEN true 
          ELSE false 
      END = true;
  
    `
    )
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
      console.log(error);
    });
});

module.exports = app;
