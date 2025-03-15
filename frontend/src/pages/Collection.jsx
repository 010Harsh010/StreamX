import React, { useState, useEffect, useRef } from "react";
import { useSidebar } from "../contextApi/SidebarContext";
import "../CSS/content.css";
import LongVideoCard from "../Component/VideoGrid/Searchvideocard";
import { others } from "../Server/others.js";
import { useSelector } from "react-redux";
import { FaTimes } from "react-icons/fa";
import Lottie from "lottie-react";
import nomore from "../assets/Nomorevideos.json";
import lapnodata from "../assets/laptopnodata.json"
import loadings from "../assets/circleloading.json"
const Collection = () => {
  //  defining varible
  const { sidebarVisible } = useSidebar();
  const [Playlist, setPlaylist] = useState([]);
  const [owner, setowner] = useState({});
  const user = useSelector((state) => state.userReducer.currentUser);
  const other = new others();
  const [loading, setloading] = useState(true);
  const [listno, setlistno] = useState(0);
  const [createform, setcreateform] = useState(false);
  const [updatedata, setupdatedata] = useState({
    name: "",
    description: "",
  });

  //   functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setupdatedata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const fetchplaylist = async () => {
    setloading(true);
    try {
      if (!owner._id) {
        return;
      }
      const response = await other.getPlaylistByUserId({ userId: owner._id });
      if (!response) {
        throw new Error("Unable to fetch Playlist.");
      }
      setPlaylist(response.data);
      // fetchplaylist();
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const createPlaylist = async () => {
    try {
      console.log("Creating Playlist...");
      // alert("created");
      const response = await other.createPlaylist({
        name: updatedata.name,
        description: updatedata.description,
      });
      if (!response) {
        throw new Error("No playlist created");
      }
      // Fetch updated playlists
      fetchplaylist();
      // Reset form and close it
      setupdatedata({
        name: "",
        description: "",
      });
      setcreateform(false);
      // console.log("Playlist created successfully");
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };
  useEffect(() => {
    setowner(user);
    fetchplaylist();
  }, [user]);
  useEffect(() => {
    fetchplaylist();
  }, [owner]);

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
  const totaltime = () => {
    return (
      Playlist?.reduce((total, playlist) => {
        const videoDurations = playlist?.videosInfo?.reduce((sum, video) => {
          return sum + (video?.duration || 0); // Sum up video durations
        }, 0);
        return total + videoDurations; // Add playlist durations to total
      }, 0) || 0
    ); // Fallback to 0 if Playlist is undefined
  };
  if (loading) {
    return (
      <div className="loading" style={{height:"100vh",width:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Lottie animationData={loadings} loop={true}/>
      </div>
    );
  } else {
    return (
      <>
        hello
        {createform && (
          <div className="Innerformbox" style={{ display: "flex" ,zIndex: "999",marginTop: "6rem",position:"fixed",alignItems:"center",justifyContent:"center",width:"100%",height:"100%",backgroundColor:"rgba(0,0,0,0.7)"}}>
            <div
              className="coll-innerinfo"
              style={{
                padding: "1rem",
                backgroundColor:"rgba(0,0,0,0.7)",
                height: "50vh",
                color: "white",
                borderWidth: "1px",
                borderColor: "black",
                borderStyle: "solid",
                borderRadius: "3rem",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <div
                className="crosssign"
                style={{ marginLeft: "95%", color: "red", cursor: "pointer" }}
              >
                <FaTimes onClick={() => setcreateform(false)} />
              </div>
              <h4 style={{ marginLeft: "25%" }}>Create Playlist</h4>
              <div className="takeinfoname" style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "1.2rem" }}>Name</label>
                <input
                  name="name"
                  type="text"
                  value={updatedata.name}
                  onChange={handleInputChange}
                />
              </div>
              <div
                className="takeinfodescription"
                style={{ marginBottom: "1rem" }}
              >
                <label style={{ fontSize: "1.2rem" }}>Description</label>
                <input
                  name="description"
                  type="text"
                  value={updatedata.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="createbutton" style={{ marginBottom: "1rem" }}>
                <button className="innercreatebutton" onClick={createPlaylist}>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="smallerinnerinfo">
          <div className="buttonsupper">
            <button onClick={() => setcreateform((prev) => !prev)}>
              Create
            </button>
          </div>
        </div>
        <div
          className="coll-innerbody"
          style={{
            backgroundColor: "black",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            height: "100%",
            overflow: "hidden",
            ...(sidebarVisible && { marginLeft: "250px", position: "fixed" }),
          }}
        >
          {!createform && (
            <div
              className={`coll-playlistsinfo ${sidebarVisible && "sideing"}`}
              style={{
                width: "70%",
                backgroundColor: "transparent",
                height: "100%",
                ...(sidebarVisible && { width: "0" }),
              }}
            >
              <div
                className="coll-innerinfo"
                style={{
                  padding: "1rem",
                  backgroundColor: "transparent",
                  height: "85vh",
                  borderWidth: "1px",
                  borderColor: "black",
                  borderStyle: "solid",
                  borderRadius: "4px",
                }}
              >
                <div
                  className="coll-playlistimage"
                  style={{
                    width: "100%",
                    height: "40%",
                    overflow: "hidden",
                    paddingBottom: "1rem",
                    borderBottom: "2px solid purple",
                  }}
                >
                  <img
                    src={Playlist[0]?.videosInfo[0]?.thumbnail || owner?.avatar || "/user.jpg"}
                    alt="playlist images"
                    style={{
                      objectFit: "cover",
                      height: "100%",
                      width: "100%",
                      borderRadius: "1rem",
                    }}
                  />
                </div>
                <div
                  className="coll-allplaylistinfo"
                  style={{
                    color: "white",
                    paddingTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <div
                    className="coll-title"
                    style={{
                      margintop: "1rem",
                      color: "red",
                      fontSize: "2rem",
                      display: "flex",
                      flexDirection: "row",
                      alignContent: "space-evenly",
                    }}
                  >
                    Playlist
                  </div>
                  <div
                    className="coll-playlistinfo"
                    style={{ marginTop: "1rem" }}
                  >
                    <h5>Total {Playlist?.length} Playlist</h5>
                    <h5>{totaltime().toFixed(2)} min Duration</h5>
                  </div>
                </div>
                <div className="create">
                  <button
                    className="coll-createbutton"
                    onClick={() => setcreateform((prev) => !prev)}
                  >
                    {" "}
                    Create{" "}
                  </button>
                </div>
              </div>
            </div>
          )}
          {createform && (
            <div
              className="coll-playlistsinfo"
              style={{
                width: "70%",
                backgroundColor: "transparent",
                height: "100%",
                ...(sidebarVisible && { width: "0", display: "none" }),
              }}
            >
              <div
                className="coll-innerinfo"
                style={{
                  padding: "1rem",
                  backgroundColor: "transparent",
                  height: "50vh",
                  color: "white",
                  borderWidth: "1px",
                  borderColor: "black",
                  borderStyle: "solid",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <div
                  className="crosssign"
                  style={{ marginLeft: "95%", color: "red", cursor: "pointer" }}
                >
                  <FaTimes onClick={() => setcreateform(false)} />
                </div>
                <h4 style={{ marginLeft: "25%" }}>Create Playlist</h4>
                <div className="takeinfoname" style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "1.2rem" }}>Name</label>
                  <input
                    name="name"
                    type="text"
                    value={updatedata.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div
                  className="takeinfodescription"
                  style={{ marginBottom: "1rem" }}
                >
                  <label style={{ fontSize: "1.2rem" }}>Description</label>
                  <input
                    name="description"
                    type="text"
                    value={updatedata.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="createbutton" style={{ marginBottom: "1rem" }}>
                  <button
                    className="innercreatebutton"
                    onClick={createPlaylist}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            className="coll-playlistlist"
            style={{
              backgroundColor: "black",
              width: "80%",
              height: "100%",
              borderLeft: "1px solid white",
              borderRight: "1px solid white",
              ...(sidebarVisible && { width: "40%" }),
            }}
          >
            <div
              className="custom-infinite-scroll"
              style={{ backgroundColor: "black", height: "1000vh" }}
            >
              <div
                className="zusecontainer"
                style={{ margin: "0", height: "60vh" }}
              >
                {Array.isArray(Playlist) && 
                Playlist.length > 0 ?
                  Playlist.map((playlist, index) => {
                    const totalDuration =
                      playlist?.videosInfo?.reduce(
                        (sum, video) => sum + (video.duration || 0),
                        0
                      ) || 0;
                    return (
                      <div
                        key={index}
                        className="usecardbox"
                        onClick={() => {
                          setlistno(index);
                        }}
                        style={{
                          margintop: "0",
                          height: "15rem",
                          color: "white",
                        }}
                      >
                        <div className="useimg">
                          <img
                            src={playlist?.videosInfo?.[0]?.thumbnail}
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
                              {playlist?.videosInfo?.length || 0} videos
                              <p>{getTimeDifference(playlist.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }):<div className="nodata" style={{ textAlign: "center",height:"100%" ,width:"100%",margintop:"10rem"}}>
                  <Lottie
                    style={{ height: "100%" }}
                    animationData={lapnodata}
                    loop={true}
                  />
                  <div>
                    <h1 style={{fontFamily:"monospace"}}>No Playlist Avaliable</h1>
                  </div>
                </div>}
              </div>
            </div>
          </div>
          <div
            className="playlistvideos"
            style={{
              borderLeft: "1px solid white",
              width: "100%",
              backgroundColor: "black",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <div
              className="lists"
              style={{
                height: "100%",
                paddingLeft: "1rem",
                overflow: "scroll",
                paddingRight: "0.5rem",
              }}
            >
              {Playlist[listno]?.videosInfo?.length > 0 ? (
                Playlist[listno]?.videosInfo.map((video) => (
                  <LongVideoCard
                    key={video?._id}
                    videoId={video?._id}
                    title={video?.videos?.title}
                    channel={Playlist[listno]?.ownername}
                    views={video?.views}
                    timeAgo={getTimeDifference(video?.createdAt)}
                    duration={video?.duration}
                    thumbnail={video?.thumbnail}
                  />
                ))
              ) : (
                <div className="nodata" style={{ textAlign: "center" }}>
                <Lottie
                  style={{ height: "25rem" }}
                  animationData={nomore}
                  loop={true}
                />
                <h1 style={{fontFamily:"monospace"}}>No Videos Avaliable</h1>
              </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default Collection;
