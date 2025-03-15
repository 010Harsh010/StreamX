import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    removemultipleplaylist} from "../controllers/playlist.controller.js";

const router = Router()
router.use(verifyJWT)
router.route("/create/playlist").post(createPlaylist)
router.route("/getuserplaylist/:userId").get(getUserPlaylists)
router.route("/getplaylistbyid/:playlistId").get(getPlaylistById)
router.route("/addvideo/:playlistId/video/:videoId").put(addVideoToPlaylist)
router.route("/deletevideo/:playlistId/video/:videoId").delete(removeVideoFromPlaylist)
router.route("/deleteplaylist/:playlistId").delete( deletePlaylist)
router.route("/updateplaylist/:playlistId").patch(updatePlaylist)
router.route("/deletemultiplevideo/:playlistId").delete(removemultipleplaylist);


export default router