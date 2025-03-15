import mongoose from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynHandler} from "../utils/asyncHandler.js"
import {Playlist} from "../models/playlist.model.js"

const createPlaylist = asynHandler(async (req, res) => {
    const { name, description } = req.body;

    // Validate name and description
    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    // Create playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: [],
    });

    // Convert to plain object and remove 'owner' field from the response
    const response = playlist.toObject();
    delete response.owner;

    // Send the response
    return res
        .status(201)
        .json(new ApiResponse(201, response, "Playlist Created Successfully"));
});


const getUserPlaylists = asynHandler(async (req, res) => {
    const { userId } = req.params;
    // console.log(userId);
    

    // Validate and convert userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, "Invalid User ID");
    }

    // Fetch playlists belonging to the user
    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
            }
        },
        {
            $unwind:{
                path: "$ownerInfo",
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videosInfo",
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: 1,
                createdAt: 1,
                "ownername" : "$ownerInfo.fullName",
                "owneravatar": "$ownerInfo.avatar",
                "videosInfo": 1
            }
        }
    ]);
    
    if (!playlists || playlists.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No Playlists Found"));
    }

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists Retrieved"));
});

const getPlaylistById = asynHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(404, "Invalid Playlist ID");
    }
    const playlists = await Playlist.find({ _id: playlistId});
    if (!playlists || playlists.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No Playlists Found"));
    }

    // Return the retrieved playlists
    return res.status(200).json(new ApiResponse(200, playlists, "Playlists Retrieved"));
})

const addVideoToPlaylist = asynHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate IDs
    if ([playlistId, videoId].some(id => !mongoose.Types.ObjectId.isValid(id))) {
        throw new ApiError(404, "Invalid ID");
    }

    const playlists = await Playlist.findById(playlistId);
    if (!playlists.owner.equals(req.user._id)){
        throw new ApiError(404,"UnAuthorized User")
    }
    // Use $addToSet to avoid duplicate entries
    if (!playlists.videos.includes(videoId)) {
        playlists.videos.push(videoId);
        const playlist =await playlists.save();
        if (!playlist) {
            return res.status(404).json(new ApiResponse(404, [], "Playlist Not Found"));
        }
        return res.status(200).json(new ApiResponse(200, playlist, "Video Added to Playlist"));
    }else{
        return res.status(200).json(new ApiResponse(200, [], "Video Already Added"))
    }
});

const removeVideoFromPlaylist = asynHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if ([playlistId, videoId].some((field) => !mongoose.Types.ObjectId.isValid(field))){
        throw new ApiError(404, "Invalid ID");
    }
    const playlists = await Playlist.findById(playlistId);
    if (!playlists) {
        return new ApiError(404, "Playlist Not Found");
    }
    if (!playlists.owner.equals(req.user._id)){
        throw new ApiError(404, "UnAuthorized User");
    }
    // Use $pull to remove the video from the array
    const response =await playlists.videos.pull(videoId);
    const playlist =await playlists.save();
    if (!response || !playlist) {
        return res.status(404).json(new ApiResponse(404, [], "Video Not Found"));
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Video Deleted From Playlist"));

})

const deletePlaylist = asynHandler(async (req, res) => {
    const {playlistId} = req.params;
    
    // TODO: delete playlist
    if (!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404, "Invalid playist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        return res.status(404).json(new ApiResponse(404, [], "Playlist Not Found"));
    }
    if (!playlist.owner.equals(req.user._id)){
        throw new ApiError(404,"Unauthorized Request");
    }
    const response =await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(new ApiResponse(200, response, "Playlist Deleted"));
})

const updatePlaylist = asynHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404, "Invalid playist ID");
    }
    if ([name, description].some((field) => { return field?.trim() === ""; })) {
        throw new ApiError(404,"Require All contents");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        return new ApiResponse(404,"Playlist Not Found");
    }
    if (!playlist.owner.equals(req.user._id)){
        throw new ApiError(404,"Unauthorized Request");
    }
    playlist.name = name;
    playlist.description = description;
    const playlists = await playlist.save();
    if (!playlists) {
        return res.status(404).json(new ApiResponse(404, [], "Playlist Cannot Update"));
    }
    return res.status(200).json(new ApiResponse(200, playlists, "Playlist Updated"));
})

const removemultipleplaylist = asynHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const {videoIds} = req.body;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(404,"Invalid PlayList Id");
    }
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
        throw new ApiError(400,"No Videos to Remove");
    }
    const user = await Playlist.findById(playlistId);
    if (!user) {
        throw new ApiError(404,"Playlist Not Found");
    }
    if (!user.owner.equals(req.user._id)) {
        throw new ApiError(404,"Unauthorized Request");
    }
    const bulk = videoIds.map(videoId => ({
        updateOne: {
            filter: { _id: playlistId },
            update: { $pull: { videos: videoId } }
        }
    }));
    const result = await Playlist.bulkWrite(bulk);
    if (!result) {
        throw new ApiError(500,"Unable to delete");
    }
    return res.status(200).json(new ApiResponse(200, result, "Videos Removed"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    removemultipleplaylist
}
