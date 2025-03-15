import mongoose from "mongoose";

const streamSchema = mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true // Faster lookups
    },
    host: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewer: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        }
    ],
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    messages: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comments',
    }],
    isLive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // Expires after 2 hours
        index: { expires: 2 * 60 * 60 }, // TTL Index: Auto-delete after 2 hours
    },
}, {
    timestamps: true,
});
streamSchema.pre("findOneAndDelete", async function(next) {
    try {
        const doc = await this.model.findOne(this.getFilter()); // Fetch the document being deleted
        if (doc) {
            await mongoose.model("Message").deleteMany({ roomId: doc._id }); // Delete all messages related to this stream
        }
        next();
    } catch (error) {
        next(error);
    }
});


export const Stream = mongoose.model("Stream", streamSchema);
