const gfs = require("../db/connection.js");
const {userSchema, assetSchema, agencySchema} = require("../schema.js");
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

module.exports = router;
