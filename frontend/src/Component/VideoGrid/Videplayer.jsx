import React, { useEffect, useState, useMemo } from "react";
import "../../CSS/videoplayer.css";
import { VideoMethods } from "../../Server/config.js";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../contextApi/SidebarContext.jsx";
import { others } from "../../Server/others.js";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  FaPaperPlane,
  FaEllipsisV,
  FaTrash,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { useVideoList } from "../../contextApi/VideolistContext.jsx";
import { useLogin } from "../../contextApi/LoginContext.jsx";
import { useSelector, useDispatch } from "react-redux";
import { setVideoId } from "../../features/videoSlice.js";
import Lottie from "lottie-react";
import noCommentsAnimation from "../../assets/noComment.json";
import Like from "../../assets/Like.json";
import Bellicon from "../../assets/Bellicon.json";
import homeloader from "../../assets/homeloading.json";
import AuthService from "../../Server/auth.js";
import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa6";
import { IoCaretDownSharp } from "react-icons/io5";

function VideoPlayer() {
  const auth = new AuthService();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.userReducer.currentUser);
  const { login } = useLogin();
  const { videoList } = useVideoList();
  const { sidebarVisible } = useSidebar();
  const navigate = useNavigate();
  const other = new others();
  const [followed, setFollowed] = useState(false);
  const videomethod = new VideoMethods();
  const videoId = useSelector((state) => state.videoReducer.videoId);
  const [video, setVideo] = useState({});
  const [comments, setComments] = useState([]);
  const [totalResult, setResults] = useState(0);
  const [content, setcontent] = useState("");
  const [error, setError] = useState(null);
  const [showrecomm,setshowrecomm] = useState(true);
  const [prevId, setprevId] = useState("null");

  // all for comments
  const [editcontent, seteditcontent] = useState("");
  const [editid, seteditid] = useState(null);
  const [editinput, seteditinput] = useState(false);

  // for playlist
  const [playlist, setPlaylist] = useState(false);
  const [Playlists, setPlaylists] = useState([]);
  const [playlistvideos, setplaylistvideos] = useState([]);
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const [subbellani, setsubbellsni] = useState(false);
  const [suggestedVideo, setSuggestedVideo] = useState([]);
  const [page, setPage] = useState(0);
  const [hasmore, sethasmore] = useState(true);
  const [hiding,sethiding] = useState(true);

  const addvideoPlaylist = async () => {
    try {
      if (!login){
        throw new Error("Please Login !!!");
        
      }
      for (const playlist of playlistvideos) {
        const response = await other.addVideoToPlaylist({
          videoId: videoId,
          playlistId: playlist,
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setPlaylist(false);
    }
  };

  const fetchPlaylist = async () => {
    try {
      if (!login){
        throw new Error("Please login !!!");
      }
      const res = await other.getPlaylistByUserId({ userId: currentUser?._id });
      if (!res) {
        throw new Error("Unable to fetch playlist");
      }
      setPlaylists(res.data);
    } catch (error) {
      setError(error.message);
    }
  };
  const handlechanges = (e) => {
    seteditcontent(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      if (!login){
        throw new Error("Please Login !!!");
      }
      const response = await other.deleteComment({ commentId: id });
      if (!response) {
        throw new Error("Unable to Delete");
      }
      seteditid(null);
      setComments(comments.filter((comment) => comment._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOnChange = (e) => {
    setcontent(e.target.value);
  };
  const editcomment = async () => {
    try {
      if (!login){
        throw new Error("Please Login !!!");
      }
      const response = await other.updateComment({
        content: editcontent,
        commentId: editid,
      });
      if (!response) throw new Error("Unable to update comment");
      seteditid(null);
      return editcontent;
    } catch (error) {
      setError("Unable to update Comment");
      return null;
    }
  };

  useEffect(() => {
    if (animationPlayed || subbellani) {
      const timer = setTimeout(() => {
        setAnimationPlayed(false);
        setsubbellsni(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [animationPlayed, subbellani]);

  const addComment = async () => {
    try {
      if (!login){
        throw new Error("Please Login !!!");
      }
      const response = await other.addComment({ content, videoId });
      if (response) {
        setcontent("");
        fetchComments();
      } else {
        console.log("");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchVideo = async () => {
    try {
      const response = await videomethod.videoDetail({ videoId });
      if (!response) throw new Error("Unable to fetch video");
      try {
        const res = await auth.addWatchHistory({ videoId: videoId });
        if (!res) {
          throw new Error("Please Login get Track Update");
        }
      } catch (error) {
        console.log(error.message);
      }
      const v = response.data;
      setVideo(response.data);
      document.title = v.title.slice(0, Math.min(25, v.title.length)) + "...";
      if (login && response) {
        const followFetch = await other.issubscribed({
          channelId: v.owner._id,
        });
        setFollowed(followFetch.data.isSubscribed);
      }
    } catch (error) {
      setError("Error fetching video, please try again.");
      navigate("/");
    }
  };

  const fetchComments = async () => {
    try {
      const response = await other.getComment({ videoId, prevId });
      if (!response) throw new Error("Unable to fetch comments");
      const newComments = response.data[0];
      setprevId(response.data[1]);
      if (newComments.length > 0) {
        setComments((prev) => {
          const existingIds = new Set(prev.map((comment) => comment._id));
          const filteredComments = newComments.filter(
            (comment) => !existingIds.has(comment._id)
          );
          return [...prev, ...filteredComments];
        });
        setResults(response.totalResults);
      }
    } catch (error) {
      setError("Error fetching comments, please try again.", error);
    }
  };

  const toggleLike = async () => {
    try {
      if (!login){
        throw new Error("Please Login !!!");
      }
      const response = await other.toggleVideoLike({ videoId });
      if (!response) throw new Error("Unable to toggle like");
      setVideo((prev) => ({
        ...prev,
        likesCount:
          response.message === "Liked successfully"
            ? prev.likesCount + 1
            : prev.likesCount - 1,
      }));
      if (response.message === "Liked successfully") {
        setAnimationPlayed(true);
      } else {
        setAnimationPlayed(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleFollow = async () => {
    try {
      if (!login){
        throw new Error("Please Login !!!");
        
      }
      const response = await other.subscribe({ channelId: video.owner?._id });
      if (!response) throw new Error("Unable to toggle follow");

      setVideo((prev) => ({
        ...prev,
        subscribersCount:
          response.message === "Subscription Successful"
            ? prev.subscribersCount + 1
            : prev.subscribersCount - 1,
      }));

      setFollowed((prev) => !prev);
      if (response.message === "Subscription Successful") {
        setsubbellsni(true);
      } else {
        setsubbellsni(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await other.issubscribed({
          channelId: video.owner._id,
        });
        if (response) {
          setFollowed(response.data.isSubscribed);
        }
      } catch (error) {
        console.log("Error fetching subscription status:", error);
      }
    };

    if (login) {
      fetchSubscriptionStatus();
    }
  }, [video.owner?._id, login]);
  const fetchSuggestedVideo = async () => {
    try {
      if (!videoId && !hasmore) {
        alert("no");
        return;
      }

      const response = await videomethod.suggestedVideo({
        videoId: videoId,
        page: page,
      });
      console.log("data",response);
      

      if (response.data.length === 0) {
        sethasmore(false);
      } else {
        setSuggestedVideo((prev) => [...prev, ...response.data]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error.message);
      sethasmore(false);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
    setprevId("null");
    setSuggestedVideo([]); // Reset suggested videos on new videoId
    setPage(0); // Reset page
    sethasmore(true); // Reset load state
    fetchSuggestedVideo();
  }, [videoId]);
  useEffect(() => {
    fetchSuggestedVideo();
  }, []);

  const formattedDate = useMemo(() => {
    return video.createdAt
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
  }, [video.createdAt]);

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
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div
      className={`video-player-container extraout   ${
        sidebarVisible ? " sidebar-open" : ""
      }`}
      style={{ overflow: "hidden" }}
    >
      { login && playlist && (
        <div className="playlistList">
          <div className="innerplaylistbox">
            <div className="innerplaylistheading">
              <h3>PLAYLIST</h3>
              <FaTimes
                style={{ color: "red" }}
                onClick={() => setPlaylist((prev) => !prev)}
              />
            </div>
            <div
              className="innerplaylistlist"
              style={{ height: "60%", marginTop: "0.5rem" }}
            >
              {Playlists &&
                Playlists.map((Playlist) => {
                  return (
                    <div key={Playlist._id} className="playlistitem">
                      <div className="playlistselection">
                        <input
                          style={{ marginRight: "1rem" }}
                          type="checkbox"
                          onClick={() => {
                            setplaylistvideos((playlists) =>
                              playlists.includes(Playlist._id)
                                ? playlists.filter(
                                    (playlistid) => playlistid !== Playlist._id
                                  )
                                : [...playlists, Playlist._id]
                            );
                          }}
                        />
                        <label>{Playlist?.name}</label>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div
              className="selectboxsubmit"
              style={{ display: "flex", flexDirection: "column-reverse" }}
            >
              <button
                style={{
                  height: "2rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "transparent",
                  border: "1px solid white",
                  color: "red",
                }}
                type="button"
                onClick={() => addvideoPlaylist()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="videoboxleftside extraleftest "
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          overflow: "scroll",
          borderRight: "1px solid white",
        }}
      >
        <div
          className="video-player video_Controller-new   "
          style={{
            borderRight: "1px solid white",
            width: "100%",
            backgroundColor: "black",
          }}
        >
          <video
            className="video_Controller video_Controller-new   "
            src={video.videoFile}
            style={{ width: "100%" }}
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div
          className="video-container"
          style={{ width: "100%", backgroundColor: "black" }}
        >
          <div
            className="video-header"
            style={{ borderBottom: "1px solid white" }}
          >
            <h3 className="video-title">{video.title || "Undefined"}</h3>
            <p className="video-stats">
              {video.views} Views • At {formattedDate}
            </p>
            <div className="video-user">
              <img
                src={video.owner?.avatar || "/me.jpg"}
                alt="Profile Picture"
                className="user-pic"
              />
              <div>
                <p className="username">{video.owner?.fullName || "Unknown"}</p>
                <p className="followers">
                  {video.subscribersCount || "0"} Followers
                </p>
              </div>
              <button
                className={`follow-button ${
                  followed ? (login ? "follow-set" : "") : ""
                }`}
                onClick={() => {
                  toggleFollow();
                }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {followed ? (login ? "Followed" : "Follow") : "Follow"}

                {subbellani && (
                  <Lottie
                    animationData={Bellicon}
                    loop={true}
                    autoPlay={true}
                    onComplete={() => setsubbellsni(false)}
                    style={{ height: "2rem", width: "3rem", paddingLeft: "0" }}
                  />
                )}
              </button>
            </div>
            <p className="description">
              <span style={{ color: "red" }}>Description : </span>
              {video.description || ""}
            </p>
          </div>

          <div className="actions">
            <button className="like-button" onClick={toggleLike}>
              {!animationPlayed && <h6>👍 {video.likesCount || "0"}</h6>}
              {animationPlayed && (
                <Lottie
                  animationData={Like}
                  loop={false}
                  autoplay={true}
                  onComplete={() => setAnimationPlayed(false)} // Reset the animation state after it completes
                  style={{
                    zIndex: "999",
                    width: "2rem",
                    height: "2rem",
                    padding: "0",
                  }} // Adjust size as needed
                />
              )}
            </button>
            <button
              onClick={() => {
                setPlaylist((prev) => !prev);
                fetchPlaylist();
              }}
              className="save-button"
            >
              Save
            </button>
          </div>

          <div className="addcomment">
            <label htmlFor="commentin">Comment</label>
            <input
              type="text"
              name="commentin"
              id="commentin"
              value={content}
              onChange={handleOnChange}
            />
            <button
              className="comment-button"
              onClick={() => {
                if (login) {
                  addComment();
                } else {
                  setError("Please log in to comment.");
                }
              }}
            >
              <FaPaperPlane style={{ marginRight: "8px" }} />
            </button>
          </div>
          {/* 
            iddar judaga
          */}
          <div className="expand-section">
            <div className="ttt">
              <h6>{hiding?"Show":"Hide"} Comments</h6>
              {
                hiding?(
                  <IoCaretDownSharp style={{"cursor":"pointer"}} onClick={()=>sethiding((prev)=>!prev)} />
                ):(
                  <FaCaretUp style={{"cursor":"pointer"}}  onClick={()=>sethiding((prev)=>!prev)} />
                )
              }
              
            </div>
            {
              !hiding && (
                <div
            className="comments-section extra-comm"
            style={{ borderTop: "1px solid white", paddingBottom: "0" }}
          >
            {comments.length > 0 ? (
              <InfiniteScroll
                dataLength={comments.length}
                next={fetchComments}
                hasMore={comments.length < totalResult}
                loader={comments.length < totalResult?<Lottie animationData={homeloader}></Lottie>:<></>}
                className="custom-infinite-scroll"
                endMessage={
                  <p style={{ textAlign: "center", fontFamily: "monospace" }}>
                    <b> You've reached the end of the list! </b>
                  </p>
                }
              >
                {comments
                  .slice()
                  .reverse()
                  .map((comment) => {
                    const owner = comment.owner?.[0];
                    return (
                      <div key={comment._id} className="comment">
                        <img
                          src={owner?.avatar || "/me.jpg"}
                          alt={owner?.fullName || "Unknown"}
                          className="profile-pic"
                        />
                        <div className="comment-content">
                          <div className="content-info">
                            <p>
                              <strong>{owner?.fullName || "Unknown"}</strong>{" "}
                              {getTimeDifference(comment.createdAt)}
                            </p>
                            {editinput &&
                              editid !== null &&
                              editid === comment._id && (
                                <div style={{ display: "flex" }}>
                                  <label htmlFor="editcomment"></label>
                                  <input
                                    className="edit-input"
                                    type="text"
                                    value={editcontent}
                                    onChange={handlechanges}
                                  />
                                  <button
                                    style={{
                                      height: "1rem",
                                      display: "flex",
                                      justifyItems: "center",
                                      alignItems: "center",
                                      width: "max-content",
                                      margin: "2px",
                                      padding: "1px",
                                    }}
                                    onClick={async () => {
                                      const updatedContent =
                                        await editcomment();
                                      if (updatedContent) {
                                        setComments((prevComments) =>
                                          prevComments.map((com) =>
                                            com._id === comment._id
                                              ? {
                                                  ...com,
                                                  content: updatedContent,
                                                }
                                              : com
                                          )
                                        );
                                      }
                                    }}
                                  >
                                    <FaPaperPlane
                                      style={{ height: "0.5rem" }}
                                    />
                                  </button>
                                </div>
                              )}
                            {!editinput && <p>{comment.content || ""}</p>}
                            {editinput && comment._id !== editid && (
                              <p>{comment.content || ""}</p>
                            )}
                          </div>
                          {owner._id === currentUser._id && (
                            <div style={{ display: "flex" }} className="edit">
                              <FaEllipsisV
                                style={{
                                  marginLeft: "0.5rem",
                                  maxHeight: "10px",
                                }}
                                onClick={() => {
                                  seteditid((prev) =>
                                    prev === comment._id ? null : comment._id
                                  );
                                  seteditinput(false);
                                }}
                              />
                              {editid === comment._id && (
                                <div
                                  style={{ height: "0.4rem" }}
                                  className="optioncomment"
                                >
                                  <div
                                    className="editcomment"
                                    onClick={() => {
                                      seteditinput((prev) => !prev);
                                    }}
                                  >
                                    <FaEdit
                                      style={{
                                        paddingBottom: "0.1rem",
                                        height: "0.8rem",
                                      }}
                                    />
                                    Edit
                                  </div>
                                  <div
                                    className="deletecomment"
                                    onClick={() => handleDelete(comment._id)}
                                  >
                                    <FaTrash
                                      style={{
                                        paddingBottom: "0.1rem",
                                        height: "0.8rem",
                                      }}
                                    />
                                    Delete
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </InfiniteScroll>
            ) : (
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <Lottie
                  style={{ height: "20rem", width: "100%", objectFit: "cover" }}
                  animationData={noCommentsAnimation}
                  loop={true}
                  autoplay={true}
                />
                <h3 style={{ fontFamily: "cursive" }}>
                  Be First To Comment ...
                </h3>
              </div>
            )}
          </div>
              )
            }
          </div>
        </div>
      </div>

      <div
        className="suggested-videos extrasuggested  "
        style={{ height: "100%", overflowX: "hidden" }}
      >
        <div className="sideing  " onClick={ ()=>{
          sethiding(true);
          setshowrecomm((prev)=>!prev)
             }  }>
          <h3 >Suggested Videos</h3>
          <FaCaretDown style={{"marginBottom":"10px" }} size={40}/>
        </div>
        {
          showrecomm && (
            <>
              {suggestedVideo.length > 0 ? (
          <InfiniteScroll
            dataLength={suggestedVideo.length}
            next={fetchSuggestedVideo}
            hasMore={hasmore}
            loader={<Lottie animationData={homeloader}></Lottie>}
            className="custom-infinite-scroll"
          >
            {Array.isArray(suggestedVideo) &&
              suggestedVideo.map((vide) => (
                <div
                  key={vide?._id}
                  className="suggested-video-card"
                  onClick={() => {
                    if (vide?._id !== videoId) {
                      setComments([]);
                      setPage(0);
                      setSuggestedVideo([]);
                      setResults(0);
                      setprevId("null");
                      dispatch(setVideoId(vide?._id));
                    }
                  }}
                  style={{
                    backgroundColor: "transparent",
                    padding: "2px",
                    borderRadius: "0",
                    width: "100%",
                  }}
                >
                  <img
                    src={vide?.thumbnail}
                    alt="suggested video thumbnail"
                    className="suggested-cardthumbnail"
                  />
                  <div className="suggested-videocard-info">
                    <h4 className="suggested-videocard-title">{vide?.title}</h4>
                    <p className="suggested-videocrad-meta">
                      {vide?.views} Views • {getTimeDifference(vide?.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
          </InfiniteScroll>
        ) : (
          <></>
        )}
            </>
          )
        }
      </div>

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={() => setError(null)}>X</button>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
