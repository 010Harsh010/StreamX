import React, { useEffect, useState } from "react";
import "../../CSS/likevideo.css";
import LongVideoCard from "./Searchvideocard.jsx";
import { others } from "../../Server/others.js";
import { useSelector } from "react-redux";
import { useSidebar } from "../../contextApi/SidebarContext.jsx";
import Lottie from "lottie-react";
import nomoredata from "../../assets/nomore.json"
import { useNavigate } from "react-router-dom";
import { setVideoId } from "../../features/videoSlice";
import { useDispatch } from "react-redux";
import loadings from "../../assets/circleloading.json";
import nomore from "../../assets/Nomorevideos.json"
const LikedVideos = () => {
  const cuser = useSelector((state) => state.userReducer.currentUser);
  const other = new others();
  const { sidebarVisible } = useSidebar();
  const [type, setType] = useState("videos");
  const [user, setUser] = useState({ fullName: "Guest", avatar: "/user.jpg" });
  const [videoList, setVideolist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [tweets,settweets] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onClickHandle = () => {
    const videoId = videoList[0]?.videos[0]?._id;
    if (videoId) {
      dispatch(setVideoId(videoId));
      navigate("/key-video");
    }
  }

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const response = await other.likedVideos();
      if (response?.data) {
        const data = response.data.filter((data)=>{
          return (
            data.videos.length !== 0
          )
      })
        setVideolist(data);
      } else {
        throw new Error("Unable to fetch videos");
      }
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedComments = async () => {
    try {
      setLoading(true);
      const response = await other.likedComments();
      if (response?.data) {
        setComments(response.data);
      } else {
        throw new Error("Unable to fetch comments");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchliketweets = async()=> {
    try {
      
      const response = await other.likedTweets() ;
      if (!response){
        throw new Error("Unable to fetch like tweets");
      }
      settweets(response.data);
    }
    catch(error){
      console.log(error);
    }
  }

  const getTimeDifference = (dateString) => {
    const givenDate = new Date(dateString);
    const currentDate = new Date();
    const diffInMilliseconds = currentDate - givenDate;

    const seconds = Math.floor(diffInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 30) return `${days} days ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
  };

  useEffect(() => {
    if (cuser) {
      setUser(cuser);
    }
  }, [cuser]);

  useEffect(() => {
    if (type === "videos") fetchLikedVideos();
    if (type === "comments") fetchLikedComments();
    if (type === "tweets") fetchliketweets();
  }, [type]);

  if (loading) {
    return (
      <div style={{ display: "flex",flexDirection:"column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Lottie animationData={loadings} loop={true} />
        <div style={{color:"white" ,fontFamily:"Poppins",fontSize:"1.5rem"}}>
        {
          user && user._id ? <h1>Loading...</h1> : <h1>Please Login to view your content</h1>
        }
        </div>
      </div>
    );
  }

  return (
    <div className="startBody">
      <div className={`pageInfo ${sidebarVisible && "sideContent"}`}>
        <div className="coverInfo">
          <img src={user.avatar?user.avatar:"/user.jpg"} alt="Profile" />
        </div>
        <div className="totalInfo">
          <div className="type">{
            type === "videos" ? "Videos" : type === "comments" ? "Comments" : "Tweets"
            }</div>
          <div style={{ color: "red" }} className="user">
            {user.fullName?user?.fullName:"Guest User"}
          </div>
          {type === "videos" && (
            <div className="timeInfo">
              {videoList?.length || 0} videos, No views <br />
              Last updated{" "}
              {getTimeDifference(
                videoList[0]?.videos[0]?.createdAt || new Date()
              )}
            </div>
          )}
          {type === "comments" && (
            <div className="timeInfo">
              {comments?.length || 0} Comments, No views <br />
              Last updated{" "}
              {getTimeDifference(
                comments[0]?.createdAt || new Date()
              )}
            </div>
          )}
          <div className="optionButton">
            <button onClick={() => type==="videos"?onClickHandle():""}>Play All</button>
            <button>Download</button>
          </div>
        </div>
      </div>
      <div className="likeContentInfo">
        <div className="options">
          <button onClick={() => setType("videos")}>Videos</button>
          <button onClick={() => setType("comments")}>Comments</button>
          <button onClick={() => setType("tweets")}>Tweets</button>
        </div>
        <div className="contents">
          {type === "videos" && (
            <div className="lists">
              {videoList?.length > 0 ? (
                videoList.map((video) => (
                  <LongVideoCard
                    key={video?.videos[0]?._id}
                    videoId={video?.videos[0]?._id}
                    title={video?.videos[0]?.title}
                    channel={video?.videos[0]?.owner[0]?.fullName}
                    views={video?.videos[0]?.views}
                    timeAgo={getTimeDifference(video?.videos[0]?.createdAt)}
                    duration={video?.videos[0]?.duration}
                    thumbnail={video?.videos[0]?.thumbnail}
                  />
                ))
              ) : (
                <div style={{height:"100vh",position:"sticky"}}>
                  <Lottie style={{height:"70%"}} animationData={nomoredata} loop={true}/>
                  <div style={{fontFamily:"cursive",display:"flex",alignItems:"center",justifyContent:"center"}}><h3>No liked videos available.</h3></div>
                </div>
              )}
            </div>
          )}
          {type === "comments" && (
            <div style={{ margintop: "2rem" }} className="commentslist">
              {comments?.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={index} className="commentBox">
                    <div className="imageBox">
                      <img
                        src={comment.comment[0]?.owner[0]?.avatar}
                        alt="coverImage"
                      />
                    </div>
                    <div className="contentBox" style={{ backgroundColor: "transparent" }}>
                      <div className="ownerInfo"style={{ backgroundColor: "transparent" }}>
                        {comment.comment[0]?.owner[0]?.fullName}
                      </div>
                      <div className="shownComment"style={{ backgroundColor: "transparent" }}>
                        {comment.comment[0]?.content}
                      </div>
                      <div className="timeStamp"style={{ backgroundColor: "transparent" }}>
                        {getTimeDifference(comment?.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="nodata" style={{ textAlign: "center" }}>
                <Lottie
                  style={{ height: "25rem" }}
                  animationData={nomoredata}
                  loop={true}
                />
                <h1 style={{color:"white",fontFamily:"fantasy"}}>No Data Found</h1>
              </div>
              )}
            </div>
          )}
          {type === "tweets" && (
                <div style={{maxHeight:"40rem",overflow:"scroll"}}>
                    <div style={{ marginTop: "2rem" }} className="commentslist">
                  {tweets.length > 0 ? (
                    tweets?.map((tweet, index) => (
                      <div key={index} className="commentBox">
                        <div className="imageBox">
                          <img
                            src={user?.avatar || "/user.jpg"}
                            alt="coverImage"
                          />
                        </div>
                        <div className="contentBox" style={{ backgroundColor: "transparent" }}>
                          <div className="ownerInfo" style={{ backgroundColor: "transparent" }}>
                            {tweet?.owner?.fullName || "User"}
                          </div>
                          <div className="shownComment" style={{ backgroundColor: "transparent" }}>
                            {tweet?.tweets?.content || ""}
                          </div>
                          <div className="timeStamp" style={{ backgroundColor: "transparent" }}>
                            {getTimeDifference(tweet?.createdAt || Date())}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="nodata" style={{ textAlign: "center" }}>
                      <Lottie
                        style={{ height: "25rem" }}
                        animationData={nomore}
                        loop={true}
                      />
                      <h1 style={{color:"white"}}>No Data Found</h1>
                    </div>
                  )}
                </div>
                </div>
              )}    
        </div>
      </div>
    </div>
  );
};

export default LikedVideos;
