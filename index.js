import "./loadEnvironment.js";
import express from "express";
import mongodb from "mongodb";
import bodyParser from "body-parser";
import qeeps from "./routes.js";


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
