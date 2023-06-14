/** @format */
const User = require("../models/user");
const Comment = require("../models/comment");
const Post = require("../models/post");
const ForumPost = require("../models/forum");
const UserActivity = require("../models/userActivity");

const createComment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        const user = await User.findById(userId);
        const post = await Post.findById(postId);

        post.comments.push(createComment._id);
        post.save();
        const comments = await Comment.find({
            post: createComment.post,
        }).populate("userInfo");

        const userActivity = await UserActivity.create({
            user_id: request.user.id,
            post_id: post._id,
            action: "comment",
            timestamp: new Date(),
        });

        return res.status(201).json(comments);
    } catch (e) {
        next(e);
    }
};
const createForumComment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const createComment = await Comment.create({
            ...req.body,
            user: req.user.id,
            post: req.params.postId,
            userInfo: user.userInfo,
        });

        post.comments.push(createComment._id);
        post.save();

        const comments = await Comment.find({ post: createComment.post })
            .sort({ createdAt: -1 })
            .populate("userInfo");
        return res.status(201).json(comments);
    } catch (e) {
        next(e);
    }
};
const getAllPostComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .sort({ createdAt: -1 })
            .populate("userInfo");

        return res.status(200).json(comments);
    } catch (e) {
        next(e);
    }
};
const getOneComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId).populate(
            "userInfo",
            "-password"
        );
        return res.status(200).json(comment);
    } catch (e) {
        next(e);
    }
};
const updateComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: "No comment found" });

        if (comment.user.toString() === req.user.id.toString()) {
            comment.commentText = req.body.commentText;
            await comment.save();
            return res.status(200).json(comment);
        } else {
            return res
                .status(403)
                .json({ msg: "You can update only your own comment" });
        }
    } catch (e) {
        next(e);
    }
};
const toggleCommentLike = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const comment = await Comment.findById(req.params.commentId);

        if (!comment.likes.includes(currentUserId)) {
            comment.likes.push(currentUserId);
            await Comment.save();
            return res
                .status(200)
                .json({ comment, msg: "comment has been successfully liked" });
        } else {
            comment.likes = comment.likes.filter((id) => id !== currentUserId);
            await comment.save();
            return res.status(200).json({
                comment,
                msg: "comment has been successfully unliked",
            });
        }
    } catch (e) {
        next(e);
    }
};
const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (comment.user.toString() === req.user.id) {
            await Comment.findByIdAndDelete(req.params.commentId);
            return res
                .status(200)
                .json({ msg: "Comment deleted successfully" });
        } else {
            return res
                .status(403)
                .json({ msg: "You can delete only your comment" });
        }
    } catch (e) {
        next(e);
    }
};

module.exports = {
    createComment,
    createForumComment,
    getAllPostComments,
    getOneComment,
    updateComment,
    toggleCommentLike,
    deleteComment,
};
