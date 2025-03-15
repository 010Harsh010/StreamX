import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import {spawn } from "child_process";
import {initializeSocket} from "./socket.js";
import { createClient } from 'redis';

const app = express();
const whitelist = [process.env.URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());


// Routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subsription.routes.js";
import commentsRouter from "./routes/comments.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import liveRouter from "./routes/live.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/user-playlist", playlistRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/live", liveRouter);
app.get("/",(req,res)=>{
  return res.send("Welcome to StreamX API");
});

function callPythonFunction(funcName, args = []) {
    return new Promise((resolve, reject) => {
        const python = spawn("python", ["src\\utils\\youtube\\recommendation.py", funcName, ...args]);

        let result = "";
        let error = "";

        python.stdout.on("data", (data) => {
            result += data.toString();
        });

        python.stderr.on("data", (data) => {
            error += data.toString();
        });

        python.on("close", (code) => {
            if (error) {
                reject(error);
            } else {
                try {
                    resolve(JSON.parse(result)); // Ensure valid JSON response
                } catch (e) {
                    reject("Invalid JSON response");
                }
            }
        });
    });
}

// Example usage
const callpython  = (getVideoById,lastindex,func) => callPythonFunction(func, [getVideoById,lastindex])
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return null;
    });

const redisClient = createClient();
try {
  await redisClient.connect();
} catch (error) {
  console.log(error.message);
}
const server = createServer(app);
initializeSocket({server});

export { server ,redisClient, callpython };
