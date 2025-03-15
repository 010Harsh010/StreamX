import React, { useState, useRef } from "react";
import "../../CSS/videogrid.css";
import { useNavigate } from "react-router-dom";
import { useVideoReferencer } from "../../contextApi/VideoidContext.jsx";
import { useDispatch } from "react-redux";
import { setVideoId } from "../../features/videoSlice.js";

const VideoCard = ({ thumbnail, title, views, duration, owner, videoId, uploadedAt, videoFile }) => {
  const navigate = useNavigate();
  const { SetVideoId } = useVideoReferencer(); 
  const dispatch = useDispatch();

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);

  const handleVideoClick = () => {
    SetVideoId(videoId);
    dispatch(setVideoId(videoId));
    navigate("/key-video");
  };

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setIsHovered(false);
  };

  const formattedDuration = (duration / 60).toFixed(2);

  return (
    <div 
      className="video-card" 
      onClick={handleVideoClick} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && videoFile ? (
        <video 
          src={videoFile} 
          className="thumbnail video-preview"
          autoPlay
          loop
          muted
        />
      ) : (
        <img src={thumbnail || "./me.jpg"} alt={title} className="thumbnail"/>
      )}
      
      <div className="video-info">
        <div className="details-cards">
          <img src={owner?.avatar || "./me.jpg"} alt={owner?.fullName || "Unknown"} className="avatar" />
        </div>
        <div className="video-details">
          <h4 className="title">{title}</h4>
          <p className="meta">
            {views} views • {formattedDuration} min {uploadedAt}
          </p>
          <p className="author">{owner?.fullName || "Unknown"}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
