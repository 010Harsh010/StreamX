import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComment,
    getLikedtweet } from "../controllers/like.controller.js"

const router = Router();
router.use(verifyJWT)
router.route("/togglevideo/:videoId").post(toggleVideoLike)
router.route("/togglecomment/:commentId").post(toggleCommentLike)
router.route("/toggletweet/:tweetId").post(toggleTweetLike)
router.route("/getlikedvideo").get(getLikedVideos)
router.route("/getlikedcomments").get(getLikedComment)
router.route('/getlikedtweet').get(getLikedtweet)

export default router;