const gfs = require("../db/connection.js");
const { userSchema, assetSchema, agencySchema, applicationSchema } = require("../schema.js");
const { check_token, upload } = require("../routes.js");
const express = require("express");
const mongoose = require("mongoose");
const router = express();

// Route to create a new asset
router.post("/asset", upload.array("images", 10), async (req, res) => {
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
            let agencyId;
            gfs.bucketName = "agency";
            const agencyModel = mongoose.model('agencySchema', agencySchema);
            // Find agency by name in request body
            await agencyModel.findOne({ name: req.body.agency })
                .then((doc) => {
                    if (doc) {
                        agencyId = doc._id;
                    } else {
                        res.status(400).send("Agency not found");
                    }
                })
            if (!agencyId)
                return;
            gfs.bucketName = "asset";
            const assetModel = mongoose.model('assetSchema', assetSchema);
            // Create a new asset with request body parameters
            const newAsset = new assetModel({
                title: req.body.title,
                address: req.body.address,
                number_of_rooms: req.body.number_of_rooms,
                images: req.files.id,
                agency: agencyId
            });
            // Save the new asset to the database
            newAsset.save();
            res.send("The asset is successfully created!").status(200);
        }
    })
});

// Route to get asset by id
router.get("/asset/:id", async (req, res) => {
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
            const assetModel = mongoose.model('assetSchema', assetSchema);
            // Find asset by id
            const asset = await assetModel.findById(req.params.id);
            res.send(asset).status(200)
        } else {
            res.send("You are not authorized").status(400)
        }
    })
});

// Route to get all assets
router.get("/asset", async (req, res) => {
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
    let assets = [];
    gfs.bucketName = "user";
    const userModel = mongoose.model('userSchema', userSchema);
    // Find user by ID
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            const assetModel = mongoose.model('assetSchema', assetSchema);
            // Get all assets if the user is an agent
            assets = await assetModel.find();
            res.send(assets).status(200)
        } else {
            const applicationModel = mongoose.model('applicationSchema', applicationSchema);
            // Check the applications the user previously subscribed to
            const applications = await applicationModel.find({ user: doc._id });
            const assetModel = mongoose.model('assetSchema', assetSchema);
            // Get assets associated with applications
            for (const element of applications) {
                assets.push(await assetModel.findById(element.asset));
            }
        }
    })
    // Send the assets as response
    res.send(assets).status(200);
})

// Route to delete an asset
router.delete("/asset/:id", async (req, res) => {
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
    // Find user by ID
    await userModel.findById(auth).then(async (doc) => {
        // Check if user is an agent
        if (doc.user_type === "agent") {
            const assetModel = mongoose.model('assetSchema', assetSchema);
            // Delete the asset
            const deleted = await assetModel.findByIdAndDelete(req.params.id);
            if (deleted)
                res.send("The asset is successfully deleted").status(200)
            else
                res.send("There was nothing to delete").status(200)
        } else {
            res.send("You are not authorized").status(400)
        }
    })
})

module.exports = router;
