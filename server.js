require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8001;
const PigInfo = require("./Routes/PigInfo");
const AddNewPig = require("./Routes/AddNewPig");
const Prašenja = require("./Routes/Prasenja");

app.use(express.json());

app.use("", PigInfo);
app.use("", AddNewPig);
app.use("", Prašenja);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
