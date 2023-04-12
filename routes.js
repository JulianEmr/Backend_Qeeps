import express from "express";
import db from "./db/connection.js";
import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({storage: storage, limits: {fileSize: 100 * 1024 * 1024}, fileFilter: fileFilter})
const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  let collection = await db.collection("agency");
  let results = await collection.find({})
    .limit(50)
    .toArray();

  res.send(results).status(200);
});

router.post("/agency", async (req, res) => {
    let collection = await db.collection("agency");
    try {
        var newAgency = {name : req.body.name, logo: req.body.logo};
    } catch (err) {
        res.status(400);
    }
    let result = await collection.insertOne(newAgency);
    res.send(result).status(204);
});

router.post("/asset", upload.array("images", 10), async (req, res) => {
    await console.log(req.file);
    res.status(200);
    // let collection = await db.collection("asset");
    // try {
    //     console.log(req.body)
    //     var newAsset = {title: req.body.title, address: req.body.address, number_of_rooms: req.body.number_of_rooms, images: req.body.images}
    // } catch (err) {
    //     res.status(400);
    // }
    // let result = await collection.insertOne(newAsset);
    // res.send(result).status(204);
});

router.post("/user", async (req, res) => {
    let collection = await db.collection("user");
    try {
        var newUser = {email: req.body.email, password: req.body.password, user_type: req.body.user_type}
    } catch (err) {
        res.status(400);
    }
    let result = await collection.insertOne(newUser);
    res.send(result).status(204);
});

export default router;
