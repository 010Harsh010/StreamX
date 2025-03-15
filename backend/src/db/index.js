import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connected: ${connectioninstance.connection.host}`);
    } catch (error) {
        console.log("MONGOODB CONNECTION ERROR: ",error);
        ProcessingInstruction.exit(1);
    }
}

export default connectDB