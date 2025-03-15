import mongoose, { Mongoose } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/asyncHandler.js";
import {Like} from "../models/like.model.js"

const toggleVideoLike = asynHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    const like = await Like.findOne({
        likedBy: req.user._id,
        entityType: "Video",
        entityId: videoId,
    });

    if (like) {
        // Unlike the video
        const deletedLike = await Like.findByIdAndDelete(like._id);
        if (!deletedLike) {
            throw new ApiError(500, "Unable to delete like");
        }
        return res.status(200).json(new ApiResponse(200, null, "Unliked successfully"));
    } else {
        // Like the video
        const newLike = await Like.create({
            likedBy: req.user._id,
            entityType: "Video",
            entityId: videoId,
        });
        if (!newLike) {
            throw new ApiError(500, "Unable to like");
        }
        return res.status(200).json(new ApiResponse(200, newLike, "Liked successfully"));
    }
});
const toggleCommentLike = asynHandler(async (req, res) => {
    const {commentId} = req.params
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Check if the user already liked the video
    const like = await Like.findOne({
        likedBy: req.user._id,
        entityType: "Comment",
        entityId: commentId,
    });

    if (like) {
        // Unlike the video
        const deletedLike = await Like.findByIdAndDelete(like._id);
        if (!deletedLike) {
            throw new ApiError(500, "Unable to delete like");
        }
        return res.status(200).json(new ApiResponse(200, null, "Unliked successfully"));
    } else {
        // Like the video
        const newLike = await Like.create({
            likedBy: req.user._id,
            entityType: "Comment",
            entityId: commentId,
        });
        if (!newLike) {
            throw new ApiError(500, "Unable to like");
        }
        return res.status(200).json(new ApiResponse(200, newLike, "Liked successfully"));
    }
});

const toggleTweetLike = asynHandler(async (req, res) => {
    const {tweetId} = req.params
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check if the user already liked the video
    const like = await Like.findOne({
        likedBy: req.user._id,
        entityType: "Tweet",
        entityId: tweetId,
    });

    if (like) {
        // Unlike the video
        const deletedLike = await Like.findByIdAndDelete(like._id);
        if (!deletedLike) {
            throw new ApiError(500, "Unable to delete like");
        }
        return res.status(200).json(new ApiResponse(200, null, "Unliked successfully"));
    } else {
        // Like the video
        const newLike = await Like.create({
            likedBy: req.user._id,
            entityType: "Tweet",
            entityId: tweetId,
        });
        if (!newLike) {
            throw new ApiError(500, "Unable to like");
        }
        return res.status(200).json(new ApiResponse(200, newLike, "Liked successfully"));
    }
}
);

const getLikedVideos = asynHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                entityType: "Video",
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "entityId",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                        }
                    },
                    {
                        $project:{
                            title: 1,     
                            description: 1,   
                            thumbnail: 1,
                            duration:1,      
                            _id:1,
                            views:1,
                            createdAt:1,
                            "owner.username": 1, 
                            "owner.email": 1,
                            "owner.fullName":1
                        }
                    }
                ]
            }
        }
    ]);

    if (likedVideos.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No Liked Videos")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "All Videos Liked By User")
    );
});


const getLikedtweet = asynHandler(async (req, res) => {
    const likedtweet = await Like.aggregate([
        {
            $match:{
                likedBy:req.user._id,
                entityType: "Tweet",
            }
        },{
            $lookup:{
                from: "tweets",
                localField: "entityId",
                foreignField: "_id",
                as: "tweets",
            }
        },{
            $unwind: "$tweets",
        },{
            $lookup:{
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "owner",
            }
        },{
            $unwind: "$owner",
        },
        {
            $project:{
                tweets:1,
                "owner._id":1,
                "owner.fullName":1,
                "owner.avatar":1,
                createdAt:1
            }
        }
    ])
    if (!likedtweet) {
        return res.status(200).json(new ApiResponse(200,[],"No Liked tweet"))
    }
    return res.status(200).json(
        new ApiResponse(200,likedtweet,"All tweet Liked By User")
    )
});
const getLikedComment = asynHandler(async (req, res) => {
    const likedComment = await Like.aggregate([
        {
            $match: {
                "likedBy": req.user._id,
                "entityType": "Comment"
            }
        },{
            $lookup: {
                from: "comments",
                localField: "entityId",
                foreignField: "_id",
                as: "comment",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField:"_id",
                            as: "owner"
                        }
                    },{
                        $project:{
                            "_id":1,
                            "owner.avatar":1,
                            "owner.fullName":1,
                            "content":1,
                            "createdAt":1
                        }
                    }
                ]
            }
        }]
    )
    if (likedComment.length===0){
        return res.status(200).json(
            new ApiResponse(200,likedComment,"All Comment Liked By User")
        )
    }
    if (!likedComment) {
        return res.status(200).json(new ApiResponse(200,[],"No Liked Comment"))
    }
    return res.status(200).json(
        new ApiResponse(200,likedComment,"All Comment Liked By User")
    )
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedComment,
    getLikedtweet
}
