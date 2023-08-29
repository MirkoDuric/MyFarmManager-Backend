require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8001;
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
