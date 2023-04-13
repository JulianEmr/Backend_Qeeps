const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const qeeps = require("./routes.js");

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json())

app.use("/qeeps", qeeps);

app.get('/', (req, res, next) => {
	res.send("Hello");
})

// Create a Server on port 3000
const server = app.listen(3000, function () {})
