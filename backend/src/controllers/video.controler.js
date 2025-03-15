import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynHandler} from "../utils/asyncHandler.js"
import {uploadcloudinary,deletecloudVideo} from "../utils/cloudinary.js"
import { Like } from "../models/like.model.js"
import {callpython } from "../app.js";


const getAllVideos = asynHandler(async (req, res) => {
    const { userId } = req.params;
    const { sortBy = "createdAt", sortType = "desc", limit = 10 ,lastId=null} = req.query;
    // const skip = (page - 1) * limit;

    // Validate userId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404, "Invalid User Id");
    }

    // Convert sortType to an integer (1 for asc, -1 for desc)
    const sortOrder = sortType === "asc" ? 1 : -1;

    // MongoDB aggregation query
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                ...(lastId && { _id: { $gt: new mongoose.Types.ObjectId(lastId) } }) 
            },
        },
        {
            $sort: {
                [sortBy]: sortOrder,
            },
        },
        // {
        //     $skip: parseInt(skip), // Skip first (page-1) * limit documents
        // },
        {
            $limit: parseInt(limit), // Limit the number of documents returned
        },
        {
            $project: {
                owner: 1,
                videoFile: 1,
                title: 1,
                createdAt: 1,
                duration: 1,
                thumbnail:1,
                views:1,
            },
        },
    ]);
    if (!videos || videos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No Videos Found"));
    }
    const lastid = videos[videos.length-1]._id;
    // Return the paginated video data
    return res.status(200).json(new ApiResponse(200,[videos,lastid], "Successful Query"));
});

const uploadVideo =asynHandler(async(req,res) => {
    // take require inputs {title,description,} -->
    // thumbnail uploaded by user and video also
    // duration access from cloudnary
    // set owner from user
    const {title,description}  = req.body;
    // check for require field
    if(
        [title,description].some((field) => {
            return field?.trim()===""
        })
    )
    {
        throw new ApiError(400,"All fields are required");
    }
    console.log(title);
    
    const videoLocalpath = await req.files?.videoFile[0].path;
    const thumbnailLocalPath = await req.files?.thumbnail[0].path;
    console.log(videoLocalpath);
    console.log(thumbnailLocalPath);
    if (!(videoLocalpath && thumbnailLocalPath)) {
        throw new ApiError(404,"Path Not Found");
    }
    const videocloud = await uploadcloudinary(videoLocalpath);
    const thumbnail = await uploadcloudinary(thumbnailLocalPath);

    // console.log(videocloud);
    // return  res.json({message:"Video uploaded successfully",data:videocloud,thumbnail:thumbnail})

    if (!(videocloud && thumbnail)) {
        throw new ApiError(500,"Error On Clouding");
    }
    const video =await Video.create({
        title,
        description,
        videoFile:videocloud.url,
        thumbnail: thumbnail.url,
        owner: req.user,
        duration: videocloud.duration
    })
    if (!video) {
        throw new ApiError(500,"Error while Uploading Data");
    }
    return res.status(200).json(
        new ApiResponse(200,video,"Video Uploaded Successfully")
    )
})

const getVideoById = asynHandler(async (req, res) => {
    const { getvideoid } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(getvideoid)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    await Video.updateOne(
        { _id: new mongoose.Types.ObjectId(getvideoid) },
        { $inc: { views: 1 } } // Increment the views by 1
    );
    const video = await Video.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(getvideoid) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true // Handle cases with no owner
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: 'owner._id',
                foreignField: 'channel',
                as: 'subscribers'
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" } // Calculate subscriber count
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'entityId',
                as: "like"
            }
        },{
            $addFields: {
                likesCount: { $size: "$like" } // Calculate likes count
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                createdAt:1,
                thumbnail: 1,
                "owner.fullName": 1,
                "owner.avatar": 1,
                "owner._id":1,
                duration: 1,
                views: 1,
                subscribersCount: 1,
                likesCount: 1
            }
        }
    ]);

    // Handle case when no video is found
    if (!video || video.length === 0) {
        return res.status(404).json({ error: "Video Not Found" });
    }

    // Send the first video from the aggregation result
    return res.status(200).json({
        status: 200,
        data: video[0],
        message: "Video Details Received Successfully"
    });
});


const updateVideo=asynHandler(async(req,res)=>{
    const {videoid} = req.params;
    const {title,description}=req.body;
    if(!mongoose.Types.ObjectId.isValid(videoid)){
        throw new ApiError(404,"Invalid Video Id")
    }
    if (
        [title,description].some((field)=>{
            return field?.trim()===""
        })
    ) {
        throw new ApiError("Manadatory Fields Are require");
    }
    const videoLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!(videoLocalPath && thumbnailLocalPath)) {
        throw new ApiError(404,"NO Path Found");
    }
    const videopath = await uploadcloudinary(videoLocalPath);
    const thumbnailpath =await uploadcloudinary(thumbnailLocalPath);
    if (!(videopath && thumbnailpath)) {
        throw new ApiError(500,"Cloud Error");
    }
    const video = await Video.findByIdAndUpdate(
        videoid,
        {
            $set: {
                title:title,
                description:description,
                video:videopath.url,
                thumbnail:thumbnailpath.url
            }
        },{
            new:true
        }
    );
    if (!video) {
        return new ApiError(500,"Cloud Update Error");
    }
    return res.status(200).json(
        new ApiResponse(200,video,"Video Update SuccessFully")
    )
})
// After deleting 
// TODO 1. delete all tweet ,comment ,like ,from playlist
const deleteVideo = asynHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404,"Invalid video")
    }
    const video = await Video.deleteOne({ _id: new mongoose.Types.ObjectId(videoId) });
    if (!video) {
        throw new ApiError(404,"Not Deleted")
    }
    // delete cloud
    const result = await deletecloudVideo(video.videoFile); 
    // delete likes / comments
    const deleteLikes = await Like.deleteMany({ entityId: videoId });
    const deleteComments = await Comment.deleteMany({
        "video":videoId
    });
    return res.status(200).json(
        new ApiResponse(200,video,"Video Deleted Successfully")
    )
})

const togglePublishStatus = asynHandler(async (req, res) => {
    const { videoid } = req.params
    if (!mongoose.Types.ObjectId.isValid(videoid)){
        throw new ApiError(404,"Invalid video")
    }
    const video = await Video.findById(videoid)
    if (!video) {
        throw new ApiError(408,"unable To Reach Video")
    }
    video.isPublished = !video.isPublished;
    const done =await video.save();
    if (!done) {
        throw new ApiError(500,"Video cannot be Published")
    }
    return res.status(200).json(
        new ApiResponse(200,video,"Video Published/UnPublish Status Updated Successfully")
    )
})

const dataVideos = asynHandler(async (req, res) => {
    const { page = 1, limit = 10, prevId = null } = req.body;

    console.log("prevId:", prevId);
    
    const limitInt = parseInt(limit);

    // Match criteria to fetch only published videos
    const matchCriteria = {
        isPublished: true,
        ...(prevId ? { _id: { $lt: new mongoose.Types.ObjectId(prevId) } } : {}) 
    };

    const videos = await Video.aggregate([
        { $match: matchCriteria },
        { $sort: { createdAt: -1 } }, 
        { $limit: limitInt },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                isPublished: 1,
                createdAt: 1,
                views: 1,
                duration: 1,
                thumbnail: 1,
                updatedAt: 1,
                "owner.fullName": "$ownerDetails.fullName",
                "owner.avatar": "$ownerDetails.avatar"
            }
        }
    ]);

    if (videos.length === 0) {
        throw new ApiError(404, "No Videos");
    }

    const nextPrevId = videos.length > 0 ? videos[videos.length - 1]._id : null; // Set next prevId for pagination

    return res.status(200).json(
        new ApiResponse(200, [videos, nextPrevId], "Videos Retrieved Successfully")
    );
});

const recommend_list = asynHandler(async (req, res) => {
    try {
        const { videoId, page } = req.body;
        console.log(videoId,page);
        const response = await callpython(videoId, page,"recommend_videos");
        if (!response || response.length === 0) {
            throw new Error("No videos found");
        }

        const data = await Promise.all(
            response.map(async (id) => {
                const videos = await Video.aggregate([
                    {
                        $match: { _id: new mongoose.Types.ObjectId(id) } // Convert to ObjectId
                    },
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
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]);
                return videos[0] || null;
            })
        );
        const filteredData = data.filter((video) => video !== null);

        return res.status(200).json(new ApiResponse(200, filteredData, "success"));
    } catch (error) {
        console.log(error);
        
        return res.status(404).json(new ApiResponse(404, error.message, "failed"));
    }
});

const homerecommendation = asynHandler(async (req,res) => {
    try {
        const {page} = req.body;
        const description = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $project: {
                    watchHistory: { $slice: ["$watchHistory", -10] }
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "videoDetails"
                }
            },
            {
                $project: {
                    _id: 0,
                    description: "$videoDetails.description"
                }
            }
        ]);
        let details = "";
        description.map((data)=>{
            details += data.description + " ";
        })
        const response = await callpython(details,page,"new_recommend_videos");
        if (!response || response.length === 0) {
            throw new Error("No videos found");
        }
        const data = await Promise.all(
            response.map(async (id) => {
                const videos = await Video.aggregate([
                    {
                        $match: { _id: new mongoose.Types.ObjectId(id) }
                    },
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
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]);
                return videos[0] || null;
            })
        );

        const filteredData = data.filter((video) => video !== null);
        console.log("done request",page);

        return res.status(200).json(new ApiResponse(200, filteredData, "success"));
    } catch (error) {
        return res.status(404).json(new ApiResponse(404, error.message, "failed"));
    }
});
const generalChoice = asynHandler(async (req,res)=> {
    const {description,page,shortBy="createdAt"} = req.body;
    try {
        const response = await callpython(description,page,"new_recommend_videos");
        if (!response || response.length === 0) {
            throw new Error("No videos found");
        }
        const data = await Promise.all(
            response.map(async (id) => {
                const videos = await Video.aggregate([
                    {
                        $match: { _id: new mongoose.Types.ObjectId(id) }
                    },
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
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]);
                return videos[0] || null;
            })
        );


        const filteredData = data.filter((video) => video !== null);

        console.log("done request",page);
        return res.status(200).json(new ApiResponse(200, filteredData, "success"));
    } catch (error) {
        return res.status(404).json(new ApiResponse(404, error.message, "failed"));
    }
})

  

export {
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos,
    dataVideos,
    recommend_list,
    generalChoice,
    homerecommendation
}