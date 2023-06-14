/** @format */
const User = require("../../models/");
const comment = require("../../models");

const router = require("express").Router();
const userRoutes = require("./user");
const authRoutes = require("./auth");
const postRoutes = require("./post");
const commentsRoutes = require("./comment");
const forumRoutes = require("./forum");

router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/post", postRoutes);
router.use("/comment", commentsRoutes);
router.use("/forum", forumRoutes);

module.exports = router;
