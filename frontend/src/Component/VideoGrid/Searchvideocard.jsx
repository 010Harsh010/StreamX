import React from "react";
import { useNavigate } from "react-router-dom";
import { setVideoId } from "../../features/videoSlice";
import { useDispatch } from "react-redux";

const LongVideoCard = ({videoId, title, channel, views, timeAgo, duration, thumbnail }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onClickHandle = () => {
    
    dispatch(setVideoId(videoId));
    navigate("/key-video");
  }
  return (
    <div className="divcard"onClick={() => onClickHandle()}>
      <div className="videoItem">
        <img className="videoThumbnail" src={thumbnail} alt={title} />
        <div className="videoDetails">
          <p className="videoTitle">{title}</p>
          <p className="videoChannel">{channel}</p>
          <p className="videoStats">
            {views} views • {timeAgo} {parseInt(duration)} Sec
          </p>
        </div>
      </div>
    </div>
  );
};

export default LongVideoCard;
