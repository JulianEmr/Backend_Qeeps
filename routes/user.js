const gfs = require("../db/connection.js");
const {userSchema, assetSchema, agencySchema} = require("../schema.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express();

router.post("/register", async (req, res) => {
    if (req.body.user_type === "candidate" || req.body.user_type === "agent") {
        gfs.bucketName = "user";
        const userModel = mongoose.model('userSchema', userSchema);
        let returnvalue = 0;
        await userModel.findOne({ email: req.body.email })
            .then((doc) => {
                if (doc) {
                    res.status(400).json({message: "Email is already used"});
                    returnvalue = 1;
                }
            })
        if (returnvalue === 1)
            return;
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                console.error(err);
                return;
            }
            const newUser = new userModel({
                email: req.body.email,
                password: hash,
                user_type: req.body.user_type,
            });
            newUser.save();
            res.status(200).json({message: "Your account is created ! You need to login to have your token"});
        });
    }
    else {
        res.status(400).json({message: "Invalid user type, please select 'candidate' or 'agent'"});
    }
});

router.post("/login", async (req, res) => {
    gfs.bucketName = "user";
    let returnvalue;
    const userModel = mongoose.model('userSchema', userSchema);
    await userModel.findOne({ email: req.body.email })
        .then(async (doc) => {
            if (doc) {
                await bcrypt.compare(req.body.password, doc.password, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        if (result === true) {
                            // Password is correct
                            if (doc.token && doc.token_exp_date > new Date().getTime())
                                res.status(200).send('Password is correct, your token is ' + doc.token);
                            else {
                                let new_token = jwt.sign(doc._id.toString(), process.env.JWT_SECRET);
                                let new_token_exp_date = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
                                userModel.updateOne({ _id: doc._id }, { token: new_token, token_exp_date: new_token_exp_date });
                                res.status(200).send('Password is correct, your token is ' + new_token);
                            }
                        } else {
                            // Password is incorrect
                            res.status(400).send('Password is incorrect');
                            returnvalue = 1;
                        }
                    }
                });
            } else {
                res.status(400).json({message: "Email is not found"});
                returnvalue = 1;
            }
        })
    if (returnvalue === 1)
        return;
});

module.exports = router;
