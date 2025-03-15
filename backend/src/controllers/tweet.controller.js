import { mongoose } from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/asyncHandler.js";
import { uploadcloudinary } from "../utils/cloudinary.js";

const createTweet = asynHandler(async (req, res) => {
    try {
        //TODO: create tweet
        const {content} = req.body;
        // console.log(req);
        
        if (req?.file?.path){
            const filepath = await req.file.path;
            const cloudpath = await uploadcloudinary(filepath);
            const tweet = await Tweet.create(
                {
                    "owner": req.user,
                    "content": content,
                    "file":cloudpath.url
                }
            );
            const data  = await Tweet.aggregate([
                {
                    $match:{
                        _id:tweet._id
                    }
                },{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    _id:1,
                                    username:1,
                                    email:1,
                                    avatar:1
        
                                }
                            }
                        ]
                    }
                },{
                    $unwind:{
                        path:"$owner",
                    }
                }
            ]);
            const data2 =  data[0];
            if (!data2) {
                new ApiError(500,"Unable to tweet")
            }
            return res.status(201).json(
                new ApiResponse(201,data2,"Successfully tweeted")
            )
        }
        
        if (content?.trim()==="") {
            throw new ApiError(400,"Content is require")
        }
    
        const tweet = await Tweet.create(
            {
                "owner": req.user,
                "content": content
            }
        );
        const data  = await Tweet.aggregate([
            {
                $match:{
                    _id:tweet._id
                }
            },{
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[
                        {
                            $project:{
                                _id:1,
                                username:1,
                                email:1,
                                avatar:1
    
                            }
                        }
                    ]
                }
            },{
                $unwind:{
                    path:"$owner",
                }
            }
        ]);
        const data2 =  data[0];
        if (!data2) {
            new ApiError(500,"Unable to tweet")
        }
        return res.status(201).json(
            new ApiResponse(201,data2,"Successfully tweeted")
        )
    } catch (error) {
        console.log(error.message);
        
        return res.status(500).json(new ApiResponse(500, error.message, error.message))
    }
})

const getUserTweets = asynHandler(async (req, res) => {
    const { userid } = req.params;
    const { prevId = null, order = "desc" } = req.query;
    const limit = 10;

    const sortOrder = order.trim().toLowerCase() === "asc" ? 1 : -1;

    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userid)) {
        throw new ApiError(400, "Invalid User ID");
    }

    // Match stage to filter tweets
    const matchStage = {
        owner: new mongoose.Types.ObjectId(userid),
        ...(prevId && {
            _id: sortOrder === 1
                ? { $gt: new mongoose.Types.ObjectId(prevId) }
                : { $lt: new mongoose.Types.ObjectId(prevId) }
        })
    };

    // Fetch tweets with likes and user details
    const tweets = await Tweet.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: sortOrder } },
        { $limit: limit },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "entityId",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" } // Calculate the number of likes
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails" // Deconstruct owner details
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner.username": "$ownerDetails.username",
                "owner.avatar": "$ownerDetails.avatar",
                likeCount: 1
            }
        }
    ]);

    if (tweets.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No tweets found")
        );
    }

    // Determine the next 'prevId' for pagination
    const nextPrevId = tweets[tweets.length - 1]._id;

    return res.status(200).json(
        new ApiResponse(200, { tweets, nextPrevId }, "Successfully retrieved user tweets")
    );
});


const updateTweet = asynHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    // Validate tweetId
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the user is the owner of the tweet
    if (!tweet.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    // Update the tweet
    tweet.content = content; // Update the content
    const updatedTweet = await tweet.save(); // Save the updated tweet

    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

const deleteTweet = asynHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(404, "Invalid tweet Id")
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Unable to Fetch tweet");
    }
    if (!tweet.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    const retweet = await Tweet.findByIdAndDelete(tweetId,{new:true});
    if (!retweet) {
        throw new ApiError(404, "Unable to delete tweet");
    }
    return res.status(200).json(new ApiResponse(200, retweet, "Tweet deleted successfully"));
})
const getallTweets = asynHandler(async (req, res) => {
    try {
        const response = await Tweet.aggregate([
            // Sort tweets by creation date (newest first)
            {
                $sort: { createdAt: -1 },
            },
            // Lookup user details (owner of the tweet)
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                avatar: 1,
                                email: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$owner", // Unwind to get a single owner object instead of an array
            },
            // Lookup likes and calculate total likes
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "entityId",
                    as: "likes",
                },
            },
            {
                $addFields: {
                    totalLikes: { $size: "$likes" }, // Calculate total likes
                },
            },
            {
                $project: {
                    likes: 0, // Remove raw likes array from the response
                },
            },
        ]);

        if (!response || response.length === 0) {
            return res
                .status(404)
                .json(new ApiResponse(404, [], "No tweets found"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, response, "All tweets fetched successfully"));
    } catch (error) {
        return res
            .status(500)
            .json(
                new ApiResponse(500, [], `Error fetching tweets: ${error.message}`)
            );
    }
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getallTweets,
}