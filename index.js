const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const agency = require("./routes/agency.js");
const asset = require("./routes/asset.js");
const user = require("./routes/user.js");

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json())

app.use(agency, user, asset);

// Create a Server on port 3000
const server = app.listen(3000, function () {})
