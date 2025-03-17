import dotenv from "dotenv";
import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadcloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
dotenv.config({ path: "../../.env" });
import fetch from "node-fetch";

const setrefreshtoken = async ({ code }) => {
  try {
    console.log(code);

    const data = await fetch(`https://oauth2.googleapis.com/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      mode: "cors",
      credentials: "include",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "http://localhost:5173",
        code: code,
      }),
    });
    const token = await data.json();
    return token;
  } catch (error) {
    return null;
  }
};
const sendmessage = asynHandler(async (req, res) => {
  try {
    const { message } = req.body;

    const user = await User.findOne({email:process.env.HOST_EMAIL});
    
    if (!user.GrantToken) {
      throw new ApiError("Not Gmail Verified Account");
    }

    const accessTokenResponse = await fetch(
      `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${user.GrantToken}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );

    const newAccessTokenData = await accessTokenResponse.json();
    // console.log("newAccesstokenData",newAccessTokenData);
    
    const accessToken = newAccessTokenData.access_token;

    if (!accessToken) {
      throw new ApiError("Failed to refresh access token");
    }
    // const response = await fetch(
    //   "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //     body: JSON.stringify({
    //       raw: encodedMessage,
    //     }),
    //   }
    // );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.HOST_EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: newAccessTokenData.refresh_token,
        accessToken: accessToken,
      },
    });
    const mailOptions = {
      from: `${process.env.EMAIL}`,
      to: `${req.user.email}`, // Assuming this is dynamically set based on the sender
      subject: "📩 Thank You for Your Message – We’ve Received It!",
      html: `
        <div style="background: url('https://via.placeholder.com/700x1200/eee0e5/ffffff?text=Marble+Texture') no-repeat center/cover; padding:40px; font-family:'Playfair Display', serif; color:#333333; max-width:650px; margin:auto; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); position:relative; overflow:hidden;">
          
          <!-- Decorative Overlays with Animation -->
          <div style="position:absolute; top:-30px; left:-30px; width:120px; height:120px; background:linear-gradient(45deg, #4a90e2, #2c3e50); opacity:0.2; border-radius:50%; animation: rotate 20s linear infinite;"></div>
          <div style="position:absolute; bottom:-20px; right:-20px; width:150px; height:150px; background:linear-gradient(135deg, #4a90e2, #2c3e50); opacity:0.15; border-radius:50%; animation: rotate 25s linear infinite reverse;"></div>
          <div style="position:absolute; top:50%; left:0; width:50px; height:50px; background:#4a90e2; opacity:0.1; transform:rotate(45deg); animation: rotate 15s linear infinite;"></div>
    
          <!-- Header with Logo -->
          <div style="text-align:center; position:relative; animation: fadeIn 1s ease-in;">
            <img src="cid:logo" width="150px" style="vertical-align:middle;" />
            <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:80px; height:3px; background:linear-gradient(90deg, #4a90e2, #2c3e50); border-radius:2px;"></div>
          </div>
    
          <!-- Main Acknowledgment Section -->
          <div style="background:#ffffff; padding:30px; border-radius:10px; text-align:center; position:relative; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.05); animation: fadeIn 1.2s ease-in;">
            <div style="position:absolute; top:-20px; left:-20px; width:100px; height:100px; background:linear-gradient(45deg, #4a90e2, #2c3e50); opacity:0.3; border-radius:50%; transform:rotate(20deg);"></div>
            <h1 style="font-size:36px; color:#4a90e2; margin:0 0 15px; font-weight:600; text-transform:uppercase; letter-spacing:2px; position:relative; display:inline-block;">
              Message Received
              <div style="position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:50%; height:2px; background:linear-gradient(90deg, #4a90e2, #2c3e50); opacity:0.5;"></div>
            </h1>
            <p style="font-size:18px; color:#555555; line-height:1.6; margin:0 0 25px; font-weight:300;">
              Thank you for reaching out to StreamX! We’ve successfully received your message and are reviewing it. Below is a copy of what you sent us:
            </p>
            <div style="background:#e6f0fa; padding:15px; border-radius:8px; text-align:left; color:#333333; margin:0 0 20px;">
              <strong>Your Message:</strong><br>
              <p style="margin:10px 0;">${req.body.message || "No message content provided."}</p> <!-- Dynamic message placeholder -->
            </div>
            <p style="font-size:16px; color:#777777; line-height:1.5;">
              Our team will get back to you as soon as possible. For urgent inquiries, feel free to contact us at support@streamx.com. Thank you for choosing StreamX!
            </p>
          </div>
    
          <!-- Contact Info Section -->
          <div style="margin-top:30px; text-align:center; position:relative; animation: fadeIn 1.4s ease-in; background:#2c3e50; padding:20px; border-radius:8px; color:#e6f0fa;">
            <h3 style="font-size:20px; color:#4a90e2; margin:0 0 15px; font-weight:500; position:relative; display:inline-block;">
              Stay Connected
              <div style="position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:50%; height:2px; background:linear-gradient(90deg, #4a90e2, #2c3e50); opacity:0.5;"></div>
            </h3>
            <p style="font-size:16px; color:#e6f0fa; line-height:1.5; max-width:500px; margin:0 auto 20px;">
              Email: <a href="mailto:support@streamx.com" style="color:#4a90e2; text-decoration:none;">support@streamx.com</a><br>
              Website: <a href="https://streamsx.vercel.app" style="color:#4a90e2; text-decoration:none;">https://streamsx.vercel.app</a>
            </p>
          </div>
    
          <!-- CTA Button with Pulsing Animation -->
          <div style="text-align:center; margin-top:30px; animation: fadeIn 1.6s ease-in;">
            <a href="https://streamsx.vercel.app" style="
              display:inline-block; background:linear-gradient(90deg, #4a90e2, #2c3e50); color:#ffffff; padding:12px 35px; 
              text-decoration:none; border-radius:25px; font-size:16px; font-weight:500; 
              box-shadow:0 4px 15px rgba(74, 144, 226, 0.4); position:relative; overflow:hidden; animation: pulse 2s infinite;">
              Explore StreamX
              <div style="position:absolute; top:-20px; left:-20px; width:50px; height:50px; background:#ffffff; opacity:0.1; border-radius:50%;"></div>
            </a>
          </div>
    
          <!-- Footer -->
          <div style="font-size:12px; color:#999999; text-align:center; margin-top:30px; position:relative; animation: fadeIn 1.8s ease-in;">
            If this was sent in error, please ignore this email.
            <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:60px; height:2px; background:linear-gradient(90deg, #4a90e2, #2c3e50); opacity:0.5;"></div>
          </div>
    
          <!-- CSS Animations -->
          <style>
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes rotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0% { box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4); }
              50% { box-shadow: 0 4px 25px rgba(74, 144, 226, 0.7); }
              100% { box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4); }
            }
          </style>
        </div>
      `,
      attachments: [
        {
          filename: "newlogo.png",
          path: "./public/temp/newlogo.png",
          cid: "logo",
        },
      ],
    };
    

    const result = await transporter.sendMail(mailOptions);
    console.log(result);
    

    // const data = await response.json();

      return res
        .status(200)
        .json(
          new ApiResponse(200, { data: "Message Sent Successfully" }, "success")
        );
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json(new ApiResponse(400, { data: "Message Unsuccessful" }, "Failed"));
  }
});

const havetoken = asynHandler(async (req, res) => {
  try {
    const response = await User.findById({
      _id: req.user._id,
    });
    if (!response) {
      throw new ApiError(403, "No User");
    }
    if (response.GrantToken) {
      res.status(200).json(new ApiResponse(200, {}, "Has Token"));
    } else {
      throw new Error(403, "No Token");
    }
  } catch (error) {
    res.status(403).json(new ApiResponse(403, false, error));
  }
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefershToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Somthing went wrong on creating token");
  }
};

const registerUser = asynHandler(async (req, res) => {
  // get user detail from fronted
  // vaslidatioon - not empity
  // check if user already existss
  // check for image,check for avatar
  // upload on cloudry
  // create user object == create entry in db
  // ree=move password  and refersh token field
  // check for response
  // send response back to user
  const { fullName, username, password, description = "", code } = req.body;

  if (
    [fullName, username, password, code].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const tokenjson = await setrefreshtoken({ code });
  if (!tokenjson) {
    throw new ApiError(404, "Unable to Access account");
  }

  const refreshAccessTokenjson = tokenjson.refresh_token;

  const accessTokenResponse = await fetch(
    `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshAccessTokenjson}`,
    {
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  const newAccessTokenData = await accessTokenResponse.json();
  const accessToken = newAccessTokenData.access_token;
  // console.log(accessToken);
  



  const userRes = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
    {
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );

  const userData = await userRes.json();
  const { email } = userData;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    existedUser.GrantToken = refreshAccessTokenjson;
    await existedUser.save();
    throw new ApiError(409, "user Exist's");
  }
  
 try {
   const host = await User.findOne({
    email:process.env.HOST_EMAIL
   });
     
     if (!host.GrantToken) {
       throw new ApiError("Not Gmail Verified Account");
     }
 
     const hostaccessTokenResponse = await fetch(
       `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${host.GrantToken}`,
       {
         method: "POST",
         mode: "cors",
         credentials: "include",
       }
     );
 
     const hostnewAccessTokenData = await hostaccessTokenResponse.json();
     // console.log("newAccesstokenData",newAccessTokenData);
     
     const hostaccessToken = hostnewAccessTokenData.access_token;
 
     if (!hostaccessToken) {
       throw new ApiError("Failed to refresh access token");
     }
 
   const transporter = nodemailer.createTransport({
     service: "gmail",
     auth: {
       type: "OAuth2",
       user: process.env.HOST_EMAIL,
       clientId: process.env.GOOGLE_CLIENT_ID,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       refreshToken: newAccessTokenData.refresh_token,
       accessToken: hostaccessToken,
     },
   });
 
   const mailOptions = {
    from: `${process.env.EMAIL}`,
    to: `${req.user.email}`,
    subject: "🎉 Welcome to StreamX – Dive Into Endless Entertainment!",
    html: `
      <div style="background: url('https://via.placeholder.com/700x1200/eee0e5/ffffff?text=Marble+Texture') no-repeat center/cover; padding:40px; font-family:'Playfair Display', serif; color:#333333; max-width:650px; margin:auto; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); position:relative; overflow:hidden;">
        
        <!-- Decorative Overlays with Animation -->
        <div style="position:absolute; top:-30px; left:-30px; width:120px; height:120px; background:linear-gradient(45deg, #95d5b2, #d8f3dc); opacity:0.2; border-radius:50%; animation: rotate 20s linear infinite;"></div>
        <div style="position:absolute; bottom:-20px; right:-20px; width:150px; height:150px; background:linear-gradient(135deg, #95d5b2, #d8f3dc); opacity:0.15; border-radius:50%; animation: rotate 25s linear infinite reverse;"></div>
        <div style="position:absolute; top:50%; left:0; width:50px; height:50px; background:#95d5b2; opacity:0.1; transform:rotate(45deg); animation: rotate 15s linear infinite;"></div>
  
        <!-- Header with Logo -->
        <div style="text-align:center; margin-bottom:30px; position:relative; animation: fadeIn 1s ease-in;">
          <img src="cid:logo" width="150px" style="vertical-align:middle;" />
          <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:80px; height:3px; background:linear-gradient(90deg, #95d5b2, #d8f3dc); border-radius:2px;"></div>
        </div>
  
        <!-- Main Welcome Section -->
        <div style="background:#ffffff; padding:30px; border-radius:10px; text-align:center; position:relative; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.05); animation: fadeIn 1.2s ease-in;">
          <div style="position:absolute; top:-20px; left:-20px; width:100px; height:100px; background:linear-gradient(45deg, #95d5b2, #d8f3dc); opacity:0.3; border-radius:50%; transform:rotate(20deg);"></div>
          <h1 style="font-size:36px; color:#95d5b2; margin:0 0 15px; font-weight:600; text-transform:uppercase; letter-spacing:2px; position:relative; display:inline-block;">
            Welcome to StreamX
            <div style="position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:50%; height:2px; background:linear-gradient(90deg, #95d5b2, #d8f3dc); opacity:0.5;"></div>
          </h1>
          <p style="font-size:18px; color:#555555; line-height:1.6; margin:0 0 25px; font-weight:300;">
            You’ve just joined a community where entertainment knows no bounds. From blockbuster movies to binge-worthy series, StreamX is here to bring joy to your screen with the magic of AI-powered recommendations. Let’s make every moment a masterpiece!
          </p>
        </div>
  
        <!-- About Section -->
        <div style="margin-top:30px; text-align:center; position:relative; animation: fadeIn 1.4s ease-in;">
          <h2 style="font-size:24px; color:#95d5b2; margin:0 0 15px; font-weight:500; position:relative; display:inline-block;">
            Who We Are
            <div style="position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:50%; height:2px; background:linear-gradient(90deg, #95d5b2, #d8f3dc); opacity:0.5;"></div>
          </h2>
          <p style="font-size:16px; color:#777777; line-height:1.5; max-width:500px; margin:0 auto 20px;">
            StreamX isn’t just a streaming platform—it’s your personal gateway to a world of stories. We’re passionate about delivering high-quality entertainment, curated just for you, with technology that understands your taste better than ever. Whether you’re a fan of gripping dramas, laugh-out-loud comedies, or thrilling action, we’ve got something to spark your interest.
          </p>
        </div>
  
        <!-- What We Do Section -->
        <div style="margin-top:25px; text-align:center; position:relative; animation: fadeIn 1.6s ease-in;">
          <h3 style="font-size:20px; color:#95d5b2; margin:0 0 20px; font-weight:500; position:relative; display:inline-block;">
            What We Do
            <div style="position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:50%; height:2px; background:linear-gradient(90deg, #95d5b2, #d8f3dc); opacity:0.5;"></div>
          </h3>
          <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
            <div style="min-width:120px; text-align:center; background:#d8f3dc; padding:15px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:transform 0.3s ease;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#95d5b2" style="margin:0 auto 10px;">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <p style="font-size:14px; color:#777777; margin:0 0 5px; font-weight:500;">Play</p>
              <p style="font-size:13px; color:#999999; margin:0;">Stream movies and shows in stunning HD, anytime, anywhere.</p>
            </div>
            <div style="min-width:120px; text-align:center; background:#d8f3dc; padding:15px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:transform 0.3s ease;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#95d5b2" style="margin:0 auto 10px;">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <p style="font-size:14px; color:#777777; margin:0 0 5px; font-weight:500;">Discover</p>
              <p style="font-size:13px; color:#999999; margin:0;">Let our AI find your next favorite watch with ease.</p>
            </div>
            <div style="min-width:120px; text-align:center; background:#d8f3dc; padding:15px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:transform 0.3s ease;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#95d5b2" style="margin:0 auto 10px;">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-7h3v3h-3v-3zm-1-1h-3V9h3v2z"/>
              </svg>
              <p style="font-size:14px; color:#777777; margin:0 0 5px; font-weight:500;">Organize</p>
              <p style="font-size:13px; color:#999999; margin:0;">Build and manage your watchlist with ease.</p>
            </div>
          </div>
        </div>
  
        <!-- Why StreamX Section -->
        <div style="margin-top:30px; text-align:center; position:relative; animation: fadeIn 1.8s ease-in;">
          <h3 style="font-size:20px; color:#95d5b2; margin:0 0 15px; font-weight:500; position:relative; display:inline-block;">
            Why StreamX?
            <div style="position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:50%; height:2px; background:linear-gradient(90deg, #95d5b2, #d8f3dc); opacity:0.5;"></div>
          </h3>
          <p style="font-size:16px; color:#777777; line-height:1.5; max-width:500px; margin:0 auto 20px;">
            We’re more than just a platform—we’re your entertainment partner. With cross-device support, seamless streaming, and personalized recommendations, StreamX is designed to make every moment unforgettable. Whether you’re unwinding after a long day or hosting a movie night, we’ve got you covered.
          </p>
        </div>
  
        <!-- CTA Button with Pulsing Animation -->
        <div style="text-align:center; margin-top:30px; animation: fadeIn 2s ease-in;">
          <a href="https://streamsx.vercel.app" style="
            display:inline-block; background:linear-gradient(90deg, #95d5b2, #d8f3dc); color:#ffffff; padding:12px 35px; 
            text-decoration:none; border-radius:25px; font-size:16px; font-weight:500; 
            box-shadow:0 4px 15px rgba(149, 213, 178, 0.4); position:relative; overflow:hidden; animation: pulse 2s infinite;">
            Start Your Journey
            <div style="position:absolute; top:-20px; left:-20px; width:50px; height:50px; background:#ffffff; opacity:0.1; border-radius:50%;"></div>
          </a>
        </div>
  
        <!-- Footer -->
        <div style="font-size:12px; color:#999999; text-align:center; margin-top:30px; position:relative; animation: fadeIn 2.2s ease-in;">
          Didn’t mean to join? No worries—just let this email slip away quietly.
          <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:60px; height:2px; background:linear-gradient(90deg, #95d5b2, #d8f3dc); opacity:0.5;"></div>
        </div>
  
        <!-- CSS Animations -->
        <style>
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { box-shadow: 0 4px 15px rgba(149, 213, 178, 0.4); }
            50% { box-shadow: 0 4px 25px rgba(149, 213, 178, 0.7); }
            100% { box-shadow: 0 4px 15px rgba(149, 213, 178, 0.4); }
          }
          div[style*="transition:transform 0.3s ease"]:hover {
            transform: scale(1.05);
          }
        </style>
      </div>
    `,
    attachments: [
      {
        filename: "newlogo.png",
        path: "./public/temp/newlogo.png",
        cid: "logo",
      },
    ],
  };
   const result = await transporter.sendMail(mailOptions);
 } catch (error) {
  console.log(error.message);
    throw new Error(error.message);
 }
  // console.log(result);
  
  const avatarLocalpath = req.files?.avatar[0]?.path;
  // const coverimageLocalpath  = req.files?.coverImage[0]?.path;

  let coverimageLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverimageLocalpath = req.files.coverImage[0].path;
  }
  if (!avatarLocalpath) {
    throw new ApiError(408, "Avatar is Require");
  }
  const avatar = await uploadcloudinary(avatarLocalpath);
  const coverImage = await uploadcloudinary(coverimageLocalpath);

  if (!avatar) {
    throw new ApiError(408, "Avatar is Require ");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
    description: description,
    GrantToken: refreshAccessTokenjson,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -GrantToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error While Registering a User");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user register succesfully"));
});
const verifyEmail = asynHandler(async (req, res) => {
  try {
    const { username, password, code } = req.body;
    const tokenjson = await setrefreshtoken({ code });
    if (!tokenjson) {
      throw new ApiError(404, "Unable to Access account");
    }
    const refreshAccessTokenjson = tokenjson.refresh_token;
    const accessTokenResponse = await fetch(
      `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshAccessTokenjson}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    const newAccessTokenData = await accessTokenResponse.json(); // Parse the response to JSON
    const accessToken = newAccessTokenData.access_token;

    if (!accessToken) {
      throw new ApiError(401, "Failed to fetch new access token");
    }

    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    const userData = await userRes.json();
    const { email } = userData;
    const existedUser = await User.findOne({
      username: username,
    });

    if (!existedUser) {
      throw new ApiError(400, "No User With That UserName");
    }

    if (existedUser.email.trim() !== email.trim()) {
      throw new ApiError("Details Donot match's");
    }
    existedUser.password = password;
    existedUser.GrantToken = refreshAccessTokenjson;
    await existedUser.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "User Updated Successfully" },
          "Updated Successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(500, { message: "Internal Server Error" }, "No update")
      );
  }
});

const logingoogle = asynHandler(async (req, res) => {
  try {
    const { code } = req.body;
    const tokenjson = await setrefreshtoken({ code });
    if (!tokenjson) {
      throw new ApiError(404, "Unable to Access account");
    }
    const refreshAccessTokenjson = tokenjson.refresh_token;

    const accessTokenResponse = await fetch(
      `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshAccessTokenjson}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    const newAccessTokenData = await accessTokenResponse.json(); // Parse the response to JSON
    const accessTokens = newAccessTokenData.access_token;

    if (!accessTokens) {
      throw new ApiError(401, "Failed to fetch new access token");
    }
    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessTokens}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    const userData = await userRes.json();
    // console.log("data",userData);
    
    const { email } = userData;
    console.log(email);
    
    const existedUser = await User.findOne({
      email: email,
    });
    console.log("user",existedUser);
    
    if (existedUser?.GrantToken){
      existedUser.GrantToken = refreshAccessTokenjson;
      existedUser.save();
    }else{
      const user = await User.findOneAndUpdate({
        email: existedUser?.email,
      },{
        GrantToken:refreshAccessTokenjson
      },{
        new: true
      })
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      existedUser._id
    );
    const loggedInUser = await User.findById(existedUser._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
          },
          "User logged in succesfully"
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

const loginUser = asynHandler(async (req, res) => {
  // req body - data
  // username 7 email
  // find the user
  // password check
  // asscess asnd refresh token
  // send cookies
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or emil is require");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const ispasswordvalid = await user.isPasswordCorrect(password);

  if (!ispasswordvalid) {
    throw new ApiError(404, "Invalid Credential ");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User logged in succesfully"
      )
    );
});

const logoutUser = asynHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(20, {}, "User Logout"));
});

const refreshAccessToken = asynHandler(async (req, res) => {
  const incomingRefershToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefershToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefershToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (incomingRefershToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Is Expired");
    }
    // all is well
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, new_refreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", new_refreshToken, options)
      .json(new ApiResponse(200, {}, "Token Refereshed "));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Token");
  }
});

const changeCurrentPassword = asynHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  const ispasswordcorrect = await user.isPasswordCorrect(oldPassword);
  // console.log(user);
  if (!ispasswordcorrect) {
    throw new ApiError(404, "Old Password Is Incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "Password Changed"));
});

const getCurrentUser = asynHandler(async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(408, "Bad Request");
    }
    return res.status(200).json(new ApiResponse(200, user, "Success"));
  } catch (error) {
    throw new ApiError(404, "Bad Request");
  }
});

const updateAccountDetails = asynHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(404, "All Fields Are require");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Account deltail updated Succesfuully"
    )
  );
});

const updateUserAvatar = asynHandler(async (req, res) => {
  const avatarLocalpath = req.file?.path;
  console.log(avatarLocalpath);
  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadcloudinary(avatarLocalpath);
  if (!avatar.url) {
    throw new ApiError(400, "Errror while uploading Avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Account Avatar updated Succesfully"
    )
  );
});

const updateUserCoverImage = asynHandler(async (req, res) => {
  const coverImageLocalpath = req.file?.path;
  if (!coverImageLocalpath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const coverImage = await uploadcloudinary(coverImageLocalpath);
  if (!coverImage.url) {
    throw new ApiError(400, "Errror while uploading Cover Image");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Account Cover Image updated Succesfully"
    )
  );
});

const getUserChannelProfile = asynHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(404, "Username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $in: [req.user?._id, "$subscribers.subscriber"],
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        description: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel donot exists");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
    );
});

const getWatchHistory = asynHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullNmae: 1,
                    usename: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "WatchHistory Stored Successfully"
      )
    );
});

const addwatchhistory = asynHandler(async (req, res) => {
  const { video } = req.params;
  const user = await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: video },
  });
  if (!user) {
    throw new ApiError(404, "Unable to add WatchHistory");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { Update: "Video Added SuccessFully" },
        "video added SuccessFully"
      )
    );
});
const editdescription = asynHandler(async (req, res) => {
  try {
    const { description } = req.body;
    // console.log(id);
    console.log(description);
    console.log(req.user);
    const response = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          description: description,
        },
      },
      { new: true }
    ).select("-password");

    if (!response) {
      throw new ApiError(500, "Unable to find user");
    }
    return res.status(200).json({
      message: "Successfully updated",
      data: response,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
});
const deleteAllHistory = asynHandler(async (req, res) => {
  try {
    console.log("delete all");

    const response = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { watchHistory: [] } },
      { new: true }
    );
    if (!response) {
      throw new ApiError(500, "Unable to delete history");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, [], "History Deleted Successfully"));
  } catch {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Unable to delete History"));
  }
});
const deleteHistoryVideo = asynHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json(new ApiError(400, "Video ID is required"));
    }
    const user = await User.findById(req.user._id);
    const history = user.watchHistory.filter(
      (video) => video.toString() !== videoId
    );
    user.watchHistory = history;
    const response = await user.save();
    if (!response) {
      throw new ApiError(500, "Unable to delete history");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response.watchHistory,
          "Video removed from history successfully"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiError(500, "Unable to delete video from history"));
  }
});
const getuserprofile = asynHandler(async (req, res) => {
  try {
    const { email = "", username = "" } = req.body;

    if (!email && !username) {
      throw new ApiError(404, "Invalid Request: Email or Username required");
    }

    const user = await User.findOne(email ? { email } : { username }).select(
      "-password -refreshToken -watchHistory"
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const data = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: "videos",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$owner", "$$userId"] },
                isPublished: true,
              },
            },
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "entityId",
                as: "likes",
              },
            },
            {
              $addFields: {
                videolikesCount: { $size: "$likes" },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                videolikesCount: 1,
              },
            },
          ],
          as: "videos",
        },
      },
      {
        $lookup: {
          from: "tweets",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$owner", "$$userId"] } } },
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "entityId",
                as: "likes",
              },
            },
            {
              $addFields: {
                tweetlikesCount: { $size: "$likes" },
              },
            },
            {
              $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                tweetlikesCount: 1,
              },
            },
          ],
          as: "tweets",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$subscriber", "$$userId"] },
                    { $eq: ["$channel", "$$userId"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                subscribersCount: {
                  $sum: { $cond: [{ $eq: ["$channel", "$$userId"] }, 1, 0] },
                },
                subscribedCount: {
                  $sum: { $cond: [{ $eq: ["$subscriber", "$$userId"] }, 1, 0] },
                },
              },
            },
          ],
          as: "subscriber",
        },
      },
      {
        $addFields: {
          subscriberData: {
            $arrayElemAt: ["$subscriber", 0],
          },
        },
      },
    ]);

    // Format the response
    const response = {
      user,
      videos: data[0]?.videos || [],
      tweets: data[0]?.tweets || [],
      subscriber: data[0]?.subscriberData || {
        subscribersCount: 0,
        subscribedCount: 0,
      },
    };

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Successful Process"));
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(403)
      .json(new ApiError(401, error.message || "Unable to fetch user"));
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  addwatchhistory,
  editdescription,
  deleteAllHistory,
  deleteHistoryVideo,
  getuserprofile,
  havetoken,
  setrefreshtoken,
  sendmessage,
  verifyEmail,
  logingoogle,
};
