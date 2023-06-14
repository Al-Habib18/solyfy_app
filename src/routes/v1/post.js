/** @format */

const router = require("express").Router();
const {
    createPost,
    getUserPosts,
    getTimelinePosts,
    getOnePost,
    updatePost,
    deletePost,
    toggleLikePost,
} = require("../../controllers/post");
const verifyToken = require("../../middlewares/verify-token");

router.get("/find/user-posts/:id", verifyToken, getUserPosts);
router.get("/timeline/posts", verifyToken, getTimelinePosts);
router.get("/find/:id", verifyToken, getOnePost);

router.post("/", verifyToken, createPost);

router.put("/:id", verifyToken, updatePost);
router.put("/toggle-like/:id", toggleLikePost);

router.delete("/:id", verifyToken, deletePost);

module.exports = router;
