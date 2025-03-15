import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import {getallTweets,createTweet,getUserTweets,updateTweet,deleteTweet} from "../controllers/tweet.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router()

router.route("/tweet").post(verifyJWT,upload.single("file"),createTweet)
router.route("/get-tweet/:userid").get(getUserTweets)
router.route("/updatetweet/:tweetId").patch(verifyJWT,updateTweet)
router.route("/deletetweet/:tweetId").delete(verifyJWT,deleteTweet)
router.route("/getalltweets").get(getallTweets);
export default router