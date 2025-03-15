import React, { useEffect, useState } from "react";
import "../CSS/videoplayer.css";
import { useVideoReferencer } from "../contextApi/VideoidContext.jsx";
import { VideoMethods } from "../Server/config.js";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../contextApi/SidebarContext.jsx";
import { others } from "../Server/others.js";
import InfiniteScroll from "react-infinite-scroll-component";
import AuthService from "../Server/auth.js";
function VideoPlayer() {
  const auth = new AuthService();
  const { sidebarVisible } = useSidebar();
  const navigate = useNavigate();
  const other = new others();
  const videomethod = new VideoMethods();
  const { videoId } = useVideoReferencer();
  const [video, setVideo] = useState({});
  const [comments, setComments] = useState([]);
  const [totalResult, setResults] = useState(0);

  const fetchVideo = async () => {
    try {
      const response = await videomethod.videoDetail({ videoId });
      const res = await auth.addWatchHistory({ videoId });
      if (!response) console.log("Unable to add watch video");
      if (!response) throw new Error("Unable to fetch video");
      setVideo(response.data);
    } catch (error) {
      navigate("/home");
    }
  };

  const fetchComments = async () => {
    try {
      const response = await other.getcomments({ videoId });
      if (!response) throw new Error("Unable to fetch comments");
      setComments(response.data);
      setResults(response.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, []);

  const formattedDate = video.createdAt
    ? new Date(video.createdAt).toLocaleString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "Date not available";

  const liketoggle = async () => {
    try {
      const response = await other.toggleVideoLike({ videoId });
      if (!response) throw new Error("Unable to toggle like");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`video-player-container ${sidebarVisible ? "sidebar-open" : ""}`}>
      <div className="video-player">
        <video className="video_Controller" src={video.videoFile} controls>
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="suggested-videos">
        {Array(10)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="suggested-video-card">
              <img src="/me.jpg" alt="suggested video thumbnail" className="thumbnail" />
              <div className="video-info">
                <h4 className="video-title">Sample Video Title</h4>
                <p className="video-meta">100K Views • 18 hours ago</p>
              </div>
            </div>
          ))}
      </div>
      <div className="video-container">
        <div className="video-header">
          <h3 className="video-title">{video.title || "Undefined"}</h3>
          <p className="video-stats">
            {video.views} Views • At {formattedDate}
          </p>
          <div className="video-user">
            <img src={video.owner?.avatar || "/me.jpg"} alt="Profile Picture" className="user-pic" />
            <div>
              <p className="username">{video.owner?.fullName || "unknown"}</p>
              <p className="followers">{video.subscribersCount || "0"} Followers</p>
            </div>
            <button className="follow-button">Follow</button>
          </div>
          <p className="description">{video.description || ""}</p>
        </div>

        <div className="actions">
          <button className="like-button" onClick={liketoggle}>
            👍 {video.likesCount || "0"}
          </button>
          <button className="dislike-button">👎</button>
          <button className="save-button">Save</button>
        </div>

        <InfiniteScroll
          dataLength={comments.length}
          next={fetchComments}
          hasMore={comments.length !== totalResult}
          loader={<h2>Loading.....</h2>}
          className="custom-infinite-scroll"
        >
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <img src={comment.owner?.avatar || "/me.jpg"} alt={comment.owner?.fullname || "unknown"} className="profile-pic" />
              <div className="comment-content">
                <p>
                  <strong>{comment.owner?.fullname || "unknown"}</strong> 2 mins ago
                </p>
                <p>{comment.content || ""}</p>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default VideoPlayer;
