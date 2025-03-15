import React, { useEffect, useState } from "react";
import "../CSS/likevideo.css";
import LongVideoCard from "../Component/VideoGrid/Searchvideocard.jsx";
import { useSelector, useDispatch } from "react-redux";
import { useSidebar } from "../contextApi/SidebarContext.jsx";
import { setVideoId } from "../features/videoSlice";
import { useNavigate } from "react-router-dom";
import AuthService from "../Server/auth.js";
import { FaTrash } from "react-icons/fa";
import Lottie from "lottie-react";
import loadings from "../assets/circleloading.json";
import nomore from "../assets/Nomorevideos.json";
const History = () => {
  const auth = new AuthService();
  const navigate = useNavigate();
  document.title = "StreamX-Histroy"
  const cuser = useSelector((state) => state.userReducer.currentUser);
  const dispatch = useDispatch();
  const { sidebarVisible } = useSidebar();
  const [user, setUser] = useState({ fullName: "Guest" });
  const [videoList, setVideolist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [slideIndex, setSlideIndex] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const changeSortOrder = () => {
    const sortedVideos = [...videoList].sort((a, b) => {
      const dateA = new Date(a?.updatedAt);
      const dateB = new Date(b?.updatedAt);
      return sortOrder === "Ascending" ? dateA - dateB : dateB - dateA;
    });
    setVideolist(sortedVideos);
    setSortOrder(sortOrder === "Ascending" ? "Descending" : "Ascending");
  };

  const onClickHandle = () => {
    dispatch(setVideoId(videoList[0]?._id));
    navigate("/key-video");
  };

  const deleteAllHistory = async () => {
    if (window.confirm("Are you sure you want to delete all history?")) {
      try {
        const response = await auth.deleteAllHistory();
        if (response?.data) {
          setVideolist([]);
        } else {
          throw new Error("Unable to delete history");
        }
      } catch (error) {
        console.error(error);
        setError("Failed to delete history.");
      }
    }
  };

  const fetchHistoryVideos = async () => {
    try {
      setLoading(true);
      const response = await auth.getHistory();
      if (response?.data) {
        const sortedByDate = [...response.data].sort(
          (a, b) => new Date(a?.updatedAt) - new Date(b?.updatedAt)
        );
        setVideolist(sortedByDate);
      } else {
        throw new Error("Unable to fetch videos");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch videos.");
    } finally {
      setLoading(false);
      setSlideIndex(null);
      setIsDeleting(false);
    }
  };

  const deleteHistoryVideo = async (videoId) => {
    setSlideIndex(null);
    setIsDeleting(true);
    try {
      const response = await auth.deleteHistory({ videoId });
      if (response) {
        const updatedList = videoList.filter((video) => video._id !== videoId);
        setVideolist(updatedList);
      } else {
        throw new Error("Unable to delete video from history");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to delete video.");
    } finally {
      setIsDeleting(false);
    }
  };

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
    fetchHistoryVideos();
  }, []);

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
          <img src={user.avatar ? user.avatar : "user.jpg"} alt="Profile" />
        </div>
        <div className="totalInfo">
          <div className="type">History</div>
          <div style={{ color: "red" }} className="user">
            {user.fullName ? user?.fullName : "Guest User"}
          </div>
          <div className="timeInfo">
            {videoList?.length || 0} videos, No views <br />
            Last updated{" "}
            {getTimeDifference(videoList[0]?.createdAt || new Date())}
          </div>
          {videoList?.length > 0 && (
            <div className="optionButton">
              <button onClick={() => onClickHandle()}>Play All</button>
              <button>Download</button>
            </div>
          )}
        </div>
      </div>
      <div className="likeContentInfo">
        <div className="options">
          <button onClick={changeSortOrder}>{sortOrder}</button>
          <button
            onClick={() => {
              deleteAllHistory();
            }}
            disabled={isDeleting}
          >
            Delete-History <FaTrash style={{ paddingLeft: "0.1rem" }} />
          </button>
        </div>
        <div className="contents">
          {error && <div className="error">{error}</div>}
          <div className="lists">
            {videoList?.length > 0 ? (
              videoList.map((video, index) => (
                <div
                  key={video._id}
                  className={`carding ${slideIndex === index ? "slide" : ""}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    overflowX: "scroll",
                  }}
                >
                  <div className="videoscarding" style={{ width: "100%" }}>
                    <LongVideoCard
                      videoId={video?._id}
                      title={video?.title}
                      channel={video?.owner[0]?.fullName}
                      views={video?.views}
                      timeAgo={getTimeDifference(video?.updatedAt)}
                      duration={video?.duration}
                      thumbnail={video?.thumbnail}
                    />
                  </div>
                  <div
                    className="deleting"
                    onClick={() => {
                      setSlideIndex(index);
                      deleteHistoryVideo(video._id);
                    }}
                    disabled={isDeleting}
                  >
                    Delete
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
                <h1>No Data Found</h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
