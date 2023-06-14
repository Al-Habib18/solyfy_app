/** @format */

const express = require("express").Router();
const {
    register,
    logInWithEmailAndPassword,
    logout,
    updateUser,
} = require("../../controllers/auth");
const router = require("./user");

router.post("/register", register);
router.post("/login", logInWithEmailAndPassword);

router.put("/update-user", updateUser);
router.post("/logout", logout);

module.exports = router;
