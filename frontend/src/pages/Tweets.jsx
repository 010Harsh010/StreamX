import React, { useEffect, useState, useRef } from "react";
import "../CSS/tweet.css";
import { others } from "../Server/others.js";
import Lottie from "lottie-react";
import nodata from "../assets/womennodata.json";
import { Link } from "react-router-dom";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoMdSend } from "react-icons/io";
const TweetComponent = () => {
  const other = new others();
  const [tweets, setTweets] = useState("");
  const [loading, setloading] = useState(true);
  document.title = "StreamX-Tweets";
  const [showFullContent, setShowFullContent] = useState(false);
  const MAX_CONTENT_LENGTH = 100;
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      onFileSelect(event.target.files[0]);
    }
  };

  const toggleLike = async (id) => {
    try {
      const response = await other.toggleTweetLike({ tweetId: id });
      if (!response) {
        throw new Error("Unable to Update Like");
      }
      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet._id === id
            ? {
                ...tweet,
                totalLikes:
                  response.message === "Unliked successfully"
                    ? tweet.totalLikes - 1
                    : tweet.totalLikes + 1,
              }
            : tweet
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
  const toggleContent = () => setShowFullContent(!showFullContent);
  const fetchtweet = async () => {
    try {
      const response = await other.getalltweet();
      if (!response) {
        throw new Error("Unable to fetch  tweet");
      }
      setTweets(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetchtweet();
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await other.newTweet({
        content: message,
        file: fileInputRef.current?.files[0] || null,
      });
      setTweets((prevTweets) => [response.data, ...prevTweets]);
    } catch (error) {
      console.log(error.message);
    } finally {
      setMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const checkFileType = (fileOrUrl) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm"];

    // Extract the file extension
    const extension = fileOrUrl.split(".").pop().toLowerCase();

    if (imageExtensions?.includes(`.${extension}`)) {
      return "image";
    } else if (videoExtensions?.includes(`.${extension}`)) {
      return "video";
    } else {
      return "unknown";
    }
  };
  return (
    <div>
      harsh
      <div className="tweet-container">
        <div
          className="tweetspagging"
          style={{
            position: "fixed",
            display: "flex",
            width: "100%",
            height: "10px",
            alignItems: "flex-end",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Link
            to="/"
            style={{
              width: "150px",
              marginRight: "0px",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="selectingtweet"
              style={{
                color: "white",
                // backgroundColor: "gray",
                display: "flex",
                height: "30px",
                alignItems: "center",
                flexDirection: "row",
                width: "150px",
                justifyContent: "center",
              }}
            >
              Show_Videos
            </div>
          </Link>
        </div>
        {tweets.length > 0 ? (
          tweets.map((tweet) => {
            return (
              <div className="tweet" key={tweet?.id}>
                <div className="tweet-header">
                  {/* Avatar */}
                  <img
                    src={tweet?.owner?.avatar}
                    alt={`${tweet?.owner?.username}'s avatar`}
                    className="tweet-avatar"
                  />
                  <div className="tweet-info">
                    {/* Owner Info */}

                    <div className="tweet-owner">
                      <h4 className="tweet-username">
                        {tweet?.owner?.username}
                      </h4>
                      <span className="tweet-date">
                        {new Date(tweet.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="tweet-email">{tweet?.owner?.email}</p>

                    {/* Tweet Content */}
                    {tweet?.file && (
                      <div className="tweet-image">
                        {checkFileType(tweet?.file) === "image" ? (
                          <img
                            className="int"
                            src={tweet.file}
                            style={{ objectFit: "cover" }}
                            alt="tweet-image"
                          />
                        ) : checkFileType(tweet?.file) === "video" ? (
                          <video
                            className="int"
                            controls
                            controlsList="nodownload  noremoteplayback"
                            style={{ objectFit: "cover" }}
                            src={tweet?.file}
                          />
                        ) : (
                          <div className="pdf-container">
                            <iframe
                              src={tweet?.file}
                              title="PDF Preview"
                            ></iframe>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="tweet-content">
                      {showFullContent ||
                      tweet?.content?.length <= MAX_CONTENT_LENGTH
                        ? tweet?.content
                        : `${tweet?.content?.slice(0, MAX_CONTENT_LENGTH)}...`}
                      {tweet?.content?.length > MAX_CONTENT_LENGTH && (
                        <button
                          onClick={toggleContent}
                          className="tweet-show-more-btn"
                        >
                          {showFullContent ? "Show Less" : "Show More"}
                        </button>
                      )}
                    </p>

                    {/* Total Likes */}
                    <div className="tweet-likes">
                      <span onClick={() => toggleLike(tweet._id)}>❤️</span>{" "}
                      {tweet.totalLikes} Likes
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Lottie
                animationData={nodata}
                loop={true}
                style={{ height: "80vh" }}
              />
              <h3 style={{ color: "white" }}>No Data Found</h3>
            </div>
          </>
        )}
      </div>
      <form onSubmit={handleSubmit} className="tweet-form">
        <div className="inputing">
          <div
            className="tweet-add-icon"
            onClick={() => fileInputRef.current.click()}
            style={{ cursor: "pointer" }}
          >
            <IoMdAddCircleOutline className="icon" size={30} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide input field
            />
          </div>
          <div className="tweet-input-container">
            <div className="tweet-input-box">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                placeholder="Type a message..."
                className="tweet-input"
                minLength={2}
              />
            </div>
          </div>
          <div className="tweet-send-button">
            <button
              style={{
                borderRadius: "10px",
              }}
              type="submit"
              className="tweet-send-icon"
            >
              <IoMdSend className="icon" size={25} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default function Tweets() {
  return <TweetComponent />;
}
