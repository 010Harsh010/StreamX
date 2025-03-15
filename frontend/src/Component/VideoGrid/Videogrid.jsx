import { useEffect, useState } from "react";
import "../../CSS/videogrid.css";
import { VideoMethods } from "../../Server/config.js";
import InfiniteScroll from "react-infinite-scroll-component";
import VideoCard from "./Videocard.jsx";
import { useSidebar } from "../../contextApi/SidebarContext.jsx";
import { useVideoList } from "../../contextApi/VideolistContext.jsx";
import Lottie from "lottie-react";
import nomore from "../../assets/Nomorevideos.json";
import { Link } from "react-router-dom";
import homeloading from "../../assets/homeloading.json";
import { useLogin } from "../../contextApi/LoginContext.jsx";


const VideoGrid = () => {
  const { updateVideoList } = useVideoList();
  const { sidebarVisible } = useSidebar();
  const videoClass = new VideoMethods();
  document.title = "StreamX-Home"
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [prevId, setPrevID] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [choice, setChoice] = useState("Home");
  const { login  } = useLogin();
  


  const content = ["Home", "Recommended", "Music", "Games", "Anime", "Study", "Morning walk"];

  // Common function to reset states
  const resetState = () => {
    setVideos([]);
    setPage(1);
    setPrevID(null);
    setTotalResults(0);
    setHasMore(true);
  };

  // Fetch Videos (Home)
  const fetchVideos = async () => {
    if (choice !== "Home") return; // Prevent accidental calls
    try {
      setLoading(true);
      const response = await videoClass.getallvideo({ page, prevId });

      if (response.data[0].length === 0) {
        setHasMore(false);
        return;
      }

      setVideos((prevVideos) => [...prevVideos, ...response.data[0]]);
      setTotalResults((prevTotal) => prevTotal + response.data[0].length);
      setPrevID(response.data[1]);
      setPage((prevPage) => prevPage + 1);
      updateVideoList(response.data[0]);
    } catch (error) {
      console.error("Unable to fetch more videos", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchgeneralChoice = async () => {
    try {
      setLoading(true);
      const pages = page-1;
      const response = await videoClass.generalChoice({"description":choice,"page":pages});
      if (response.data.length === 0) {
        setHasMore(false);
        return;
      }
      setVideos((prev) => [...prev, ...response.data]);
      setTotalResults(response.data.length);
      setPage((prev) => prev + 1);
      setHasMore(true);
    } catch (error) {
      console.error("Unable to fetch recommended videos", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }
  // Fetch Recommendations
  const fetchChoice = async () => {
    if (choice !== "Recommended") return; // Prevent unnecessary calls
    try {
      setLoading(true);
      const pages = page-1;
      const response = await videoClass.fetchRecommendation({"page":pages});
      if (response.data.length === 0) {
        setHasMore(false);
        return;
      }
      setVideos((prev) => [...prev, ...response.data]);
      setTotalResults(response.data.length);
      setPage((prev) => prev + 1);
      setHasMore(true);
    } catch (error) {
      console.error("Unable to fetch recommended videos", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (item) => {

    setPrevID(null);
    setVideos([]);
    setTotalResults(0);
    setHasMore(true);
    setPage(1);
    setChoice(item);
    resetState();
  };

  useEffect(() => {
    if (choice === "Home") {
      fetchVideos();
    } else if (choice === "Recommended") {
      fetchChoice();
    }else{
      fetchgeneralChoice();
    }
  }, [choice]);

  function getTimeDifference(dateString) {
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
  }


  return (
    <div className={`mainBox ${sidebarVisible ? "sidebar-open" : ""}`}>
      <div className="content">
        <div className="tweetspagging" style={{ marginTop: "5rem", display: "flex", width: "100%", height: "10px", alignItems: "flex-end", flexDirection: "row", justifyContent:"center" }}>
          <div className="recommendationBox">
            {content.map((item, index) => (
              <>
              {
                (!login && item==="Recommended")?(
                  <></>
                ):
                <div onClick={() => handleCategoryClick(item)} key={index} className="inner-choice">
                <h6>{item}</h6>
              </div>
              }
              </>
              
            ))}
          </div>
          <Link to="/tweets"  style={{ width: "150px" }} className="titi">
            <div className="selectingtweet" style={{ color: "white", display: "flex", height: "30px", alignItems:"center", flexDirection: "row", width: "150px","justifyContent":"center" }}>
              Show_Tweets
            </div>
          </Link>
        </div>

        {videos.length > 0 ? (
          <InfiniteScroll
            dataLength={videos.length}
            next={choice === "Home" ? fetchVideos :choice==="Recommended"?fetchChoice:fetchgeneralChoice}
            hasMore={hasMore}
            endMessage={<div>
              End
            </div>}
            loader={hasMore?<Lottie style={{"height":"40px"}} animationData={homeloading}></Lottie>:<></>}
            className="custom-infinite-scroll"
          >
            <div className="video-grid">
              {videos.map((video, index) => (
                <VideoCard
                  key={index}
                  thumbnail={video.thumbnail}
                  title={video.title}
                  views={video.views}
                  duration={video.duration}
                  owner={video.owner}
                  videoId={video._id}
                  uploadedAt={getTimeDifference(video.createdAt)}
                  videoFile={video?.videoFile}
                />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="nodata" style={{ textAlign: "center", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "5rem" }}>
            <Lottie style={{ height: "25rem" }} animationData={nomore} loop={true} />
            <h1>No Data Found</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGrid;
