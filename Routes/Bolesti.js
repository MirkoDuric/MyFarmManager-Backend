const express = require("express");
const app = express.Router();
const pool = require("../pool");
// Ovde pisem generalno o bolestima koje su ceste kod svinja sa opisom tretmana
pool.query("SELECT NOW ()").then((data) => console.log(data.rows));
module.exports = app;
