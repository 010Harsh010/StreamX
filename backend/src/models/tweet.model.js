import mongoose,{Schema, SchemaType} from "mongoose";
const tweetSchema = new Schema(
    {
        content: {
            type: String,
            require: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        file:{
            type:String
        }
    },
    {
        timestamps: true
    }
)
export const Tweet = mongoose.model("Tweet",tweetSchema)