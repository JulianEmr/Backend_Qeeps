const gfs = require("../db/connection.js");
const {userSchema, agencySchema, assetSchema} = require("../schema.js");
const {check_token, upload} = require("../routes.js");
const mongoose = require("mongoose");
const express = require("express");
const router = express();

router.post("/agency", upload.single("logo"), async (req, res) => {
    if (!req.body.token)
        res.send("Token is needed, try to login again").status(400);
    const auth = check_token(req.body.token)
    if (auth === false)
        res.send("Your token is invalid").status(400);
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then((doc) => {
        if (doc.user_type === "agent") {
            gfs.bucketName = "agency";
            const agencyModel = mongoose.model('agencySchema', agencySchema);
            const newAgency = new agencyModel({
                name: req.body.name,
                logo: req.file.id,
            });
            newAgency.save();
            res.send("The agency is successfully created!").status(200);
        }
        else {
            res.send("You don't have permission to access this")
        }
    })
});

// Route to get agency by id
router.get("/agency/:id", async (req, res) => {
    // Check if token is provided
    if (!req.body.token) {
        res.send("Token is needed, try to login again").status(400);
        return;
    }
    // Check if token is valid
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.send("Your token is invalid").status(400);
        return;
    }
    // Check if id in request parameters is valid
    if (req.params.id.length != 24) {
        res.send("invalid id").status(400);
        return;
    }
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            const agencyModel = mongoose.model('agencySchema', agencySchema);
            // Find agency by id
            const agency = await agencyModel.findById(req.params.id);
            res.send(agency).status(200)
        } else {
            res.send("You are not authorized").status(400)
        }
    })
});

// Route to get agencies
router.get("/agency", async (req, res) => {
    // Check if token is provided
    if (!req.body.token) {
        res.send("Token is needed, try to login again").status(400);
        return;
    }
    // Check if token is valid
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.send("Your token is invalid").status(400);
        return;
    }
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            const agencyModel = mongoose.model('agencySchema', agencySchema);
            // Find agencies
            const agency = await agencyModel.find();
            res.send(agency).status(200)
        } else {
            res.send("You are not authorized").status(400)
        }
    })
});

module.exports = router;
