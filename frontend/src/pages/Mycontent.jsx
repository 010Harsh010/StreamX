import React, { useState, useEffect, useRef } from "react";
import "../CSS/updatepage.css";
import { useSidebar } from "../contextApi/SidebarContext";
import { VideoMethods } from "../Server/config";
import { useSelector } from "react-redux";
import { others } from "../Server/others.js";
import InfiniteScroll from "react-infinite-scroll-component";
import Searchvideocard from "../Component/VideoGrid/Searchvideocard.jsx";
import { useNavigate } from "react-router-dom";
import nodata from "../assets/Nomorevideos.json";
import {
  FaTimes,
  FaEllipsisV,
  FaPaperPlane,
  FaTrash,
  FaEdit,
  FaGlobe,
} from "react-icons/fa";
import Lottie from "lottie-react";
import loadings from "../assets/circleloading.json";
const Content = () => {
  const navigate = useNavigate();
  const { sidebarVisible } = useSidebar();
  const service = new VideoMethods();
  const other = new others();
  const user = useSelector((state) => state.userReducer.currentUser);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prevId, setPrevId] = useState("null");
  const [data, setdata] = useState([]);
  const [type, settype] = useState("videos");
  const [totalResults, setTotalResults] = useState(0);
  const [sub, setsub] = useState({});
  const [editable, seteditable] = useState(false);
  const [editid, seteditid] = useState(null);
  const [updatedata, setupdatedata] = useState({});
  const [editcomponent, seteditcomponent] = useState(false);
  const nameRef = useRef();
  const descriptionRef = useRef();
  const videoref = useRef();
  const thumbnailref = useRef();

  const publishvideo = async (id) => {
    try {
      const response = await service.publishVideo({ videoId: id });
      if (!response) {
        throw new Error("Unable to Publish/Unpublish Video");
      }
    } catch (error) {
      console.log(error);
    } finally {
      seteditcomponent(false);
      seteditid(null);
    }
  };
  const deletevideo = async (id) => {
    try {
      const response = await service.deleteVideo({ videoid: id });
      if (!response) {
        throw new Error("Unable to delete Video");
      }
      const newdata = data.filter((item) => item.id !== id);
      setdata(newdata);
    } catch (error) {
      console.log(error);
    } finally {
      seteditable(false);
      seteditid(null);
    }
  };
  const updatevideo = async (id) => {
    try {
      seteditcomponent(false);
      const response = await service.updateVideo({
        title: nameRef.current.value,
        description: descriptionRef.current.value,
        videoFile: videoref.current.files[0],
        thumbnail: thumbnailref.current.files[0],
        videoid: id,
      });
      if (!response) {
        throw new Error("Unable to edit video");
      }
      setdata((prev) =>
        prev.map((video) =>
          video.id === id
            ? {
                ...video,
                title: response.data.title,
                description: response.data.description,
                thumbnail: response.data.thumbnail,
                videoFile: response.data.videoFile,
                duration: response.data.duration,
                views: response.data.views,
                likes: response.data.likes,
              }
            : video
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      seteditcomponent(false);
      navigate(0);
    }
  };
  const updatePlaylist = async () => {
    try {
      if (nameRef === "" || descriptionRef === "") {
        throw new Error("Please fill all fields");
      }
      const response = await other.updatePlaylist({
        name: nameRef.current.value,
        description: descriptionRef.current.value,
        playlistId: updatedata._id,
      });
      setdata((prev) =>
        prev.map((playlist) => {
          if (playlist._id === updatedata._id) {
            return {
              ...playlist,
              name: nameRef.current.value,
              description: descriptionRef.current.value,
            };
          }
          return playlist;
        })
      );
      setupdatedata({});
      seteditcomponent(false);
      seteditid(null);
      if (!response) {
        throw new Error("Unable to updtate Playlist");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const deletePlaylistVideo = async () => {
    try {
      const response = await other.removeVideoPlaylist({
        videoId: editid,
        playlistId: updatedata._id,
      });

      if (!response) {
        throw new Error("Unable to delete Playlist");
      }

      setupdatedata((prevData) => ({
        ...prevData,
        videosInfo: prevData.videosInfo.filter((video) => video._id !== editid),
      }));
      setdata((prevData) =>
        prevData.map((playlist) => {
          return {
            ...playlist,
            videosInfo: playlist.videosInfo.filter(
              (video) => video._id !== editid
            ),
            videos: playlist.videos.filter((video) => video !== editid),
          };
        })
      );
    } catch (error) {
      console.error(
        "Error deleting video from playlist:",
        error.message || error
      );
    } finally {
      seteditid(null);
      seteditable(false);
    }
  };

  const deletePlaylist = async () => {
    try {
      const response = await other.deletePlaylist({
        playlistId: updatedata._id,
      });
      if (!response) {
        throw new Error("Unabe to fetch Playlist.");
      }
      setdata((prev) =>
        prev.filter((playlist) => playlist._id !== updatedata._id)
      );
      seteditable(false);
      seteditcomponent(false);
      setupdatedata({});
    } catch (error) {
      console.log(error);
    }
  };

  const deletetweet = async () => {
    try {
      const response = await other.deleteTweet({ tweetId: editid });
      if (!response) {
        throw new Error("Unable to delete tweet");
      }
      const newdata = data.filter((tweet) => tweet._id !== editid);
      setdata(newdata);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      if (!owner._id) {
        console.warn("Owner ID is missing");
        return;
      }

      // Fetch the playlist data
      const response = await other.getPlaylistByUserId({ userId: owner._id });

      // Ensure the response structure is correct
      if (!response || !response.data) {
        throw new Error("Invalid response data");
      }
      setdata(response.data);
      setTotalResults(response.data.length);
    } catch (error) {
      console.error("Error fetching playlist:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const onChangeHandle = (e) => {
    setupdatedata(e.target.value);
  };
  const edittweet = async (id) => {
    try {
      const response = await other.updatetweet({
        content: updatedata,
        tweetId: id,
      });
      if (!response) {
        throw new Error("Unable to Update tweet");
      }
      data.map((tweet) => {
        if (tweet._id === id) {
          tweet.content = updatedata;
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      seteditable(false);
      seteditid(null);
      setupdatedata("");
    }
  };

  const fetchsub = async () => {
    try {
      setLoading(true);
      if (!owner?._id) {
        return;
      }
      const response = await other.allsubdetail({ id: owner._id });
      if (!response) {
        throw new Error("Unable to fetch Sub details");
      }
      // console.log(response.data);
      setsub(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchVideos = async (reset = false) => {
    try {
      if (!owner?._id) return;

      const currentPrevId = reset ? "null" : prevId;

      const response = await service.getVideoList({
        lastId: currentPrevId,
        userId: owner._id,
      });

      if (!response) {
        throw new Error("Unable to Fetch Videos");
      }
      if (!response.data[0]) {
        throw new Error("No Videos Avalilable");
      }
      const videos = response.data[0];
      setPrevId(response.data[1]);
      setdata((prev) => [...prev, ...videos]);
      setTotalResults((prev) => prev + videos.length);
    } catch (error) {
      console.log("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTweets = async (reset = false) => {
    try {
      if (!owner?._id) return;
      const currentPrevId = reset ? "null" : prevId;
      const response = await other.userTweet({
        prevId: currentPrevId,
        userId: owner._id,
      });
      if (!response) {
        throw new Error("Unable to Fetch Tweets");
      }
      // console.log(response.data["nextPrevId"]);
      if (!response.data["tweets"]) {
        throw new Error("No Tweets Avalilable");
      }
      const tweets = response.data["tweets"];
      setPrevId(response.data["nextPrevId"]);
      setdata((prev) => [...prev, ...tweets]);
      setTotalResults((prev) => prev + tweets.length);
    } catch (error) {
      console.log("Error fetching tweets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      if (!owner?._id) return;
      const response = await other.totalSubscribed({
        channelId: owner._id,
      });
      if (!response) {
        throw new Error("Unable to Fetch Subscribed Data");
      }
      const subscribed = response.data;
      setdata(subscribed);
      setTotalResults(subscribed.length);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      setOwner(user);
      fetchsub();
    }
  }, [user]);

  useEffect(() => {
    if (owner?._id) {
      setLoading(true);
      setPrevId("null");
      setdata([]);
      setTotalResults(0);
      setupdatedata({});
      seteditcomponent(false);
      seteditid(null);
      fetchsub();
      if (type === "videos") {
        fetchVideos(true);
      } else if (type === "playlist") {
        fetchPlaylist();
      } else if (type === "tweets") {
        fetchTweets(true);
      } else {
        fetchFollowing();
      }
    }
    setLoading(true);
  }, [type, owner]);

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

  const togglefollow = async (id) => {
    setLoading(true);
    try {
      const response = await other.subscribe({ channelId: id });
      if (!response) {
        throw new Error("Unable to ToggleSubscribe");
      }
      fetchFollowing();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
  } else {
    return (
      <div className="usecontent-bodycontainer">
        <div className={`usecontent-main ${sidebarVisible && `visibleshift`}`}>
          <div className="usecontent-header" style={{ position: "sticky" }}>
            <div className="usecontent-coverimage">
              <img
                src={owner?.coverImage || owner?.avatar}
                style={{ marginTop: "5rem", height: "15rem" }}
                alt="Cover"
              />
            </div>
            <div className="usecontent-profile">
              <div className="usecontent-profile-pic">
                <img src={owner?.avatar} alt="Profile" />
              </div>

              <div className="usecontent-profile-info">
                <h1>{owner?.fullName}</h1>
                <p>{owner?.email}</p>
                <p>
                  {sub.subscribersCount ? sub.subscribersCount : 0} Subscribers
                  • {sub.subscribedCount ? sub.subscribedCount : 0} Subscribed
                </p>
              </div>
            </div>
          </div>

          <div className="usecontent-tabs" style={{ position: "sticky" }}>
            <button onClick={() => settype("videos")}>Videos</button>
            <button onClick={() => settype("playlist")}>Playlist</button>
            <button onClick={() => settype("tweets")}>Tweets</button>
            <button onClick={() => settype("subscribed")}>Following</button>
          </div>

          <div className="usecontent-content" style={{ padding: "0" }}>
            {type === "tweets" && (
              <div className="usecontent-post">
                <InfiniteScroll
                  dataLength={data.length}
                  next={() => {
                    if (!loading) fetchVideos();
                  }}
                  hasMore={data.length !== totalResults}
                  loader={<h2>Loading.....</h2>}
                  className="custom-infinite-scroll"
                >
                  {data.length > 0 ? (
                    data.map((tweet) => (
                      <div key={tweet._id} className="usecontent-post">
                        <div>
                          <div className="usecontent-post-header">
                            <img src={tweet.owner?.avatar} alt="User" />
                            <div className="usecontent-post-info">
                              <p>
                                {tweet.owner?.fullName} •{" "}
                                {getTimeDifference(tweet.createdAt)}
                                <FaEllipsisV
                                  onClick={() => {
                                    setupdatedata("");
                                    seteditid(tweet._id);
                                    seteditable((prev) => !prev);
                                  }}
                                  className="icon-options"
                                />
                              </p>
                              {(tweet._id !== editid || !editable) && (
                                <p>{tweet.content}</p>
                              )}
                              {editable && editid === tweet._id && (
                                <div className="sa-edit-container" style={{display:"flex",flexDirection:"row"}}>
                                  <input
                                    onChange={(e) => onChangeHandle(e)}
                                    name="edittweet"
                                    value={updatedata}
                                    type="text"
                                    className="edit-input"
                                  />
                                  <div
                                    onClick={() => edittweet(tweet._id)}
                                    className="icon-send"
                                  >
                                    <FaPaperPlane style={{marginLeft:"0.5rem",marginRight:"0.5rem"}}/>
                                  </div>
                                  <div
                                    onClick={() => deletetweet(tweet._id)}
                                    className="delete-container"
                                    style={{display:"flex",flexDirection:"column"}}
                                  >
                                    <FaTrash className="icon-trash" />
                                    <h5>Delete</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="usecontent-post-stats">
                            <span>👍 {tweet.likeCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="nodataend" style={{ textAlign: "center" }}>
                      <Lottie
                        style={{ height: "25rem" }}
                        animationData={nodata}
                        loop={true}
                      />
                      <h1>No Data Found</h1>
                    </div>
                  )}
                </InfiniteScroll>
              </div>
            )}
            {type === "videos" && (
              <div className="custom-infinite-scroll" style={{ width: "100%" ,height:"200%",overflow:"scroll"}}>
                <div style={{ width: "100%" }}>
                  <InfiniteScroll
                    dataLength={data.length}
                    next={fetchVideos}
                    hasMore={data.length !== totalResults}
                    loader={<h2>Loading.....</h2>}
                    className="custom-infinite-scroll"
                  >
                    {Array.isArray(data) &&
                      data.map((video, index) => (
                        <div
                          key={index}
                          className="usecontent-post"
                          style={{ display: "flex", flexDirection: "row","cursor":"pointer" }}
                        >
                          <div
                            className="videoscarding"
                            style={{ width: "90%" }}
                          >
                            <Searchvideocard
                              key={index}
                              thumbnail={video.thumbnail}
                              title={video.title}
                              views={video.views}
                              duration={video.duration}
                              owner={owner}
                              videoId={video._id}
                              uploadedAt={getTimeDifference(video.createdAt)}
                            />
                          </div>
                          <div
                            className="videoeditoption"
                            style={{ marginTop: "1rem", marginLeft: "1.5rem" }}
                          >
                            <div
                              className="videoedit"
                              style={{ marginBottom: "1.2rem" }}
                              onClick={() => {
                                seteditcomponent((prev) => !prev);
                                seteditid(video._id);
                              }}
                            >
                              <FaEdit style={{ marginRight: "0.5rem" }} />
                              EDIT
                            </div>
                            <div
                              className="videopublishing"
                              onClick={() => publishvideo(video._id)}
                            >
                              <FaGlobe style={{ marginRight: "0.5rem" }} />
                              PUBLISH
                            </div>
                          </div>
                          {editcomponent && type === "videos" && (
                            <div className="useeditformbox" style={{"position":"fixed"}}>
                              <div
                                className="heading"
                                style={{ marginLeft: "50%" }}
                              >
                                UPDATE DATA
                                <FaTimes
                                  onClick={() => {
                                    seteditcomponent(false);
                                    setupdatedata({});
                                  }}
                                  className="cancelbox"
                                  style={{
                                    marginLeft: "95%",
                                    borderRadius: "5rem",
                                  }}
                                />
                              </div>
                              <form
                                className="formdata"
                                style={{ marginTop: "3rem" }}
                              >
                                <div
                                  className="useeditcontextplaylist"
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyItems: "flex-start",
                                    alignContent: "center",
                                  }}
                                >
                                  <div
                                    className="playlisteditname"
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      marginBottom: "1rem",
                                    }}
                                  >
                                    <label
                                      style={{
                                        width: "8rem",
                                        alignItems: "center",
                                      }}
                                      htmlFor="name"
                                    >
                                      Title
                                    </label>
                                    <input
                                      ref={nameRef}
                                      type="text"
                                      id="name"
                                      placeholder={video.title}
                                    />
                                  </div>
                                  <div
                                    className="playlistdescription"
                                    style={{
                                      marginBottom: "1rem",
                                      display: "flex",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <label
                                      htmlFor="description"
                                      style={{ width: "8rem" }}
                                    >
                                      Description
                                    </label>
                                    <input
                                      ref={descriptionRef}
                                      type="text"
                                      id="description"
                                      placeholder={video.description}
                                    />
                                  </div>
                                  <div
                                    className="playlistdescription"
                                    style={{
                                      marginBottom: "1rem",
                                      display: "flex",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <label
                                      htmlFor="description"
                                      style={{ width: "8rem" }}
                                    >
                                      Video-File
                                    </label>
                                    <input
                                      ref={videoref}
                                      type="file"
                                      id="description"
                                      placeholder={updatedata.description}
                                      style={{
                                        paddingLeft: "55%",
                                        fontSize: ".9rem",
                                        overflow: "hidden",
                                      }}
                                    />
                                  </div>
                                  <div
                                    className="playlistdescription"
                                    style={{
                                      marginBottom: "1rem",
                                      display: "flex",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <label
                                      htmlFor="description"
                                      style={{ width: "8rem" }}
                                    >
                                      Thumbnail
                                    </label>
                                    <input
                                      ref={thumbnailref}
                                      type="file"
                                      id="description"
                                      placeholder={updatedata.description}
                                      style={{
                                        paddingLeft: "55%",
                                        fontSize: ".9rem",
                                        overflow: "hidden",
                                      }}
                                    />
                                  </div>
                                </div>
                                <br></br>
                                <div
                                  className="updatesubmitform"
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="formsubmitbtn"
                                    style={{ marginRight: "1rem" }}
                                    onClick={() => updatevideo(video._id)}
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    className="formsubmitbtn"
                                    onClick={() => deletevideo(video._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      ))}
                  </InfiniteScroll>
                </div>
              </div>
            )}
            {type === "subscribed" && data.length > 0 ? (
              <InfiniteScroll
                dataLength={data.length}
                next={fetchVideos}
                hasMore={data.length !== totalResults}
                loader={<h2>Loading.....</h2>}
                className="custom-infinite-scroll"
              >
                {data.map((channel, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                    className="usecontent-post"
                  >
                    <div className="usecontent-post-header">
                      <img src={channel.avatar} alt="User" />
                      <div className="usecontent-post-info">
                        <p>
                          {channel?.name} •{""}
                          {getTimeDifference(channel.cratedAt)}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <h6 style={{ margin: 0 }}>{channel?.email}</h6>
                          <p style={{ color: "red", margin: 0 }}>
                            {channel?.subscriberCount} Subscribers
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="usecontent-post-stats">
                      <button
                        onClick={() => togglefollow(channel._id)}
                        className="use-content-followsbutton"
                      >
                        Followed
                      </button>
                    </div>
                  </div>
                ))}
              </InfiniteScroll>
            ) :
            <>
            
            </>
            }
            {type === "playlist" && data.length>0? (
              <div className="custom-infinite-scroll">
                <div className="usecontainer">
                  {data.map((playlist, index) => {
                    const totalDuration =
                      playlist.videosInfo?.reduce(
                        (sum, video) => sum + (video.duration || 0),
                        0
                      ) || 0;
                    return (
                      <div
                        key={playlist._id}
                        className="usecardbox"
                        onClick={() => {
                          seteditcomponent((prev) => !prev);
                          setupdatedata(playlist);
                        }}
                      >
                        <div className="useimg">
                          <img
                            src={playlist.videosInfo?.[0]?.thumbnail}
                            alt="Thumbnail"
                          />
                        </div>
                        <div className="useinfo">
                          <div className="useuserprofile">
                            <img
                              src={playlist.owneravatar || "Un-Known"}
                              alt="Owner Avatar"
                            />
                          </div>
                          <div className="userplaylistinfo">
                            <div className="usetitle">
                              {playlist.name || "Un-Named"}
                            </div>
                            <div className="useothers">
                              {totalDuration.toFixed(2)} min @{" "}
                              {playlist.videosInfo?.length || 0} videos
                              <p>{getTimeDifference(playlist.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ):(
              <>
              </>
            )}
          </div>
          {editcomponent && type === "playlist" && (
            <div className="useeditformbox">
              <div className="heading" style={{ marginLeft: "50%" }}>
                UPDATE DATA
                <FaTimes
                  onClick={() => {
                    seteditcomponent(false);
                    setupdatedata({});
                  }}
                  className="cancelbox"
                  style={{ marginLeft: "95%", borderRadius: "5rem" }}
                />
              </div>
              <form className="formdata" style={{ marginTop: "3rem" }}>
                <div
                  className="useeditcontextplaylist"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyItems: "flex-start",
                    alignContent: "center",
                  }}
                >
                  <div
                    className="playlisteditname"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <label
                      style={{ width: "8rem", alignItems: "center" }}
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      id="name"
                      placeholder={updatedata.name}
                    />
                  </div>
                  <div
                    className="playlistdescription"
                    style={{ display: "flex", alignItems: "flex-start" }}
                  >
                    <label htmlFor="description" style={{ width: "8rem" }}>
                      Description
                    </label>
                    <input
                      ref={descriptionRef}
                      type="text"
                      id="description"
                      placeholder={updatedata.description}
                    />
                  </div>
                </div>
                <br></br>
                <div
                  className="updatesubmitform"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="formsubmitbtn"
                    style={{ marginRight: "1rem" }}
                    onClick={() => updatePlaylist()}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="formsubmitbtn"
                    onClick={() => deletePlaylist()}
                  >
                    Delete
                  </button>
                </div>
              </form>
              <div className="formvideodeletats">
                <div className="custom-infinite-scroll">
                  <div className="usecontainer">
                    {Array.isArray(updatedata.videosInfo) &&
                      updatedata.videosInfo.map((video, index) => {
                        const totalDuration = video.duration || 0;
                        return (
                          <div
                            key={video._id}
                            className="usecardbox"
                            onClick={() => {
                              seteditid(video._id);
                              seteditable((prev) => !prev);
                            }}
                            style={{ width: "12rem" }}
                          >
                            {editid === video._id && editable ? (
                              <div className="deleteboxing">
                                <div
                                  className="cancelboxes"
                                  style={{ backgroundColor: "red" }}
                                >
                                  <FaTimes
                                    style={{
                                      zIndex: "1",
                                      marginLeft: "0.5rem",
                                      marginRight: "0.5rem",
                                      width: "1rem",
                                      height: "1rem",
                                    }}
                                  />
                                </div>
                                <div
                                  className="trashing"
                                  onClick={() => deletePlaylistVideo()}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "centre",
                                  }}
                                >
                                  <FaTrash
                                    style={{
                                      zIndex: "1",
                                      padding: "2rem",
                                      marginLeft: "0.5rem",
                                      height: "100%",
                                      width: "100%",
                                    }}
                                  ></FaTrash>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="useimg">
                                  <img src={video.thumbnail} alt="Thumbnail" />
                                </div>
                                <div
                                  className="useinfo"
                                  style={{ width: "16rem" }}
                                >
                                  <div className="userplaylistinfo">
                                    <div className="usetitle">
                                      {video.title || "Un-Named"}
                                    </div>
                                    <div className="useothers">
                                      {totalDuration.toFixed(2)} sec @{" "}
                                      {video.views || 0} views
                                      <p>
                                        {getTimeDifference(video.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export { Content };
