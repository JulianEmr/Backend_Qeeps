const gfs = require("../db/connection.js");
const { userSchema, assetSchema, agencySchema, applicationSchema } = require("../schema.js");
const { check_token, upload } = require("../routes.js");
const express = require("express");
const mongoose = require("mongoose");
const router = express();

router.post("/application", async (req, res) => {
    if (!req.body.token) {
        res.status(400).json({message : "Token is needed, try to login again"});
        return;
    }
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.status(400).json({message : "Your token is invalid"});
        return;
    }
    gfs.bucketName = "user";
    let user_id;
    let asset_id;
    let return_value = 0;
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (!doc || doc.user_type != "agent")
            res.status(400).json({message : "You don't have permission to access this"})
    })
    await userModel.findOne({ email: req.body.user }).then((doc) => {
        if (!doc) {
            res.status(400).json({message : "Invalid user email"});
            return_value = 1;
        }
        else
            user_id = doc._id
    })
    if (return_value == 1)
        return;
    if (req.body.asset.length != 24) {
        res.status(400).json({message : "Invalid asset id"})
        return;
    }
    await mongoose.model('assetSchema', assetSchema).findById(mongoose.Types.ObjectId.createFromHexString(req.body.asset)).then((doc) => {
        if (!doc) {
            res.status(400).json({message : "Invalid asset id"})
            return_value = 1;
        }
        else
            asset_id = doc._id
    })
    if (return_value == 1)
        return;
    gfs.bucketName = "application";
    const applicationModel = mongoose.model('applicationSchema', applicationSchema);
    await applicationModel.findOneAndUpdate({ user: user_id, asset: asset_id }, { $set: { email: user_id, asset: asset_id } }, { upsert: true, returnNewDocument: true })
    res.status(200).json({message : "The application is successfully created!"});
});

// Route to get application by id
router.get("/application/:id", async (req, res) => {
    // Check if token is provided
    if (!req.body.token) {
        res.status(400).json({message : "Token is needed, try to login again"});
        return;
    }
    // Check if token is valid
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.status(400).json({message : "Your token is invalid"});
        return;
    }
    // Check if id in request parameters is valid
    if (req.params.id.length != 24) {
        res.status(400).json({message : "invalid id"});
        return;
    }
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            const applicationModel = mongoose.model('applicationSchema', applicationSchema);
            // Find application by id
            const application = await applicationModel.findById(req.params.id);
            res.status(200).send(application);
        } else {
            res.status(400).json({message : "You are not authorized"})
        }
    })
});

// Route to get applications
router.get("/application", async (req, res) => {
    // Check if token is provided
    if (!req.body.token) {
        res.status(400).json({message : "Token is needed, try to login again"});
        return;
    }
    // Check if token is valid
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.status(400).json({message : "Your token is invalid"});
        return;
    }
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            const applicationModel = mongoose.model('applicationSchema', applicationSchema);
            // Find applications
            const application = await applicationModel.find();
            res.status(200).send(application)
        } else {
            res.status(400).json({message : "You are not authorized"})
        }
    })
});
module.exports = router;