/** @format */

const router = require("express").Router();
const {
    createFourmPost,
    editForumPost,
    likeForumPost,

    getFilteredForumPosts,
    getAllForumPosts,
    getForumPostById,
} = require("../../controllers/forum");
const verifyToken = require("../../middlewares/verify-token");

router.post("/", verifyToken, createFourmPost);
router.get("/forum-posts", verifyToken, getAllForumPosts);

router.get("/filter/:category/:filter", verifyToken, getFilteredForumPosts);
router.get("/single/:forumPostId", verifyToken, getForumPostById);

router.put("/toggle-like/:forumPostId", verifyToken, likeForumPost);
router.put("/:forumPostId", verifyToken, editForumPost);

module.exports = router;
