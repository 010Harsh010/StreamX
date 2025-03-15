import {Router} from "express"
import {verifyEmail,sendmessage,logingoogle,setrefreshtoken,havetoken,getuserprofile,deleteHistoryVideo,deleteAllHistory,editdescription, loginUser,addwatchhistory, logoutUser, registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js"
import { upload } from "../middleware/multer.middleware.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router()

router.route("/register").post(  
    upload.fields([
        {
           name: "avatar",
           maxCount: 1
        },
        {           
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);
router.route("/user-profile/:username").get(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);
router.route("/add-watch-history/:video").post(verifyJWT,addwatchhistory);
router.route("/editdescription").post(verifyJWT,editdescription);
router.route("/delete-all-history").delete(verifyJWT,deleteAllHistory);
router.route("/delete-history/:videoId").delete(verifyJWT,deleteHistoryVideo);
router.route("/getuserprofile").post(verifyJWT,getuserprofile);
router.route("/havetoken").get(verifyJWT,havetoken);
router.route("/setrefreshtoken").post(verifyJWT,setrefreshtoken);
router.route("/sendmessage").post(verifyJWT,sendmessage);
router.route("/verify-email").post(verifyEmail);
router.route("/googlelogin").post(logingoogle);
export default router