import React, { useRef, useEffect, useContext, useState } from "react";
import VideoBox from "../Component/VideoBox.jsx";
import "../CSS/live.css";
import { SocketContext } from "../contextApi/SocketContext.jsx";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoSendOutline } from "react-icons/io5";
import { others } from "../Server/others.js";
import { useNavigate } from "react-router-dom";
import NetflixLoader from "../Component/NetflixLoader.jsx";

function GoLive() {
  const user = useSelector((state) => state?.userReducer?.currentUser);
  const startData = useSelector((state) => state.roomReducer.roomData);
  const navigate = useNavigate();
  const service = new others();
  const [mic, setMic] = useState(true);
  const [vid, setVid] = useState(true);
  const { roomId, type } = useParams();
  const [data, setData] = useState();
  const { socket } = useContext(SocketContext);
  const [message, setMessage] = useState("");
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const strem = useRef(null);
  const [comments, setcomments] = useState([]);
  const screenStreamRef = useRef(null);
  const camStreamRef = useRef(null);
  const [screening, setScreening] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [ending, setEnding] = useState(false);
  const [homemessage, sethomemessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await service.fetchMessage({
          roomId: roomId,
        });

        setcomments(messages.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    sethomemessage("Going for the live Stremming");
    socket.emit("start-stream", {
      roomId: roomId,
      userId: user?._id,
      title: startData?.title,
      description: startData?.description,
      type: type,
    });

    navigator.mediaDevices
      .getUserMedia({ video: vid, audio: mic })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        strem.current = stream;
        // checked 1
      });

    socket.on("viewer-joined", (viewerId) => {
      console.log("viewer joined", viewerId);
      if (!peerConnections.current[viewerId]) {
        const peer = createPeer(viewerId, strem.current);
        peerConnections.current[viewerId] = peer;
        setUserCount((prev) => prev + 1);
        // console.log("peer",peerConnections.current[viewerId]);
      }
    });

    socket.on("user-connected", (newRoom) => {
      setData(newRoom);
    });

    socket.on("answer", ({ answer, viewerId }) => {
      console.log("checked answer");
      peerConnections.current[viewerId]?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", ({ candidate, viewerId }) => {
      peerConnections.current[viewerId]?.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });
    return () => {
      Object.values(peerConnections.current).forEach((peer) => peer.close());
      peerConnections.current = {};
    };
  }, [user?._id]);

  const createPeer = (viewerId, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: import.meta.env.VITE_STUN_URL }, 
        { 
          urls: import.meta.env.VITE_TURN_URL,
          username: import.meta.env.VITE_USERNAME,
          credential: import.meta.env.VITE_CREDENTIAL
        }],
    });

    try {
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    } catch (error) {
      console.log(error.message);
    }

    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      console.log("checked offer send");
      socket.emit("offer", { roomId, viewerId, offer });
    });

    // checked 3
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("sending events", event.candidate);
        socket.emit("ice-candidate", {
          roomId,
          viewerId,
          candidate: event.candidate,
        });
      }
    };

    return peer;
  };

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

    function endcall() {
    sethomemessage("Ended Live Stremming");
    setEnding(true);
    if (peerConnections.current[roomId]) {
      peerConnections.current[roomId].close();
      delete peerConnections.current[roomId];
    }

    if (strem.current) {
      strem.current.getTracks().forEach((track) => track.stop());
      strem.current = null;
    }
    socket.off("offer");
    socket.off("ice-candidate");

    socket.emit("call-ended", roomId);
    socket.disconnect();
    setTimeout(() => {
      setEnding(false);
      navigate("/");
    }, 4000);
  }

  
  async function toggleScreenShare() {
    if (!screening) {
      console.log("Switching to Screen Share...");

      if (!screenStreamRef.current) {
        screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
          video: vid,
          audio: mic,
        });
      }

      updateStream(screenStreamRef.current);
      camStreamRef.current = null;
      screenStreamRef.current.getVideoTracks()[0].onended = () => {
        camStreamRef.current = null;
        toggleScreenShare();
      };
      setScreening(true);
    } else {
      console.log("Switching back to Webcam...");

      if (!camStreamRef.current) {
        camStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: vid,
          audio: mic,
        });
      }

      updateStream(camStreamRef.current);
      screenStreamRef.current = null;
      setScreening(false);
    }
  }

  function updateStream(newStream) {
    if (!newStream) return;

    const newVideoTrack = newStream.getVideoTracks()[0];

    // Replace track in all peer connections
    Object.values(peerConnections.current).forEach((peer) => {
      const senders = peer.getSenders();
      senders?.forEach((sender) => {
        if (sender.track?.kind === "video") {
          sender
            .replaceTrack(newVideoTrack)
            .catch((error) => console.error("Error replacing track:", error));
        }
      });
    });
    localVideoRef.current.srcObject = newStream;
    if (strem.current) {
      strem.current.getTracks().forEach((track) => track.stop());
    }
    strem.current = newStream;
  }
  useEffect(() => {
    socket.on("user-disconnected", () => {
      setUserCount((prev) => {
        return prev - 1;
      });
    });
  }, [socket]);

  useEffect(() => {
    socket.on("receiving-message", (data2) => {
      console.log("New message received:", data2);
      setcomments((prev) => [...prev, data2[0]]);
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

  const changeMic = () => {
    setMic((prev) => {
      const newMicState = !prev;
      strem.current.getAudioTracks().forEach((track) => {
        track.enabled = newMicState;
        Object.values(peerConnections.current).forEach((peer) => {
          const sender = peer
            .getSenders()
            .find((s) => s.track.kind === "audio");
          if (sender) sender.replaceTrack(track);
        });
      });
      return newMicState;
    });
  };

  const changeVideo = () => {
    setVid((prev) => {
      const newVidState = !prev;
      strem.current.getVideoTracks().forEach((track) => {
        track.enabled = newVidState;
        Object.values(peerConnections.current).forEach((peer) => {
          const sender = peer
            .getSenders()
            .find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(track);
        });
      });
      return newVidState;
    });
  };

  if (ending) {
    return (
      <div>
        harsh
        <NetflixLoader message={"Thanks For Contributing"} rgb={{
        r: 100,
        g: 100,
        b: 100
      }}/>
      </div>
    );
  }
  return (
    <div className="videoouter-container">
      <div className="main-content">
        <div
          className="outerlivebox"
          style={{ borderRight: "1px solid white" }}
        >
          <div className="l-video-container">
            <VideoBox
              endcall={endcall}
              localVideoRef={localVideoRef}
              mic={mic}
              vid={vid}
              changeMic={changeMic}
              changeVideo={changeVideo}
              toggleScreenShare={toggleScreenShare}
            />
          </div>
        </div>

        <div className="comment-container">
          <div
            className="live-description"
            style={{ borderBottom: "1px solid white" }}
          >
            <div
              style={{
                height: "40px",
                width: "100%",
                display: "flex",
                flexDirection: "row",
              }}
            >
              <div
                style={{
                  height: "50px",
                  width: "50px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={user?.avatar}
                  alt="profile"
                  className="owner-current"
                  style={{
                    objectFit: "cover",
                    height: "50px",
                    width: "50px",
                    padding: "5px",
                  }}
                />
              </div>
              <div className="live-info" style={{ width: "75%" }}>
                <div style={{ fontSize: "15px" }} className="nammings">
                  {user?.fullName}
                  <h6 style={{ color: "gray" }}>{user?.email}</h6>
                </div>
              </div>
              <div style={{ width: "20%" }}>Live {userCount} Users</div>
            </div>
            <div
              className="innerinfolive"
              style={{
                fontSize: "20px",
                display: "flex",
                gap: "5px",
                alignItems: "center",
                color: "gray",
              }}
            >
              Title :{" "}
              <h5
                style={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                {startData?.title || " Un-Titled"}
              </h5>
            </div>
            <div
              className="discri"
              style={{
                height: "60px",
                width: "100%",
                overflow: "scroll",
                marginLeft: "5px",
              }}
            >
              <div style={{ color: "red" }}>Description :</div>{" "}
              {startData?.description}
            </div>
          </div>
          <div
            style={{
              marginTop: "10px",
              height: "60px",
              display: "flex",
              color: "red",
              fontSize: "20px",
            }}
          >
            <span className="anime">•</span> Live Comments
          </div>
          <div className="comments-sections">
            <form
              onSubmit={handleSubmit}
              className="inner-chats"
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: "10px",
              }}
            >
              <input
                placeholder="Send Message"
                onChange={(event) => setMessage(event.target.value)}
                value={message}
                type="text"
                style={{ width: "90%" }}
              />
              <button
                type="submit"
                style={{
                  width: "10%",
                  height: "100%",
                  backgroundColor: "black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <IoSendOutline size={30} color="white" />
              </button>
            </form>

            <div className="ouetr-commentlive">
              {Array.isArray(comments) &&
                comments
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
                                  <p>{comment?.message || ""}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="comment-content description">
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
                                  className="comment-editing"
                                    style={{
                                      display: "flex",
                                      justifyContent: "end",
                                    }}
                                  >
                                    <p className="multi-line">{comment?.message || ""}</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoLive;
