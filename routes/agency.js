const gfs = require("../db/connection.js");
const {userSchema, assetSchema, agencySchema} = require("../schema.js");
const {check_token, upload} = require("../routes.js");
const mongoose = require("mongoose");
const express = require("express");
const router = express();

router.post("/agency", upload.single("logo"), async (req, res) => {
    if (!req.body.token)
        res.status(400).json({message: "Token is needed, try to login again"});
    const auth = check_token(req.body.token)
    if (auth === false)
        res.status(400).json({message: "Your token is invalid"});
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
            res.status(200).json({message: "The agency is successfully created!"});
        }
        else {
            res.status(400).json({message: "You don't have permission to access this"});
        }
    })
});

// Route to get agency by id
router.get("/agency/:id", async (req, res) => {
    // Check if token is provided
    if (!req.body.token) {
        res.status(400).json({message: "Token is needed, try to login again"});
        return;
    }
    // Check if token is valid
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.status(400).json({message: "Your token is invalid"});
        return;
    }
    // Check if id in request parameters is valid
    if (req.params.id.length != 24) {
        res.status(400).json({message: "invalid id"});
        return;
    }
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            const agencyModel = mongoose.model('agencySchema', agencySchema);
            // Find agency by id
            const agency = await agencyModel.findById(req.params.id);
            res.status(200).json({message: agency})
        } else {
            res.status(400).json({message: "You are not authorized"})
        }
    })
});

// Route to get agencies
router.get("/agency", async (req, res) => {
    // Check if token is provided
    if (!req.body.token) {
        console.log("bouffon")
        res.status(400).json({message: "Token is needed, try to login again"});
        return;
    }
    // Check if token is valid
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.status(400).json({message: "Your token is invalid"});
        return;
    }
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            const agencyModel = mongoose.model('agencySchema', agencySchema);
            // Find agencies
            const agency = await agencyModel.find();
            res.status(200).json({message: agency})
        } else {
            res.status(400).json({message: "You are not authorized"});
        }
    })
});

module.exports = router;
