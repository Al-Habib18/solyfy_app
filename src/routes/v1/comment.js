/** @format */

const router = require("express").Router();
const {
    createComment,
    createForumComment,
    getAllPostComments,
    getOneComment,
    updateComment,
    toggleCommentLike,
    deleteComment,
} = require("../../controllers/comment");
const verifyToken = require("../../middlewares/verify-token");

router.get("/:post", verifyToken, getAllPostComments);
router.get("/find/:commentId", verifyToken, getOneComment);

router.post("/:postId", verifyToken, createComment);
router.post("/forum/:postId", verifyToken, createForumComment);

router.put("/:commentId", verifyToken, updateComment);
router.put("/toggle-like/:commentId", verifyToken, toggleCommentLike);

router.delete("/:commentId", verifyToken, deleteComment);
router.module.exports = router;
