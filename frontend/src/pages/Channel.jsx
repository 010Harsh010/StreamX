import React, { useState, useEffect } from "react";
import "../CSS/searchboxside.css";
import Searchvideocard from "../Component/VideoGrid/Searchvideocard.jsx";
import Lottie from "lottie-react";
import nomore from "../assets/laptopnodata.json";
import { FaArrowUp, FaVideo, FaTwitter } from "react-icons/fa";
import AuthService from "../Server/auth.js";
import { useParams } from "react-router-dom";
import loadings from "../assets/searchinguser.json";
import { others } from "../Server/others.js";
function Channel() {
  const auth = new AuthService();
  const other = new others();
  const { userId } = useParams();
  const searchuser = decodeURIComponent(userId);
  const [loading, setloading] = useState(true);
  const [user, setuser] = useState({});
  const [isfollowed, setisfollowed] = useState(false);
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

  const [type, settype] = useState("videos");
  const [uplift, setuplift] = useState(false);

  const totalviews = () => {
    let sum = 0;
    user.videos.map((video) => {
      sum += video.views;
    });
    return sum;
  };

  const fetchuserdetails = async () => {
    try {
      let response;

      if (searchuser.includes("@")) {
        response = await auth.searchUser({ email: searchuser });
      } else {
        response = await auth.searchUser({ username: searchuser });
      }
      if (!response) {
        throw new Error("Unable to fetch user details");
      }
      const data = response.data;
      setuser(data);
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };
  const setfollowinguser = async () => {
    try {
      const issubscribed = await other.issubscribed({
        channelId: user?.user?._id,
      });
      if (issubscribed.data.isSubscribed) {
        setisfollowed(false);
      } else {
        setisfollowed(true);
      }
    } catch {
      console.log(error);
    }
  };
  const togglefollow = async () => {
    try {
      if (!user?.user?._id) {
        return;
      }
      const response = await other.subscribe({ channelId: user.user._id });
      if (!response) {
        throw new Error("Unable to toggle follow");
      }
      setisfollowed((prev) => !prev);
    } catch (error) {
      console.log(error);
      setisfollowed(false);
    }
  };
  useEffect(() => {
    if (user?.user?._id) {
      setfollowinguser();
    }
  }, [user]);
  useEffect(() => {
    fetchuserdetails();
  }, [searchuser]);

  if (loading || !user?.user) {
    return (
      <div className="nodata" style={{ textAlign: "center" }}>
        <Lottie
          style={{ height: "25rem" }}
          animationData={loadings}
          loop={true}
        />
        <h1 style={{ color: "white" }}>Loading ... </h1>
      </div>
    );
  }
  return (
    <div className="userprofile">
      harsh
      <div
        className="sett-container"
        style={{ overflow: "hidden", marginTop: "3rem" }}
      >
        <div className="sett-header">
          <div className="sett-banner"></div>
          <div className="settuserinfobox">
            <img
              src={user?.user?.avatar || "/user.jpg"}
              alt="Profile"
              className="sett-avatar"
              style={{ width: "13%", zIndex: "1" }}
            />
            <div
              className="sett-name"
              style={{ width: "87%", paddingTop: "5rem", color: "white" }}
            >
              <h2>
                {user.user.fullName.split(" ")[0] || "Guest"}{" "}
                {user.user.fullName.split(" ")[1] || "User"}{" "}
                <span>{`( Since ${getTimeDifference(
                  user?.user?.createdAt || Date()
                )})`}</span>
              </h2>
              <p>{user?.user?.email || "email.com"}</p>
              <button className="sett-view-btn" onClick={() => togglefollow()}>
                {isfollowed ? "Followed" : "Follow"}
              </button>
            </div>
          </div>
        </div>
        <div className={`aboutsuser ${uplift && "upsiding"}`}>
          <h3 className="description-title">About Channel</h3>
          <div className="descriptionuser">
            <span>Description : </span>
            {user?.user?.description || ""}
          </div>
          <div className="aboutsuserssub">
            <div className="subsubinfo">
              <p>
                <span className="stat-label">Subscribers:</span>
                <span className="stat-value">
                  {user?.subscriber?.subscribersCount || "0"}
                </span>
              </p>
              <p>
                <span className="stat-label">Subscribed:</span>
                <span className="stat-value">
                  {user?.subscriber?.subscribedCount || "0"}
                </span>
              </p>
            </div>
            <div className="totalallinfo">
              <p>
                <span className="stat-label">Total Videos:</span>
                <span className="stat-value">
                  {user?.videos?.length || "0"}
                </span>
              </p>
              <p>
                <span className="stat-label">Total Views:</span>
                <span className="stat-value">{totalviews() || "0"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="scrollingbox" style={{ color: "white" }}>
          <FaArrowUp
            className="lifs"
            onClick={() => setuplift((prev) => !prev)}
          />
          <span>{uplift ? "Read Less" : "Read More"}</span>
        </div>

        {/* Profile Info Section */}
        <div className="sett-section">
          <div className="usecontent-tabs">
            <button
              style={{
                ...(type === "videos" ? { borderColor: "red" } : {}),
              }}
              onClick={() => settype("videos")}
            >
              {" "}
              <FaVideo style={{ marginRight: "1rem" }} />
              Videos
            </button>
            <button onClick={() => settype("tweet")}>
              <FaTwitter style={{ marginRight: "1rem" }}></FaTwitter>Tweet
            </button>
          </div>
          {type === "videos" && user?.videos?.length > 0 ? (
            <div style={{ maxHeight: "40rem", overflow: "scroll" }}>
              {Array.isArray(user?.videos) &&
                user?.videos?.map((video, index) => (
                  <div
                    key={index}
                    className="usecontent-post"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      margin: "1rem 0",
                    }}
                  >
                    <div
                      className="videoscarding"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                      }}
                    >
                      <Searchvideocard
                        key={index}
                        thumbnail={video?.thumbnail || "/user.jpg"}
                        title={video?.title || "UnTitled"}
                        views={video?.views || "0"}
                        duration={video?.duration || "0"}
                        owner={user?.user?.avatar || "User"}
                        videoId={video?._id || 1}
                        uploadedAt={getTimeDifference(
                          video?.createdAt || Date()
                        )}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="nodata" style={{ textAlign: "center" }}>
              <Lottie
                style={{ height: "25rem" }}
                animationData={nomore}
                loop={true}
              />
              <h1 style={{ color: "white" }}>No Data Found</h1>
            </div>
          )}
          {type === "tweet" && (
            <div style={{ maxHeight: "40rem", overflow: "scroll" }}>
              <div style={{ marginTop: "2rem" }} className="commentslist">
                {user?.tweets?.length > 0 ? (
                  user?.tweets?.map((tweet, index) => (
                    <div key={index} className="commentBox">
                      <div className="imageBox">
                        <img
                          src={user?.user?.avatar || "/user.jpg"}
                          alt="coverImage"
                        />
                      </div>
                      <div
                        className="contentBox"
                        style={{ backgroundColor: "transparent" }}
                      >
                        <div
                          className="ownerInfo"
                          style={{ backgroundColor: "transparent" }}
                        >
                          {user?.user?.fullName || "User"}
                        </div>
                        <div
                          className="shownComment"
                          style={{ backgroundColor: "transparent" }}
                        >
                          {tweet?.content || ""}
                        </div>
                        <div
                          className="timeStamp"
                          style={{ backgroundColor: "transparent" }}
                        >
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
                    <h1 style={{ color: "white" }}>No Data Found</h1>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Channel;
