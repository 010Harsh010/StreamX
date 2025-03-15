import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        entityId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        entityType: {
            type: String,
            enum: ['Video', 'Comment', 'Tweet'],
            required: true,
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Optional: Create a unique index to prevent multiple likes by the same user on the same entity
likeSchema.index({ entityId: 1, entityType: 1, likedBy: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
