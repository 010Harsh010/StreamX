import mongoose,{Schema} from "mongoose";

const messageSchema = new Schema(
    {
       message: {
        type: String,
        required: true,  
       },
       roomId: {
        type: Schema.Types.ObjectId,
        ref: "Stream",
       },
       sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
       }
    },
    {
        timestamps: true
    }
);

export const Message = mongoose.model("Message",messageSchema)