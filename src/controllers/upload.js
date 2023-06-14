/** @format */

const uploadcontrller = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.filename);
    },
});

const upload = multer({
    storage: storage,
});

uploadcontrller.post(
    "/image",
    upload.single("image"),
    async (req, res, next) => {
        try {
            return res.status(200).json({ msg: "image uploaded successfully" });
        } catch (e) {
            next(e);
            console.log(e);
        }
    }
);

module.exports = uploadcontrller;
