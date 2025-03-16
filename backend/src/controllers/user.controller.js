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
import base64 from "base-64";
import pkg from "base-64";

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

    const user = await User.findById(req.user._id);
    console.log(user);
    
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
      from: `Your Name <${process.env.HOST_EMAIL}>`,
      to: `${req.user.email}`,
      subject: "Help Mail",
      text: `${message}`,
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
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    existedUser.GrantToken = refreshAccessTokenjson;
    await existedUser.save();
    throw new ApiError(409, "user Exist's");
  }
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
    to: `${email}`,
    subject: "🎉 Welcome to Our Service! 🚀",
    html: `
      <div style="background-color:#f4f4f4; padding:20px; text-align:center; border-radius:10px;">
        <img src="cid:logo" width="200px" />
        <h2 style="color:#4CAF50;">Welcome to Our Platform 🎉</h2>
        <p style="font-size:16px; color:#333;">
          We're excited to have you! Stay tuned for amazing updates. 🚀
        </p>
        <a href="https://streamsx.vercel.app" style="
           display:inline-block; background-color:#4CAF50; color:white; padding:10px 20px; 
           text-decoration:none; border-radius:5px; font-size:18px;">
          Explore Now
        </a>
        <p style="color:#888; font-size:12px;">If you did not sign up, please ignore this email.</p>
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
