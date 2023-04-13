const express = require("express");
const gfs = require("./db/connection.js");
const mongoose = require('mongoose');
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { GridFsStorage } = require('multer-gridfs-storage');

require('dotenv').config();

const storage = new GridFsStorage({
    url: process.env.MONGO_URL,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const fileInfo = {
                filename: file.originalname,
                bucketName: 'images'
            };
            resolve(fileInfo);
        });
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const agencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const assetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    number_of_rooms: {
        type: Number,
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    agency: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    user_type: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: false
    },
    token_exp_date: {
        type: Number,
        required: false
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: fileFilter })
const router = express.Router();

const check_token = (token) => {
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        return decode;
    } catch (e) {
        return (false);
    }
}

router.post("/agency", upload.single("logo"), async (req, res) => {
    if (!req.body.token)
        res.send("Token is needed, try to login again").status(400);
    const auth = check_token(req.body.token)
    if (auth === false)
        res.send("Your token is invalid").status(400);
    console.log(auth)
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
    console.log(auth)
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


router.post("/register", async (req, res) => {
    if (req.body.user_type === "candidate" || req.body.user_type === "agent") {
        gfs.bucketName = "user";
        const userModel = mongoose.model('userSchema', userSchema);
        let returnvalue = 0;
        await userModel.findOne({ email: req.body.email })
            .then((doc) => {
                if (doc) {
                    res.status(400).send("Email is already used");
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
            res.send("Your account is created ! You need to login to have your token").status(200);
        });
    }
    else {
        res.status(400).send("Invalid user type, please select 'candidate' or 'agent'");
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
                res.status(400).send("Email is not found");
                returnvalue = 1;
            }
        })
    if (returnvalue === 1)
        return;
});

module.exports = router;
