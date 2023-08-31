require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8001;
const bodyParser = require("body-parser");
const PigInfo = require("./Routes/PigInfo");
const AddNewPig = require("./Routes/AddNewPig");
app.use(bodyParser.json());
app.use("", PigInfo);
app.use("", AddNewPig);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
