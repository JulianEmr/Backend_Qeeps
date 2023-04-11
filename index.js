const express = require('express');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
	res.send("Hello");
})

// Create a Server on port 3000
const server = app.listen(3000, function () {})
