const multer = require("multer");
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

const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: fileFilter })

const check_token = (token) => {
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        return decode;
    } catch (e) {
        return (false);
    }
}

module.exports = {check_token, upload};