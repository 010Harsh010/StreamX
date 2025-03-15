import { mongoose} from "mongoose";
import {Comment} from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js";

const getVideoComments = asynHandler(async (req, res) => {
    const { videoid } = req.params;
    const { sort = "asc", limit = 10, prevId = null } = req.query;

    if (!mongoose.isValidObjectId(videoid)) {
        throw new ApiError(404, "Invalid Video Id");
    }

    const sorted = sort === "asc" ? 1 : -1;

    const matchCondition = {
        video: new mongoose.Types.ObjectId(videoid) // Ensure videoId is an ObjectId
    };

    // Add prevId condition if it exists
    if (prevId) {
        if (!mongoose.isValidObjectId(prevId)) {
            throw new ApiError(404, "Invalid Previous Id");
        }
        matchCondition._id = { $gt: new mongoose.Types.ObjectId(prevId) }; // Use _id for comparison
    }

    // Aggregate comments
    const comments = await Comment.aggregate([
        {
            $match: matchCondition // Use the constructed match condition
        },
        {
            $sort: {
                createdAt: sorted // Sort by createdAt
            }
        },
        {
            $limit: parseInt(limit) // Ensure limit is an integer
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $project: {
                content: 1,
                "owner.fullName":1,
                createdAt: 1,
                "owner.avatar": 1,
                "owner._id":1
               
            }
        }
    ]);

    // Check if comments array is empty
    if (comments.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No comments found for this video")
        );
    }
    const pId =comments[comments.length-1]._id;
    return res.status(200).json(
        new ApiResponse(200, [comments,pId], "Successfully received comments")
    );
});
const addComment = asynHandler(async (req, res) => {
    const { videoid } = req.params;
    const { content } = req.body;

    // Validate video ID
    if (!mongoose.isValidObjectId(videoid)) {
        throw new ApiError(400, "Invalid Video Id");  // Changed to 400 Bad Request
    }

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");  // Changed to 400 Bad Request
    }

    // Create a new comment
    const comment = await Comment.create({
        content,
        video: videoid,
        owner: req.user._id
    });

    // Check if the comment was created
    if (!comment) {
        throw new ApiError(500, "Unable to process comment request");
    }

    return res.status(201).json(  // Changed to 201 Created
        new ApiResponse(201, comment, "Comment successfully added")  // Improved message
    );
});
const updateComment = asynHandler(async (req, res) => {
    // TODO: update a comment
    const {commentid} =req.params
    const {content} = req.body;

    if (!commentid) {
        throw new ApiError(400,"Comment Id Require")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");  // Changed to 400 Bad Request
    }
    if (!mongoose.isValidObjectId(commentid)) {
        throw new ApiError(404,"Invalid Id")
    }

    const comment = await Comment.findById(
        commentid
    )
    if (!comment) {
        throw new ApiError(500,"unable to Update Comment")
    }
    if (!comment.owner.equals(req.user._id)){
        throw new ApiError(404,"unAuthorize Access");
    }
    comment.content = content;
    const newcomment =await comment.save()
    return res.status(200).json(
        new ApiResponse(200,newcomment,"Comment Update SuccesFully")
    )
})
// delete also like object
const  deleteComment = asynHandler(async (req, res) => {
    const {commentId} =req.params
    if (!commentId) {
        throw new ApiError(400,"Comment Id Require")
    }
    const comment = await Comment.findById(
        commentId
    )
    if (!comment) {
        new ApiError(500,"unable to delete Comment")
    }
    if (!comment.owner.equals(req.user._id)){
        throw new ApiError(404,"unAuthorize Access");
    }
    const newcomment =await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(
        new ApiResponse(200,newcomment,"Comment Delete SuccesFully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}