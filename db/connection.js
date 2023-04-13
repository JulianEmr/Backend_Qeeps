require('dotenv').config();
const mongoose = require("mongoose");
const connectionString = process.env.MONGO_URL || "";
const Grid = require('gridfs-stream');
mongoose.connect(connectionString);

const db = mongoose.connection.useDb("qeeps_test");
db.once('open', () => {
    const gfs = Grid(db.db, mongoose.mongo);
    module.exports = gfs;
});
