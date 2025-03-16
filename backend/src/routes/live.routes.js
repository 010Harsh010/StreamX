import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { fetchMessages,stremmerData,roomExists } from "../controllers/live.controller.js";

const router = Router()
router.use(verifyJWT)
router.route("/getMessages/:roomId").get(fetchMessages);
router.route("/streamerData/:roomId").get(stremmerData);
router.route("/roomExists").post(roomExists);

export default router