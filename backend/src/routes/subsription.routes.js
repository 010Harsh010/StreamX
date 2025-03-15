import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import {getuserSubscriberDetails,getSubscribedChannels,toggleSubscription,getUserChannelSubscribers,issubscribed,getUserSubscribeDetail} from "../controllers/subscription.controller.js"
const router = Router()
router.use(verifyJWT);

router.route("/toggle-subscribe/:channelId").post(toggleSubscription)
router.route("/subscriber/:channelId").get(getUserChannelSubscribers)
router.route("/subscribed/:channelId").get(getSubscribedChannels)
router.route("/issubscribed/:channelId").get(issubscribed)
router.route("/getsubscriptiondetail/:id").get(getUserSubscribeDetail);
router.route("/subscriberdetails/:userId").get(getuserSubscriberDetails)

export default router