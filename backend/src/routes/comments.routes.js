import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {getVideoComments,addComment,deleteComment,updateComment} from "../controllers/comments.controller.js"

const router = Router()

router.route("/getcomments/:videoid").get(getVideoComments)
router.route("/addcomment/:videoid").post(verifyJWT,addComment)
router.route("/deletecomment/:commentId").delete(verifyJWT,deleteComment)
router.route("/updated-comment/:commentid").patch(verifyJWT,updateComment)

export default router
