import React, { useEffect, useRef, useContext, useState } from "react";
import "../CSS/videoplayer.css";
import { SocketContext } from "../contextApi/SocketContext.jsx";
import { others } from "../Server/others.js";
import { VideoMethods } from "../Server/config.js";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPaperPlane } from "react-icons/fa";
import Lottie from "lottie-react";
import noCommentsAnimation from "../assets/noComment.json";
import { useSelector } from "react-redux";
import { MdOutlineVolumeUp } from "react-icons/md";
import { MdOutlineVolumeOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import NetflixLoader from "../Component/NetflixLoader.jsx";

function Live() {
  const other = new others();
  const navigate = useNavigate();
  const user = useSelector((state) => state.userReducer.currentUser);
  const services = new VideoMethods();
  const { roomId } = useParams();
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const [roomData, setroomData] = useState({});
  const [comments, setComments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [page, setpage] = useState(1);
  const [hasmore, sethasMore] = useState(true);
  const [option, setOption] = useState(false);
  const [message, setMessage] = useState("");
  const [Volume, setVolume] = useState(false);
  const [ending, setending] = useState(false);

  useEffect(() => {
    const handleEndMeeting = () => {
      setending(true);
      setTimeout(() => {
        setending(false);
        navigate("/");
      }, 5000);
    };

    socket.on("end-meeting", handleEndMeeting);
    return () => {
      socket.off("end-meeting", handleEndMeeting);
    };
  }, [socket]);

  const fetchHost = async () => {
    try {
      const stremmer = await other.stremmerData({
        roomId: roomId,
      });
      console.log("data", stremmer.data[0]);

      setroomData(stremmer.data[0]);
    } catch (error) {
      console.log("error",error.message);
    }
  };

  const toggleFollow = async () => {
    try {
      const response = await other.subscribe({
        channelId: roomData?.senderInfo?.[0]?._id,
      });
      setroomData((prev) => {
        const sub = prev?.isFollowing;
        const followers = prev?.followersCount;
        return {
          ...prev,
          isFollowing: !sub,
          followersCount: sub ? followers - 1 : followers + 1,
        };
      });
    } catch (error) {
      console.log("error",error.message);
    }
  };

  useEffect(() => {
    fetchHost();
  }, []);

  useEffect(() => {
    socket.emit("join-stream", { roomId });

    const handleOffer = async (offer) => {
      console.log("Checked offer received");
      await createAnswer(offer);
    };

    const handleIceCandidate = async (candidate) => {
      console.log("Received ICE Candidate", candidate);
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    socket.on("offer", handleOffer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.disconnect();
    };
  }, []);

  const createAnswer = async (offer) => {
    peerRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, 
        { urls: "stun:stun1.l.google.com:19302" }, 
        { urls: "stun:stun2.l.google.com:19302" }, 
        { urls: "stun:stun3.l.google.com:19302" }, 
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "turn:numb.viagenie.ca", credential: "muazkh", username: "webrtc@live.com" }
      ]
    });

    peerRef.current.ontrack = (event) => {
      console.log("Track event received:", event);
      const stream = event.streams[0];
      if (!stream || stream.getTracks().length === 0) {
        console.error("No tracks in the received stream!");
        return;
      }
      remoteVideoRef.current.srcObject = stream;
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate", event.candidate);
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer); // Corrected this line

    console.log("Checked answer");
    socket.emit("answer", { roomId, answer });
  };

  const fetchComments = async () => {
    try {
      const response = await other.fetchMessage({
        roomId: roomId,
      });
      setComments(response.data);
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    socket.on("receiving-message", (data2) => {
      console.log("New message received:", data2);
      setComments((prev) => [...prev, data2[0]]);
    });
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") {
      return;
    }
    socket.emit("send-message", {
      message: message,
      roomId: roomId,
      userId: user?._id,
    });
    setMessage("");
  };

  const fetchSuggestedVideo = async () => {
    try {
      const pages = page - 1;
      const response = await services.generalChoice({
        description: roomData?.description,
        page: pages,
      });
      if (response.data.length === 0) {
        sethasMore(false);
        return;
      }
      setVideos((prev) => [...prev, ...response.data]);
      setpage((prev) => prev + 1);
      sethasMore(true);
    } catch (error) {
      console.error("Unable to fetch recommended videos", error);
      sethasMore(false);
    }
  };

  useEffect(() => {
    fetchSuggestedVideo();
  }, []);

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

  if (ending) {
    return (
      <div>
        harsh
        <NetflixLoader message={`Thanks For Your Support`} rgb={{
        r: 100,
        g: 100,
        b: 100
      }}/>
      </div>
    );
  }

  return (
    <div>
      harsh
      <div
      className="video-player-container extracss"
      style={{ overflow: "hidden" }}
    >
      <div
        className="videoboxleftside leftother"
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
          className="video-player"
          style={{
            position: "relative",
            borderRight: "1px solid white",
            width: "100%",
            backgroundColor: "black",
          }}
        >
          <video
            className="video_Controller"
            ref={remoteVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%" }}
          >
            Your browser does not support the video tag.
          </video>

          {/* Volume Control Positioned at Bottom-Right */}
          <div
            className="volumecontrol"
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              background: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              setVolume((prev) => {
                const newVol = !prev;
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.muted = !newVol;
                }
                return newVol;
              });
            }}
          >
            {Volume ? (
              <MdOutlineVolumeUp size={25} />
            ) : (
              <MdOutlineVolumeOff size={25} color="red" />
            )}
          </div>
        </div>
        <div
          className="video-container"
          style={{ width: "100%", backgroundColor: "black" }}
        >
          <div
            className="video-header"
            style={{ borderBottom: "1px solid white" }}
          >
            <div
              className="video-user"
              style={{ display: "flex", flexDirection: "row" }}
            >
              <img
                src={roomData?.senderInfo?.[0]?.avatar || "/me.jpg"}
                alt="Profile Picture"
                className="user-pic"
              />
              <div>
                <p className="username">
                  {roomData ? roomData?.senderInfo?.[0]?.fullName : "Unknown"}
                </p>
                <p className="followers">
                  {roomData ? roomData?.followersCount : "0"} Followers
                </p>
              </div>
              <button
                onClick={() => {
                  toggleFollow();
                }}
                className={`follow-button  ${
                  roomData?.isFollowing ? "follow-set" : ""
                }`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {roomData?.isFollowing ? "Followed" : "Follow"}
              </button>
              <p style={{ color: "red" }} className="video-stats statesnew">
                {roomData?.viewer?.length} Views • Live
              </p>
            </div>
            <h3 style={{ marginTop: "8px" }} className="video-title">
              {roomData?.title || "Undefined"}
            </h3>
            <p className="descriptions">
              <span style={{ color: "red" }}>Description : </span>
              {roomData?.description || ""}
            </p>
          </div>
        </div>
      </div>
      {/* 
        suggested side right
      */}

      <div className="hot">
        <div
          className={`${option ? "recc-option" : "recc"}`}
          style={{
            padding: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() => {
              setOption(!option);
            }}
          >
            <div
              style={{
                paddingLeft: "5px",

                fontFamily: "sans-serif",
              }}
            >
              Suggested Video
            </div>
            <div>
              <IoMdArrowDropdown size={40} />
            </div>
          </div>
          {option && (
            <div
              className="suggested-videos livesuggested"
              style={{
                height: "100%",
                overflowX: "hidden",
                borderTop: "3px solid white",
              }}
            >
              {videos.length > 0 ? (
                <InfiniteScroll
                  dataLength={videos.length + 1}
                  next={fetchSuggestedVideo}
                  hasMore={hasmore}
                  loader={<div>loading</div>}
                  className="custom-infinite-scroll"
                >
                  {Array.isArray(videos) &&
                    videos.map((vide) => (
                      <div
                        key={vide?._id}
                        className="suggested-video-card"
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
                          <h4 className="suggested-videocard-title">
                            {vide?.title}
                          </h4>
                          <p className="suggested-videocrad-meta">
                            {vide?.views} Views •{" "}
                            {getTimeDifference(vide?.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                </InfiniteScroll>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
        <div className="commentbodys">
          {!option && (
            <>
              <div className="addcomments">
                <label htmlFor="commentin">Comment</label>
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                  }}
                >
                  <input
                    type="text"
                    name="commentin"
                    id="commentin"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <button className="comment-button" type="submit">
                    <FaPaperPlane style={{ marginRight: "8px" }} />
                  </button>
                </form>
              </div>
              <div
                className="comments-section"
                style={{ borderTop: "1px solid white", paddingBottom: "0" }}
              >
                {comments.length > 0 ? (
                  <>
                    {comments
                      .slice()
                      .reverse()
                      .map((comment, index) => {
                        const owner = comment.senderInfo?.[0];
                        return (
                          <div
                            key={index}
                            className="comment"
                            style={{
                              justifyContent:
                                comment?.senderInfo?.[0]?._id === user?._id
                                  ? "end"
                                  : "start",
                            }}
                          >
                            <>
                              {comment.senderInfo?.[0]?._id !== user?._id ? (
                                <>
                                  <img
                                    src={owner?.avatar || "/me.jpg"}
                                    alt={owner?.fullName || "Unknown"}
                                    className="profile-pic"
                                  />
                                  <div className="comment-content">
                                    <div className="content-info">
                                      <p>
                                        <strong>
                                          {owner?.fullName || "Unknown"}
                                        </strong>{" "}
                                        <span>
                                          {getTimeDifference(comment.createdAt)}
                                        </span>
                                      </p>
                                      <p className="text-truncate">{comment?.message || ""}</p>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="comment-content">
                                    <div className="content-info">
                                      <p>
                                        <strong>
                                          {owner?.fullName || "Unknown"}
                                        </strong>{" "}
                                        <span>
                                          {getTimeDifference(comment.createdAt)}
                                        </span>
                                      </p>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "end",
                                        }}
                                      >
                                        <p>{comment?.message || ""}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <img
                                    src={owner?.avatar || "/me.jpg"}
                                    alt={owner?.fullName || "Unknown"}
                                    className="profile-pic"
                                  />
                                </>
                              )}
                            </>
                          </div>
                        );
                      })}
                  </>
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
                      style={{
                        height: "20rem",
                        width: "100%",
                        objectFit: "cover",
                      }}
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
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default Live;
