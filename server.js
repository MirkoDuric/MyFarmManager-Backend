require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8001;
const PigInfo = require("./Routes/PigInfo");
const AddNewPig = require("./Routes/AddNewPig");
const Prašenja = require("./Routes/Prasenja");
const BolestiSvinja = require("./Routes/Bolesti");
const IstorijaBolesti = require("./Routes/IstorijaBolesti");
const Vakcine = require("./Routes/Vakcine");
const IstorijaVakcinacije = require("./Routes/IstorijaVakcinacije");
const PigInfoModify = require("./Routes/PigInfoModify");
const Podsjetnici = require("./Routes/Podsjetnici");
const cors = require("cors");

app.use(express.json());

app.use(cors());

app.use("", PigInfo);
app.use("", AddNewPig);
app.use("", Prašenja);
app.use("", BolestiSvinja);
app.use("", IstorijaBolesti);
app.use("", Vakcine);
app.use("", IstorijaVakcinacije);
app.use("", PigInfoModify);
app.use("", Podsjetnici);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
