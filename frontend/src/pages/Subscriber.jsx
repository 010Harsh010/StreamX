import React, { useState, useEffect } from "react";
import "../CSS/login.css";
import { others } from "../Server/others";
import { useSelector } from "react-redux";
import { useSidebar } from "../contextApi/SidebarContext";
import Lottie from "lottie-react";
import nomore from "../assets/womennodata.json";

function Subscriber() {
  const other = new others();
  const [owner, setowner] = useState({});
  const { sidebarVisible } = useSidebar();
  const [Subscriber, setSubscriber] = useState([]);
  const [currentsub, setcurrentsub] = useState({});
  const user = useSelector((state) => state.userReducer.currentUser);

  const toggleFollow = async (channelId) => {
    try {
      const response = await other.subscribe({ channelId: channelId });
      if (!response) throw new Error("Unable to toggle follow");

      setSubscriber((prev) =>
        prev.map((channel) => {
          if (channel.subId === channelId) {
            return {
              ...channel,
              subscriberCount:
                response.message === "Subscription Successful"
                  ? channel.subscriberCount + 1
                  : channel.subscriberCount - 1,
              isFollowedByUser: !channel.isFollowedByUser, 

            };
          }
          return channel;
        })
      );
      // console.log(Subscriber);
      

      // setFollowed((prev) => !prev);
    } catch (error) {
      console.log(
      "Error toggling follow, please try again.",error);
    }
  };

  const fetchsubscriber = async () => {
    try {
      if (!owner._id) {
        return;
      }
      // console.log("fetching");

      const response = await other.subscriberdetails({ userId: owner._id });

      if (!response) {
        throw new Error("Unable to fetch Response");
      }
      setSubscriber(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setowner(user);
    fetchsubscriber();
  }, [user, owner]);

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
    <div
      className="sub-inner"
      style={{
        backgroundColor: "black",
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        ...(sidebarVisible && { marginLeft: "250px", width: "calc(100% - 250px)" }),
      }}
    >
      <div
        className={`sub-memberinfo ${sidebarVisible && "sub-inner-sidebar"}`}
        style={{
          height: "100vh",
          width: "40%",
          border: "1px solid black",
          paddingTop: "4rem",
          overflow: "hidden",
        }}
      >
        <div className="sub-bigimage" style={{ width: "100%", height: "40%" }}>
          <img
            src={currentsub.avatar?currentsub?.avatar:"/user.jpg"}
            style={{ width: "100%", height: "100vh" ,objectFit:"cover"}}
          />
        </div>
        <div
          className="sub-userinfo"
          style={{ color: "white", bottom:"0" , display:"flex",justifyContent:"flex-end",alignContent:"flex-end", fontSize: "1rem" }}
        >
          <h2 className="userbigname" >{currentsub?.name || "User"}</h2>
          <p>
            Member since {getTimeDifference(currentsub?.memberfrom) || Date()}
          </p>
          <p>Subscribe Since {getTimeDifference(currentsub.createdAt)} </p>
        </div>
      </div>
      <div className="sub-allmemberinfo">
        {Subscriber.length>0 ? Subscriber.map((channel, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
            className="usecontent-post"
          >
            <div
              className="usecontent-post-header"
              onClick={() =>
                setcurrentsub({
                  id: channel.subId,
                  name: channel.subname,
                  createdAt: channel.createdAt,
                  Subscribercount: channel.Subscribercount,
                  memberfrom: channel.subcreated,
                  avatar: channel.subavatar,
                })
              }
            >
              <img src={channel.subavatar} alt="User" />
              <div className="usecontent-post-info">
                <p>
                  {channel?.subname} •{""}
                  {getTimeDifference(channel.createdAt)}
                </p>
                <div
                className="memberssubinfods"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <h6 style={{ margin: 0 }}>{channel?.subemail}</h6>
                  <p style={{ color: "red", margin: 0 }}>
                    {channel?.subscriberCount} Subscribers
                  </p>
                </div>
              </div>
            </div>
            <div className={`channelfollowbuttons ${channel.isFollowedByUser && "channelfollowed"}`}>
              <button
                onClick={() => toggleFollow(channel.subId)}
              >
                {channel.isFollowedByUser ? "Followed" : "Follow"}
              </button>
            </div>
          </div>
        )):(
          <div className="no-data" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Lottie animationData={nomore} style={{ height: "25rem" }} />
            <h1>No Subscribers</h1>
          </div>

        )}
      </div>
    </div>
  );
}

export default Subscriber;
