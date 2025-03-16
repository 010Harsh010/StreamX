import {Message} from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/asyncHandler.js";
import {Stream} from "../models/Stream.model.js";

const fetchMessages = asynHandler(async(req,res) => {
    try {
        const {roomId} = req.params;
        const data = await Stream.aggregate([
            { $match: { roomId:roomId } },
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "roomId",
                    as: "messages",
                    pipeline: [
                        {
                            $sort:{
                                createdAt: 1
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "sender",
                                foreignField: "_id",
                                as: "senderInfo",
                                pipeline: [
                                    {
                                        $project: {
                                            _id: 1,
                                            fullName: 1,
                                            avatar: 1,
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$messages"
            },
            {
                $project: {
                        message: "$messages.message",
                        senderInfo: "$messages.senderInfo",
                        createdAt: "$messages.createdAt"
                }
            }
        ]);
        if (!data){
            throw new ApiError(404,"No Messages");
        }
        
        return res.status(200).json(
            new ApiResponse(200,data,"Messages Fetched Successfully")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500,error.message,"Error Occured")
        )
    }
});

const stremmerData = asynHandler(async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user?._id; // Assuming you have authentication
        // console.log(userId,roomId);
        
        const data = await Stream.aggregate([
            {
                $match: { roomId: roomId }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "host",
                    foreignField: "_id",
                    as: "senderInfo",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                avatar: 1,
                                email: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "host",
                    foreignField: "channel",
                    as: "followers"
                }
            },
            {
                $addFields: {
                    followersCount: { $size: "$followers" }, // Count followers
                    isFollowing: {
                        $in: [userId, "$followers.subscriber"] // Check if user is following
                    }
                }
            },
            {
                $project: { 
                    followers: 0 // Remove followers array from response
                }
            }
        ]);
        // console.log(data);
        
        if (!data.length) {
            throw new ApiError(404, "No User Found");
        }

        return res.status(200).json(new ApiResponse(200, data, "Success"));
    } catch (error) {
        console.log(error.message);
        
        return res.status(500).json(new ApiResponse(500, {}, error.message));
    }
});

const roomExists = asynHandler(async (req,res) => {
    try {
        const {roomId} = req.body;
        const room = await Stream.findOne({roomId});
        console.log(room);
        
        if (room){
            return res.status(200).json(new ApiResponse(200,{
                room
            },{
                message: "Room exists"
            }))
        }else{
            return res.status(404).json(new ApiResponse(404, {}, "Room does not exist"))
        };
    } catch (error) {
        return res.status(404).json(new ApiResponse(404,{},{
            message: "Room does not exist"
        }));
    }
});

export {
    fetchMessages,
    stremmerData,
    roomExists
}