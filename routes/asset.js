const gfs = require("../db/connection.js");
const {userSchema, assetSchema, agencySchema} = require("../schema.js");
const {check_token, upload} = require("../routes.js");
const express = require("express");
const mongoose = require("mongoose");
const router = express();

router.post("/asset", upload.array("images", 10), async (req, res) => {
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
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findById(auth).then(async (doc) => {
        if (doc.user_type === "agent") {
            gfs.bucketName = "asset";
            let agencyId;
            const agencyModel = mongoose.model('agencySchema', agencySchema);
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
            const assetModel = mongoose.model('assetSchema', assetSchema);
            const newAsset = new assetModel({
                title: req.body.title,
                address: req.body.address,
                number_of_rooms: req.body.number_of_rooms,
                images: req.files.id,
                agency: agencyId
            });
            newAsset.save();
            res.send("The asset is successfully created!").status(200);
    }})
});

module.exports = router;