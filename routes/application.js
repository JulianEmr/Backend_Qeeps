const gfs = require("../db/connection.js");
const { userSchema, assetSchema, agencySchema, applicationSchema } = require("../schema.js");
const { check_token, upload } = require("../routes.js");
const express = require("express");
const mongoose = require("mongoose");
const router = express();

router.post("/application", async (req, res) => {
    if (!req.body.token) {
        res.send("Token is needed, try to login again").status(400);
        return;
    }
    const auth = check_token(req.body.token)
    if (auth === false) {
        res.send("Your token is invalid").status(400);
        return;
    }
    gfs.bucketName = "user";
    let user_id;
    let asset_id;
    let return_value = 0;
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (!doc || doc.user_type != "agent")
            res.send("You don't have permission to access this").status(400)
    })
    await userModel.findOne({ email: req.body.user }).then((doc) => {
        if (!doc) {
            res.send("Invalid user email").status(400);
            return_value = 1;
        }
        else
            user_id = doc._id
    })
    if (return_value == 1)
        return;
    if (req.body.asset.length != 24) {
        res.send("Invalid asset id").status(400)
        return;
    }
    await mongoose.model('assetSchema', assetSchema).findById(mongoose.Types.ObjectId.createFromHexString(req.body.asset)).then((doc) => {
        if (!doc) {
            res.send("Invalid asset id").status(400)
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
    res.send("The application is successfully created!").status(200);
});

// Route to get application by id
router.get("/application/:id", async (req, res) => {
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
            const applicationModel = mongoose.model('applicationSchema', applicationSchema);
            // Find application by id
            const application = await applicationModel.findById(req.params.id);
            res.send(application).status(200)
        } else {
            res.send("You are not authorized").status(400)
        }
    })
});

// Route to get applications
router.get("/application", async (req, res) => {
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
            const applicationModel = mongoose.model('applicationSchema', applicationSchema);
            // Find applications
            const application = await applicationModel.find();
            res.send(application).status(200)
        } else {
            res.send("You are not authorized").status(400)
        }
    })
});


module.exports = router;