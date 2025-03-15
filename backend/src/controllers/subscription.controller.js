import mongoose from "mongoose"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subsriptions.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asynHandler(async (req, res) => {
    const { channelId } = req.params;
    // console.log(channelId);
    
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(404, "Invalid Id");
    }

    const exist = await Subscription.findOne({
        subscriber: req.user,
        channel: channelId
    });
    console.log(exist);
    
    if (!exist) {  
        const sub = await Subscription.create({ 
            subscriber: req.user,
            channel: channelId
        });
        const response = sub.toObject();
        delete response.subscriber; 
        return res.status(200).json(
            new ApiResponse(200, response, "Subscription Successful")
        );
    } else {
        const sub = await Subscription.deleteOne({ _id: exist._id }); 
        return res.status(200).json(
            new ApiResponse(200, sub, "Unsubscription Successful")
        );
    }
});

const getUserChannelSubscribers = asynHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(404, "Invalid Channel Id");
    }
    const channelCount = await Subscription.countDocuments({ channel: channelId }); 
    return res.status(200).json(
        new ApiResponse(200, channelCount, "Subscriber Count")
    );
});
const getSubscribedChannels = asynHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(404, "Invalid Channel Id");
    }

    const channelsubscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users", // Join with users collection
                localField: "channel", // The channel ID in subscriptions
                foreignField: "_id", // Match with the user ID in users
                as: "channelDetails",
            },
        },
        {
            $unwind: "$channelDetails", // Deconstruct to get channel details
        },
        {
            $lookup: {
                from: "subscriptions", // Join subscriptions to count total subscribers
                localField: "channel", // Channel ID in the current document
                foreignField: "channel", // Match all subscriptions for this channel
                as: "allSubscribers",
            },
        },
        {
            $addFields: {
                subscriberCount: { $size: "$allSubscribers" }, // Count total subscribers
            },
        },
        {
            $project: {
                _id: "$channelDetails._id", // Channel ID
                name: "$channelDetails.fullName", // Channel name (from users)
                avatar: "$channelDetails.avatar", // Avatar URL
                subscriberCount: 1, // Total subscriber count
                email : "$channelDetails.email",
                cratedAt: "$createdAt"
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, channelsubscribed, "Subscriber List"));
});


const issubscribed = asynHandler(async (req, res) => {
    try {
      const { channelId } = req.params;
      const subscriberId = req.user._id;
        
      // Validate required data
      if (!channelId || !subscriberId) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid data"));
      }
  
      // Check subscription
      const exist = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
      });
  
      if (exist) {
        return res
          .status(200)
          .json(new ApiResponse(200, { isSubscribed: true }, "Subscribed"));
      } else {
        return res
          .status(200)
          .json(new ApiResponse(200, { isSubscribed: false }, "Not Subscribed"));
      }
    } catch (error) {
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal Server Error"));
    }
  });

  const getUserSubscribeDetail = asynHandler(async (req, res) => {
      try {
          const { id } = req.params; // Extract user ID from URL parameters
  
          // Check if the ID is provided
          if (!id) {
              throw new ApiError(404, "No Current User");
          }
  
          // Convert 'id' to a valid ObjectId
          const userId = new mongoose.Types.ObjectId(id);
  
          // Perform aggregation
          const response = await Subscription.aggregate([
              {
                  $match: {
                      $or: [
                          { subscriber: userId }, // Matches subscriptions where the user is a subscriber
                          { channel: userId }     // Matches subscriptions where the user is a channel
                      ]
                  }
              },
              {
                  $group: {
                      _id: null,
                      subscribersCount: {
                          $sum: { $cond: [{ $eq: ["$channel", userId] }, 1, 0] }
                      },
                      subscribedCount: {
                          $sum: { $cond: [{ $eq: ["$subscriber", userId] }, 1, 0] }
                      }
                  }
              }
          ]);
  
          // Destructure the results with default values
          const { subscribersCount = 0, subscribedCount = 0 } = response[0] || {};
  
          // Prepare the final response object
          const Details = {
              subscribersCount,
              subscribedCount
          };
  
          // Send success response
          return res.status(200).json(new ApiResponse(200, Details, "Success"));
      } catch (error) {
          // Send error response
          return res.status(500).json(new ApiResponse(500, null, error.message || "Internal Server Error"));
      }
  });
  const getuserSubscriberDetails = asynHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || !mongoose.isValidObjectId(userId)) {
            throw new ApiError(404, "Invalid UserId");
        }
        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberDetails",
                },
            },
            {
                $unwind: "$subscriberDetails",
            },
            {
                $lookup: {
                    from: "subscriptions",
                    let: { subscriberId: "$subscriberDetails._id", userId: new mongoose.Types.ObjectId(userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$channel", "$$subscriberId"] },
                                        { $eq: ["$subscriber", "$$userId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "isFollowedDetails",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "subscriberDetails._id",
                    foreignField: "channel",
                    as: "subscriberCountDetails",
                },
            },
            {
                $addFields: {
                    subname: "$subscriberDetails.fullName",
                    subavatar: "$subscriberDetails.avatar",
                    subemail: "$subscriberDetails.email",
                    subscriberCount: { $size: "$subscriberCountDetails" },
                    subId: "$subscriberDetails._id",
                    subcreated: "$subscriberDetails.createdAt",
                    isFollowedByUser: { $gt: [{ $size: "$isFollowedDetails" }, 0] }, // True if user follows this subscriber
                },
            },
            {
                $project: {
                    subname: 1,
                    subavatar: 1,
                    subemail: 1,
                    subscriberCount: 1,
                    subId: 1,
                    subcreated: 1,
                    isFollowedByUser: 1,
                    createdAt:1
                },
            },
        ]);

        if (!subscribers.length) {
            return res.status(200).json(new ApiResponse(200, [], "No Subscriber"));
        }

        return res.status(200).json(new ApiResponse(200, subscribers, "Successfully fetched"));
    } catch (error) {
        // Improved error handling
        return res
            .status(500)
            .json(new ApiResponse(500, [], error.message || "Internal Server Error"));
    }
});



export {
    toggleSubscription,
    getSubscribedChannels ,
    getUserChannelSubscribers ,
    issubscribed,
    getUserSubscribeDetail,
    getuserSubscriberDetails,
}